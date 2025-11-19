# LDAP Authentication Setup Guide

This guide explains how to configure LDAP authentication for the IT Inventory Management System.

## Features

- **Dual Authentication**: Supports both LDAP and local database authentication
- **Automatic User Creation**: LDAP users are automatically created in the local database
- **Role Mapping**: User roles are determined based on LDAP group membership
- **Flexible Filters**: Supports multiple username formats (cn, uid, sAMAccountName, mail)
- **Backward Compatibility**: Local admin account remains functional

## Configuration Steps

### 1. Enable LDAP Authentication

Edit your `.env` file in the `backend` directory:

```bash
# Enable LDAP
LDAP_ENABLED=true

# LDAP Server Configuration
LDAP_SERVER=ldap://your-ldap-server.com:389
LDAP_BIND_DN=cn=admin,dc=company,dc=com
LDAP_BIND_PASSWORD=your-admin-password
```

### 2. Configure User and Group Base DNs

```bash
# User and Group Base DNs
LDAP_USER_BASE=ou=users,dc=company,dc=com
LDAP_GROUP_BASE=ou=groups,dc=company,dc=com
```

### 3. Set Search Filters

For **OpenLDAP/Generic LDAP**:
```bash
LDAP_USER_FILTER=(|(cn=%s)(uid=%s)(mail=%s))
LDAP_GROUP_FILTER=(member=%s)
```

For **Active Directory**:
```bash
LDAP_USER_FILTER=(|(cn=%s)(sAMAccountName=%s)(userPrincipalName=%s))
LDAP_GROUP_FILTER=(member=%s)
```

### 4. Configure Attribute Mapping

```bash
# Attribute mapping
LDAP_USER_FULLNAME_ATTR=cn          # or displayName for AD
LDAP_USER_EMAIL_ATTR=mail
```

## Example Configurations

### OpenLDAP Configuration

```bash
LDAP_ENABLED=true
LDAP_SERVER=ldap://openldap.company.com:389
LDAP_BIND_DN=cn=admin,dc=company,dc=com
LDAP_BIND_PASSWORD=admin123
LDAP_USER_BASE=ou=users,dc=company,dc=com
LDAP_GROUP_BASE=ou=groups,dc=company,dc=com
LDAP_USER_FILTER=(|(cn=%s)(uid=%s)(mail=%s))
LDAP_GROUP_FILTER=(member=%s)
LDAP_USER_FULLNAME_ATTR=cn
LDAP_USER_EMAIL_ATTR=mail
```

### Active Directory Configuration

```bash
LDAP_ENABLED=true
LDAP_SERVER=ldap://ad.company.com:389
LDAP_BIND_DN=CN=LDAP Service,OU=Service Accounts,DC=company,DC=com
LDAP_BIND_PASSWORD=ServiceAccountPassword
LDAP_USER_BASE=OU=Users,DC=company,DC=com
LDAP_GROUP_BASE=OU=Groups,DC=company,DC=com
LDAP_USER_FILTER=(|(cn=%s)(sAMAccountName=%s)(userPrincipalName=%s))
LDAP_GROUP_FILTER=(member=%s)
LDAP_USER_FULLNAME_ATTR=displayName
LDAP_USER_EMAIL_ATTR=mail
```

## Role Mapping

Users are automatically assigned roles based on their LDAP group membership:

### Admin Role
Groups containing these keywords (case-insensitive):
- administrators
- it-admin
- domain admins
- inventory-admin

### Manager Role
Groups containing these keywords (case-insensitive):
- managers
- it-managers
- inventory-managers
- supervisors

### User Role (Default)
Groups containing these keywords or any other groups:
- users
- employees
- staff
- inventory-users

## Testing LDAP Configuration

### 1. Check LDAP Connection

Use the admin API endpoint to test LDAP connection:

```bash
GET /api/auth/ldap/test
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "enabled": true,
  "connected": true,
  "config": {
    "server": "ldap://your-server:389",
    "userBase": "ou=users,dc=company,dc=com",
    "groupBase": "ou=groups,dc=company,dc=com"
  }
}
```

### 2. Test User Authentication

Try logging in with LDAP credentials through the web interface or API:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "user-password"
}
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check firewall settings
   - Verify LDAP server address and port
   - Ensure network connectivity

2. **Authentication Failed**
   - Verify bind DN and password
   - Check user base DN configuration
   - Confirm user filter syntax

3. **User Not Found**
   - Check user base DN
   - Verify user filter includes correct attributes
   - Ensure user exists in LDAP

4. **Groups Not Loading**
   - Verify group base DN
   - Check group filter syntax
   - Ensure user is member of groups

### Debug Mode

Enable detailed logging by checking the server console output. LDAP operations are logged with prefixes:
- `🔍 LDAP:` - Search operations
- `✅ LDAP:` - Successful operations
- `❌ LDAP:` - Failed operations
- `⚠️ LDAP:` - Warnings

## Security Considerations

1. **Use Service Account**: Create a dedicated LDAP service account with minimal permissions
2. **LDAPS**: Use LDAPS (LDAP over SSL) for production: `ldaps://server:636`
3. **Network Security**: Ensure LDAP traffic is secured within your network
4. **Regular Rotation**: Rotate service account passwords regularly

## Fallback Authentication

The system maintains backward compatibility:
- Local admin account (`admin/admin123`) always works
- LDAP users are created in local database for consistency
- If LDAP is unavailable, local authentication is still functional

## Integration Notes

- LDAP users are automatically created/updated in the local database
- User information is synchronized on each login
- Role assignments are updated based on current group membership
- Activity logging includes authentication method (LDAP vs Local)