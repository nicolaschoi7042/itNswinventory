import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Database connection pool
let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env['DB_USER'] || 'inventory_user',
      host: process.env['DB_HOST'] || 'localhost',
      database: process.env['DB_NAME'] || 'inventory_db',
      password: process.env['DB_PASSWORD'] || 'your_password',
      port: parseInt(process.env['DB_PORT'] || '5432'),
    });
  }
  return pool;
}

export interface DatabaseUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
  password_hash?: string;
}

export interface LDAPUserData {
  username: string;
  fullName: string;
  email: string;
  role: string;
}

/**
 * Find user by username
 */
export async function findUserByUsername(username: string): Promise<DatabaseUser | null> {
  const pool = getPool();
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, email, role, is_active, created_at, last_login, password_hash FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as DatabaseUser;
  } catch (error) {
    console.error('Database error finding user:', error);
    throw new Error('Database error occurred');
  }
}

/**
 * Find or create LDAP user in local database
 */
export async function findOrCreateLdapUser(ldapUser: LDAPUserData): Promise<DatabaseUser> {
  const pool = getPool();
  
  try {
    // Try to find existing user
    let user = await findUserByUsername(ldapUser.username);
    
    if (user) {
      // Update existing user with latest LDAP information
      const updateResult = await pool.query(
        `UPDATE users SET 
         full_name = $1, 
         email = $2, 
         role = $3, 
         updated_at = CURRENT_TIMESTAMP 
         WHERE username = $4 
         RETURNING id, username, full_name, email, role, is_active, created_at, last_login`,
        [ldapUser.fullName, ldapUser.email, ldapUser.role, ldapUser.username]
      );
      
      return updateResult.rows[0] as DatabaseUser;
    } else {
      // Create new user
      const insertResult = await pool.query(
        `INSERT INTO users (username, full_name, email, role, is_active, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING id, username, full_name, email, role, is_active, created_at, last_login`,
        [ldapUser.username, ldapUser.fullName, ldapUser.email, ldapUser.role]
      );
      
      return insertResult.rows[0] as DatabaseUser;
    }
  } catch (error) {
    console.error('Database error in findOrCreateLdapUser:', error);
    throw new Error('Database error occurred');
  }
}

/**
 * Verify local user password
 */
export async function verifyLocalUserPassword(username: string, password: string): Promise<DatabaseUser | null> {
  const user = await findUserByUsername(username);
  
  if (!user || !user.password_hash) {
    return null;
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return null;
  }
  
  return user;
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(userId: number): Promise<void> {
  const pool = getPool();
  try {
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
  } catch (error) {
    console.error('Database error updating last login:', error);
    throw new Error('Database error occurred');
  }
}

/**
 * Log activity to database
 */
export async function logActivity(userId: number, description: string, details?: object): Promise<void> {
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO activities (user_id, description, details, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [userId, description, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Database error logging activity:', error);
    // Don't throw error for activity logging to avoid breaking main flow
  }
}

/**
 * Check if user is active
 */
export async function isUserActive(userId: number): Promise<boolean> {
  const pool = getPool();
  try {
    const result = await pool.query('SELECT is_active FROM users WHERE id = $1', [userId]);
    return result.rows.length > 0 && result.rows[0].is_active;
  } catch (error) {
    console.error('Database error checking user active status:', error);
    return false;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<DatabaseUser[]> {
  const pool = getPool();
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, email, role, is_active, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    
    return result.rows as DatabaseUser[];
  } catch (error) {
    console.error('Database error getting all users:', error);
    throw new Error('Database error occurred');
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: 'admin' | 'manager' | 'user'): Promise<void> {
  const pool = getPool();
  try {
    await pool.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, userId]);
  } catch (error) {
    console.error('Database error updating user role:', error);
    throw new Error('Database error occurred');
  }
}

/**
 * Update user active status (admin only)
 */
export async function updateUserActiveStatus(userId: number, isActive: boolean): Promise<void> {
  const pool = getPool();
  try {
    await pool.query('UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [isActive, userId]);
  } catch (error) {
    console.error('Database error updating user active status:', error);
    throw new Error('Database error occurred');
  }
}

// Close database connection
export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}