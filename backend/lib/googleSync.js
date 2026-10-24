const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const DIRECTORY_API = 'https://admin.googleapis.com/admin/directory/v1';

class GoogleWorkspaceSync {
    constructor(config) {
        this.domain = config.domain || process.env.GOOGLE_ALLOWED_DOMAIN || 'roboetech.com';
        this.clientId = config.clientId || process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    }

    async getTokenFromCode(code) {
        const oauth2 = new OAuth2Client(this.clientId, this.clientSecret, 'postmessage');
        const { tokens } = await oauth2.getToken(code);
        return tokens;
    }

    async listUsers(accessToken) {
        const users = [];
        let pageToken = '';

        do {
            const url = `${DIRECTORY_API}/users?domain=${this.domain}&maxResults=500&projection=basic` +
                (pageToken ? `&pageToken=${pageToken}` : '');
            const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(`Google API error ${res.status}: ${err}`);
            }

            const data = await res.json();
            if (data.users) {
                for (const u of data.users) {
                    users.push({
                        email: u.primaryEmail,
                        username: u.primaryEmail.split('@')[0],
                        fullName: u.name?.fullName || '',
                        suspended: u.suspended || false,
                        archived: u.archived || false,
                        orgUnitPath: u.orgUnitPath || '/',
                        lastLoginTime: u.lastLoginTime,
                    });
                }
            }
            pageToken = data.nextPageToken || '';
        } while (pageToken);

        return users;
    }
}

module.exports = { GoogleWorkspaceSync };
