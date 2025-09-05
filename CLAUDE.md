# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an IT Asset and Software Inventory Management System (v2.0) - a web-based application for managing company IT assets, software licenses, and employee assignments. The system supports role-based access control with LDAP authentication integration.

## Architecture

**Frontend**: Vanilla JavaScript (script.js) with HTML/CSS
**Backend**: Node.js/Express REST API (backend/server.js)  
**Database**: PostgreSQL with connection pooling
**Authentication**: Dual mode - LDAP + local database fallback
**Deployment**: Docker containers with nginx reverse proxy

### Key Files
- `script.js` - Main frontend application with all UI logic and API calls
- `backend/server.js` - Express REST API server with all endpoints
- `index.html` - Single-page application interface
- `backend/database.sql` - Database schema and initial data
- `docker-compose.yml` - Complete Docker deployment setup

## Development Commands

### Backend Development
```bash
cd backend
npm install                    # Install dependencies
npm start                     # Start production server (port 3001)
npm run dev                   # Start development server with nodemon
npm run migrate               # Run database migrations
```

### Docker Deployment  
```bash
./start.sh                    # Start all services (recommended)
./stop.sh                     # Stop all services
docker-compose up -d --build  # Manual Docker start
docker-compose logs -f        # View logs
docker-compose ps             # Check status
```

### Database Management
```bash
# Access database via psql
docker exec -it itinventory-db psql -U inventory_user -d inventory_db

# Access pgAdmin interface
# Visit http://localhost:5050 (admin@itinventory.com / admin123)
```

## Role-Based Access Control

The system implements three user roles with different permissions:

### Admin (`hasAdminRole()`)
- Full system access
- User management
- All CRUD operations including delete
- System configuration

### Manager (`hasManagerRole()`)  
- Asset management (create/edit)
- Assignment management
- Employee management
- Cannot delete or manage users

### User (default)
- Read-only access to assets and assignments
- Can view their own assigned items
- Cannot modify any data

### Role Implementation
- Role checks use `hasAdminRole()` and `hasManagerRole()` functions in script.js
- Backend validates roles on protected endpoints
- UI elements conditionally render based on user permissions

## API Structure

The backend API follows REST conventions with these main routes:

- `/api/auth/*` - Authentication (login, token refresh)
- `/api/employees` - Employee management  
- `/api/hardware` - Hardware asset management
- `/api/software` - Software license management
- `/api/assignments` - Asset assignment tracking
- `/api/activities` - Activity logging
- `/api/users` - User management (admin only)

## LDAP Integration

LDAP authentication is configured via environment variables in `backend/.env`:

```bash
LDAP_ENABLED=true
LDAP_SERVER=ldap://server:389
LDAP_USER_BASE=ou=users,dc=company,dc=com
LDAP_GROUP_BASE=ou=groups,dc=company,dc=com
```

Role mapping is automatic based on LDAP group membership:
- Admin: groups containing "administrators", "it-admin", "domain admins" 
- Manager: groups containing "managers", "it-managers", "supervisors"
- User: default role for all other users

## Frontend State Management

The frontend uses a global `dataStore` object that maintains:
- `employees[]` - Employee data
- `hardware[]` - Hardware assets  
- `software[]` - Software licenses
- `assignments[]` - Asset assignments
- `activities[]` - Activity logs
- `users[]` - System users (admin only)

Data is loaded via `dataStore.loadAllData()` and synchronized with the backend.

## Key Frontend Functions

- `renderHardware()`, `renderSoftware()`, `renderEmployees()` - Table rendering with role-based UI
- `showTab(tabName)` - Tab navigation and view switching  
- `exportToExcel(type)` - Excel export functionality
- `hasAdminRole()`, `hasManagerRole()` - Permission checking
- `showAlert(message, type)` - User notifications

## Database Schema

Main tables:
- `users` - System users with roles and authentication
- `employees` - Company staff information
- `hardware` - IT hardware assets
- `software` - Software licenses  
- `assignments` - Asset allocation tracking
- `activities` - System activity audit log

## Testing Changes

When modifying the system:

1. **Backend changes**: Restart the backend server (`npm start`)
2. **Frontend changes**: Refresh browser (static files served by nginx)  
3. **Database changes**: Run migrations or update schema manually
4. **LDAP changes**: Update `.env` and restart backend
5. **Role changes**: Test with different user roles to verify permissions

## Security Considerations

- All API endpoints require JWT authentication
- Role-based endpoint protection on backend
- LDAP credentials stored in environment variables
- SQL injection protection via parameterized queries
- Rate limiting enabled for API endpoints
- CORS configured for frontend origin

## Common Development Tasks

**Adding new asset types**: Update both frontend rendering functions and backend API endpoints
**Modifying role permissions**: Update both `hasManagerRole()`/`hasAdminRole()` checks in frontend and backend middleware
**Adding export functionality**: Extend `exportToExcel()` function with new data preparation
**LDAP troubleshooting**: Check backend console logs prefixed with `🔍 LDAP:`, `✅ LDAP:`, `❌ LDAP:`