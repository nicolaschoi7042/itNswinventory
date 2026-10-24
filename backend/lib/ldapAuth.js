const { Client } = require('ldapts');

// ldapts returns empty attributes as [] (truthy in JS).
// pg driver converts [] to PostgreSQL '{}'. Extract a real string or ''.
const ldapStr = v =>
    (typeof v === 'string' && v) ? v :
    (Array.isArray(v) && v.length > 0) ? String(v[0]) : '';

class LDAPAuth {
    constructor(config) {
        this.config = {
            server: config.server || process.env.LDAP_SERVER,
            bindDN: config.bindDN || process.env.LDAP_BIND_DN,
            bindPassword: config.bindPassword || process.env.LDAP_BIND_PASSWORD,
            userBase: config.userBase || process.env.LDAP_USER_BASE,
            groupBase: config.groupBase || process.env.LDAP_GROUP_BASE,
            userFilter: config.userFilter || process.env.LDAP_USER_FILTER || '(|(cn=%s)(uid=%s)(sAMAccountName=%s))',
            groupFilter: config.groupFilter || process.env.LDAP_GROUP_FILTER || '(member=%s)',
            userFullnameAttr: config.userFullnameAttr || process.env.LDAP_USER_FULLNAME_ATTR || 'cn',
            userEmailAttr: config.userEmailAttr || process.env.LDAP_USER_EMAIL_ATTR || 'mail'
        };
    }

    /**
     * Authenticate user against LDAP
     * @param {string} username - Username to authenticate
     * @param {string} password - Password to verify
     * @returns {Object|null} User object if authenticated, null otherwise
     */
    async authenticate(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const client = new Client({
            url: this.config.server,
            timeout: 10000,
            connectTimeout: 10000,
        });

        try {
            // Bind with admin credentials to search for user
            await client.bind(this.config.bindDN, this.config.bindPassword);

            // Search for user
            const userFilter = this.config.userFilter.replace(/%s/g, username);
            console.log(`🔍 LDAP: Searching for user with filter: ${userFilter}`);
            
            const searchOptions = {
                scope: 'sub',
                filter: userFilter,
                attributes: [
                    'dn',
                    'uid',
                    'cn',
                    'sn',
                    'givenName',
                    'displayName',
                    this.config.userFullnameAttr,
                    this.config.userEmailAttr,
                    'memberOf',
                    'objectClass'
                ]
            };

            const searchResult = await client.search(this.config.userBase, searchOptions);
            const users = searchResult.searchEntries;

            if (users.length === 0) {
                console.log(`❌ LDAP: User ${username} not found`);
                return null;
            }

            if (users.length > 1) {
                console.log(`⚠️ LDAP: Multiple users found for ${username}, using first match`);
            }

            const user = users[0];
            const userDN = user.dn;
            console.log(`✅ LDAP: Found user: ${userDN}`);

            // Unbind admin connection
            await client.unbind();

            // Create new connection to authenticate the user
            const userClient = new Client({
                url: this.config.server,
                timeout: 10000,
                connectTimeout: 10000,
            });

            try {
                // Try to bind with user credentials
                await userClient.bind(userDN, password);
                console.log(`✅ LDAP: User ${username} authenticated successfully`);
                
                // Get user groups
                const groups = await this.getUserGroups(userDN);
                
                // Build user object
                const authenticatedUser = {
                    username: user.uid || user.cn || username,
                    dn: userDN,
                    fullName: ldapStr(user.displayName) || `${ldapStr(user.givenName)} ${ldapStr(user.sn)}`.trim() || ldapStr(user[this.config.userFullnameAttr]) || ldapStr(user.cn),
                    email: user[this.config.userEmailAttr] || '',
                    groups: groups,
                    role: this.determineRole(groups),
                    ldapAttributes: {
                        cn: user.cn,
                        uid: user.uid,
                        sn: user.sn,
                        givenName: user.givenName,
                        displayName: user.displayName,
                        memberOf: user.memberOf
                    }
                };

                await userClient.unbind();
                return authenticatedUser;

            } catch (bindError) {
                console.log(`❌ LDAP: Authentication failed for ${username}: ${bindError.message}`);
                await userClient.unbind();
                return null;
            }

        } catch (error) {
            console.error(`❌ LDAP: Error during authentication for ${username}:`, error.message);
            throw new Error(`LDAP authentication failed: ${error.message}`);
        } finally {
            try {
                await client.unbind();
            } catch (unbindError) {
                console.warn('LDAP: Warning during unbind:', unbindError.message);
            }
        }
    }

    /**
     * Get user groups from LDAP
     * @param {string} userDN - User Distinguished Name
     * @returns {Array} Array of group names
     */
    async getUserGroups(userDN) {
        if (!this.config.groupBase) {
            console.log('🔍 LDAP: No group base configured, skipping group lookup');
            return [];
        }

        const client = new Client({
            url: this.config.server,
            timeout: 10000,
            connectTimeout: 10000,
        });

        try {
            await client.bind(this.config.bindDN, this.config.bindPassword);

            const groupFilter = this.config.groupFilter.replace(/%s/g, userDN);
            console.log(`🔍 LDAP: Searching for groups with filter: ${groupFilter}`);

            const searchOptions = {
                scope: 'sub',
                filter: groupFilter,
                attributes: ['cn', 'description']
            };

            const searchResult = await client.search(this.config.groupBase, searchOptions);
            const groups = searchResult.searchEntries.map(group => group.cn);

            console.log(`✅ LDAP: Found ${groups.length} groups for user: ${groups.join(', ')}`);
            return groups;

        } catch (error) {
            console.warn(`⚠️ LDAP: Could not retrieve groups for ${userDN}:`, error.message);
            return [];
        } finally {
            try {
                await client.unbind();
            } catch (unbindError) {
                console.warn('LDAP: Warning during unbind:', unbindError.message);
            }
        }
    }

    /**
     * Determine user role based on group membership
     * @param {Array} groups - Array of group names
     * @returns {string} User role
     */
    determineRole(groups) {
        // Define role mapping based on group membership
        const roleMapping = {
            'admin': ['administrators', 'it-admin', 'domain admins', 'inventory-admin'],
            'manager': ['managers', 'it-managers', 'inventory-managers', 'supervisors'],
            'user': ['users', 'employees', 'staff', 'inventory-users']
        };

        // Check for admin role first
        for (const group of groups) {
            const groupLower = group.toLowerCase();
            if (roleMapping.admin.some(adminGroup => groupLower.includes(adminGroup.toLowerCase()))) {
                return 'admin';
            }
        }

        // Check for manager role
        for (const group of groups) {
            const groupLower = group.toLowerCase();
            if (roleMapping.manager.some(managerGroup => groupLower.includes(managerGroup.toLowerCase()))) {
                return 'manager';
            }
        }

        // Default to user role
        return 'user';
    }

    /**
     * Get all users from LDAP directory
     * @returns {Array} Array of user objects
     */
    async getAllUsers() {
        const client = new Client({
            url: this.config.server,
            timeout: 30000,
            connectTimeout: 30000,
        });

        try {
            // Bind with admin credentials
            await client.bind(this.config.bindDN, this.config.bindPassword);

            // Search for all users
            const searchOptions = {
                scope: 'sub',
                filter: '(objectClass=person)', // 모든 person 객체 검색
                attributes: [
                    'dn', 
                    'uid', 
                    'cn', 
                    'sn', 
                    'givenName', 
                    'mail', 
                    'sAMAccountName',
                    'userPrincipalName',
                    'displayName'
                ]
            };

            console.log('🔍 LDAP: Searching for all users...');
            const searchResult = await client.search(this.config.userBase, searchOptions);
            const users = [];

            for (const entry of searchResult.searchEntries) {
                try {
                    // 사용자명 결정 (우선순위: sAMAccountName > uid > cn)
                    const username = entry.sAMAccountName || entry.uid || entry.cn;

                    // 전체 이름 결정 (우선순위: displayName > givenName+sn > cn)
                    const fullName = ldapStr(entry.displayName) || `${ldapStr(entry.givenName)} ${ldapStr(entry.sn)}`.trim() || ldapStr(entry[this.config.userFullnameAttr]) || ldapStr(entry.cn) || username;
                    
                    // 이메일 결정
                    const email = entry[this.config.userEmailAttr] || entry.mail || entry.userPrincipalName || '';

                    if (username && fullName) {
                        // 그룹 멤버십으로 역할 결정
                        const groups = await this.getUserGroups(entry.dn);
                        const role = this.determineRole(groups);

                        users.push({
                            username: username,
                            fullName: fullName,
                            email: email,
                            role: role,
                            groups: groups,
                            dn: entry.dn
                        });
                    }
                } catch (userError) {
                    console.warn(`⚠️ LDAP: Error processing user ${entry.dn}:`, userError.message);
                }
            }

            console.log(`✅ LDAP: Found ${users.length} users`);
            return users;

        } catch (error) {
            console.error('❌ LDAP: Error getting all users:', error.message);
            throw new Error(`LDAP 사용자 목록을 가져올 수 없습니다: ${error.message}`);
        } finally {
            try {
                await client.unbind();
            } catch (unbindError) {
                console.warn('LDAP: Warning during unbind:', unbindError.message);
            }
        }
    }

    /**
     * Test LDAP connection
     * @returns {boolean} True if connection successful
     */
    async testConnection() {
        const client = new Client({
            url: this.config.server,
            timeout: 5000,
            connectTimeout: 5000,
        });

        try {
            await client.bind(this.config.bindDN, this.config.bindPassword);
            console.log('✅ LDAP: Connection test successful');
            await client.unbind();
            return true;
        } catch (error) {
            console.error('❌ LDAP: Connection test failed:', error.message);
            return false;
        }
    }
}

module.exports = { LDAPAuth };