// Test script to check user deactivation functionality
const { Pool } = require('pg');

const pool = new Pool({
    user: 'inventory_user',
    host: 'localhost',
    database: 'inventory_db',
    password: 'inventory_password_2024',
    port: 5432,
});

async function checkUsers() {
    try {
        const result = await pool.query(`
            SELECT username, is_active, role, full_name 
            FROM users 
            ORDER BY username
        `);
        
        console.log('Current users in database:');
        console.table(result.rows);
        
        // Find a user that might be deactivated
        const deactivatedUser = result.rows.find(u => !u.is_active);
        if (deactivatedUser) {
            console.log(`\nDeactivated user found: ${deactivatedUser.username} (is_active: ${deactivatedUser.is_active})`);
        } else {
            console.log('\nNo deactivated users found');
        }
        
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await pool.end();
    }
}

checkUsers();