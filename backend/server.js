const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { LDAPAuth } = require('./lib/ldapAuth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting in production
app.set('trust proxy', 1);

// 데이터베이스 연결
const pool = new Pool({
    user: process.env.DB_USER || 'inventory_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'inventory_db',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// LDAP 인증 설정
const ldapEnabled = process.env.LDAP_ENABLED === 'true';
let ldapAuth = null;

if (ldapEnabled) {
    console.log('🔧 LDAP authentication enabled');
    ldapAuth = new LDAPAuth({
        server: process.env.LDAP_SERVER,
        bindDN: process.env.LDAP_BIND_DN,
        bindPassword: process.env.LDAP_BIND_PASSWORD,
        userBase: process.env.LDAP_USER_BASE,
        groupBase: process.env.LDAP_GROUP_BASE,
        userFilter: process.env.LDAP_USER_FILTER,
        groupFilter: process.env.LDAP_GROUP_FILTER,
        userFullnameAttr: process.env.LDAP_USER_FULLNAME_ATTR,
        userEmailAttr: process.env.LDAP_USER_EMAIL_ATTR
    });

    // Test LDAP connection on startup
    ldapAuth.testConnection().catch(error => {
        console.error('❌ LDAP: Initial connection test failed:', error.message);
    });
} else {
    console.log('🔧 LDAP authentication disabled, using local authentication only');
}

// 미들웨어 설정
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://172.20.0.1:8080',
        'http://it.roboetech.com:8080',
        'http://it.roboetech.com',
        'https://it.roboetech.com'
    ],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting (개발 환경에서는 비활성화)
if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15분
        max: 500, // 요청 제한
        message: {
            error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: 900
        }
    });
    app.use(limiter);
} else {
    console.log('🔧 Rate limiting disabled for development environment');
}

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '접근 토큰이 필요합니다.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        req.user = user;
        next();
    });
};

// 권한 확인 미들웨어
const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: '권한이 부족합니다.' });
        }
        next();
    };
};

// 활동 로깅 함수
const logActivity = async (userId, action, tableName = null, recordId = null, oldValues = null, newValues = null) => {
    try {
        await pool.query(
            'INSERT INTO activities (user_id, action, table_name, record_id, old_values, new_values) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, action, tableName, recordId, oldValues, newValues]
        );
    } catch (error) {
        console.error('Activity logging failed:', error);
    }
};

// LDAP 사용자를 로컬 데이터베이스에서 찾거나 생성하는 함수
const findOrCreateLdapUser = async (ldapUser) => {
    try {
        // 먼저 username으로 기존 사용자 찾기
        let result = await pool.query('SELECT * FROM users WHERE username = $1', [ldapUser.username]);
        
        if (result.rows.length > 0) {
            let user = result.rows[0];
            
            // LDAP에서 온 정보로 사용자 정보 업데이트
            const updateResult = await pool.query(`
                UPDATE users 
                SET full_name = $1, email = $2, role = $3, is_active = true, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `, [ldapUser.fullName, ldapUser.email, ldapUser.role, user.id]);
            
            console.log(`✅ Updated existing LDAP user: ${ldapUser.username}`);
            return updateResult.rows[0];
        } else {
            // 새 LDAP 사용자 생성
            const createResult = await pool.query(`
                INSERT INTO users (username, password_hash, full_name, email, role, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `, [
                ldapUser.username,
                '', // LDAP 사용자는 비밀번호가 비어있음
                ldapUser.fullName,
                ldapUser.email,
                ldapUser.role
            ]);
            
            console.log(`✅ Created new LDAP user: ${ldapUser.username}`);
            return createResult.rows[0];
        }
    } catch (error) {
        console.error('Error finding/creating LDAP user:', error);
        throw new Error('사용자 정보 처리 중 오류가 발생했습니다.');
    }
};

// === 인증 API ===

// 로그인
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // LDAP 인증 시도 (LDAP가 활성화된 경우)
        if (ldapEnabled && ldapAuth && username !== 'admin') {
            try {
                console.log(`🔍 LDAP: Attempting authentication for user: ${username}`);
                const ldapUser = await ldapAuth.authenticate(username, password);
                
                if (ldapUser) {
                    // LDAP 인증 성공 - 로컬 데이터베이스에서 사용자 찾기 또는 생성
                    let user = await findOrCreateLdapUser(ldapUser);
                    
                    // 마지막 로그인 시간 업데이트
                    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

                    const token = jwt.sign(
                        {
                            id: user.id,
                            username: user.username,
                            role: user.role,
                            ldap: true
                        },
                        process.env.JWT_SECRET || 'your-secret-key',
                        { expiresIn: '8h' }
                    );

                    await logActivity(user.id, `LDAP 사용자 로그인: ${ldapUser.fullName}`);

                    return res.json({
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            full_name: user.full_name,
                            role: user.role,
                            authMethod: 'LDAP'
                        }
                    });
                } else {
                    // LDAP에서 사용자를 찾지 못함
                    console.log(`🔍 LDAP: User ${username} not found in LDAP`);
                    return res.status(401).json({ error: 'LDAP 인증에 실패했습니다. 사용자명과 비밀번호를 확인하세요.' });
                }
            } catch (ldapError) {
                console.error('LDAP authentication error:', ldapError.message);
                // LDAP 연결 오류인 경우 로컬 인증으로 폴백
                if (ldapError.message.includes('getaddrinfo ENOTFOUND') || ldapError.message.includes('ECONNREFUSED')) {
                    console.log(`⚠️ LDAP: Connection failed, falling back to local authentication for ${username}`);
                } else {
                    return res.status(401).json({ error: 'LDAP 인증에 실패했습니다. 사용자명과 비밀번호를 확인하세요.' });
                }
            }
        }

        // 로컬 데이터베이스 인증 (LDAP 비활성화이거나 LDAP 인증 실패 시)
        console.log(`🔍 Local: Attempting local authentication for user: ${username}`);
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
        let user = result.rows[0];

        // 관리자 계정이 없으면 생성 (개발/테스트용)
        if (!user && username === 'admin') {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const createResult = await pool.query(`
                INSERT INTO users (username, password_hash, full_name, email, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [username, hashedPassword, '시스템 관리자', 'admin@company.com', 'admin']);
            user = createResult.rows[0];
        }

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({ error: '잘못된 사용자명 또는 비밀번호입니다.' });
        }

        // 마지막 로그인 시간 업데이트
        await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                ldap: false
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '8h' }
        );

        await logActivity(user.id, '로컬 사용자 로그인');

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                authMethod: 'Local'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// LDAP 연결 테스트 (관리자 전용)
app.get('/api/auth/ldap/test', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        if (!ldapEnabled || !ldapAuth) {
            return res.json({
                enabled: false,
                message: 'LDAP authentication is disabled'
            });
        }

        const isConnected = await ldapAuth.testConnection();
        res.json({
            enabled: true,
            connected: isConnected,
            config: {
                server: process.env.LDAP_SERVER,
                userBase: process.env.LDAP_USER_BASE,
                groupBase: process.env.LDAP_GROUP_BASE
            }
        });
    } catch (error) {
        console.error('LDAP test error:', error);
        res.status(500).json({ 
            enabled: true,
            connected: false,
            error: error.message 
        });
    }
});

// === 임직원 API ===

// 임직원 목록 조회
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, u.full_name as created_by_name
            FROM employees e
            LEFT JOIN users u ON e.created_by = u.id
            WHERE e.is_active = true
            ORDER BY e.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({ error: '임직원 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 임직원 등록
app.post('/api/employees', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { name, department, position, hire_date, email, phone } = req.body;

        // 새 사번 생성
        const maxIdResult = await pool.query("SELECT id FROM employees WHERE id ~ '^EMP[0-9]+$' ORDER BY CAST(substring(id, 4) AS INTEGER) DESC LIMIT 1");
        const maxId = maxIdResult.rows.length > 0 ? parseInt(maxIdResult.rows[0].id.substring(3)) : 0;
        const newId = 'EMP' + String(maxId + 1).padStart(3, '0');

        const result = await pool.query(`
            INSERT INTO employees (id, name, department, position, hire_date, email, phone, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [newId, name, department, position, hire_date || null, email, phone, req.user.id]);

        await logActivity(req.user.id, `임직원 등록: ${name}`, 'employees', newId, null, result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ error: '임직원 등록 중 오류가 발생했습니다.' });
    }
});

// 임직원 수정
app.put('/api/employees/:id', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, position, hire_date, email, phone } = req.body;

        // 기존 데이터 조회 (로깅용)
        const oldResult = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
        const oldData = oldResult.rows[0];

        const result = await pool.query(`
            UPDATE employees
            SET name = $1, department = $2, position = $3, hire_date = $4, email = $5, phone = $6
            WHERE id = $7 AND is_active = true
            RETURNING *
        `, [name, department, position, hire_date || null, email, phone, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '임직원을 찾을 수 없습니다.' });
        }

        await logActivity(req.user.id, `임직원 수정: ${name}`, 'employees', id, oldData, result.rows[0]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ error: '임직원 수정 중 오류가 발생했습니다.' });
    }
});

// 임직원 삭제 (소프트 삭제)
app.delete('/api/employees/:id', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE employees
            SET is_active = false
            WHERE id = $1
            RETURNING name
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '임직원을 찾을 수 없습니다.' });
        }

        await logActivity(req.user.id, `임직원 삭제: ${result.rows[0].name}`, 'employees', id);

        res.json({ message: '임직원이 삭제되었습니다.' });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ error: '임직원 삭제 중 오류가 발생했습니다.' });
    }
});

// === 하드웨어 자산 API ===

// 하드웨어 목록 조회
app.get('/api/hardware', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, e.name as assigned_to_name
            FROM hardware h
            LEFT JOIN employees e ON h.assigned_to = e.id
            WHERE h.is_active = true
            ORDER BY h.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get hardware error:', error);
        res.status(500).json({ error: '하드웨어 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 하드웨어 등록
app.post('/api/hardware', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { type, manufacturer, model, serial_number, purchase_date, price, notes } = req.body;

        // 새 자산번호 생성
        const maxIdResult = await pool.query("SELECT id FROM hardware WHERE id ~ '^HW[0-9]+$' ORDER BY CAST(substring(id, 3) AS INTEGER) DESC LIMIT 1");
        const maxId = maxIdResult.rows.length > 0 ? parseInt(maxIdResult.rows[0].id.substring(2)) : 0;
        const newId = 'HW' + String(maxId + 1).padStart(3, '0');

        const result = await pool.query(`
            INSERT INTO hardware (id, type, manufacturer, model, serial_number, purchase_date, price, notes, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [newId, type, manufacturer, model, serial_number, purchase_date || null, price, notes, '대기중', req.user.id]);

        await logActivity(req.user.id, `하드웨어 등록: ${type} ${manufacturer} ${model}`, 'hardware', newId, null, result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create hardware error:', error);
        res.status(500).json({ error: '하드웨어 등록 중 오류가 발생했습니다.' });
    }
});

// 하드웨어 수정
app.put('/api/hardware/:id', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { type, manufacturer, model, serial_number, purchase_date, price, notes, status } = req.body;

        const oldResult = await pool.query('SELECT * FROM hardware WHERE id = $1', [id]);
        const oldData = oldResult.rows[0];

        const result = await pool.query(`
            UPDATE hardware
            SET type = $1, manufacturer = $2, model = $3, serial_number = $4, purchase_date = $5,
                price = $6, notes = $7, status = $8
            WHERE id = $9 AND is_active = true
            RETURNING *
        `, [type, manufacturer, model, serial_number, purchase_date || null, price, notes, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '하드웨어를 찾을 수 없습니다.' });
        }

        await logActivity(req.user.id, `하드웨어 수정: ${type} ${manufacturer} ${model}`, 'hardware', id, oldData, result.rows[0]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update hardware error:', error);
        res.status(500).json({ error: '하드웨어 수정 중 오류가 발생했습니다.' });
    }
});

// 하드웨어 삭제 (소프트 삭제)
app.delete('/api/hardware/:id', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE hardware
            SET is_active = false
            WHERE id = $1
            RETURNING type, manufacturer, model
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '하드웨어를 찾을 수 없습니다.' });
        }

        const hardware = result.rows[0];
        await logActivity(req.user.id, `하드웨어 삭제: ${hardware.type} ${hardware.manufacturer} ${hardware.model}`, 'hardware', id);

        res.json({ message: '하드웨어가 삭제되었습니다.' });
    } catch (error) {
        console.error('Delete hardware error:', error);
        res.status(500).json({ error: '하드웨어 삭제 중 오류가 발생했습니다.' });
    }
});

// === 소프트웨어 자산 API ===

// 소프트웨어 목록 조회
app.get('/api/software', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, u.full_name as created_by_name
            FROM software s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.is_active = true
            ORDER BY s.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get software error:', error);
        res.status(500).json({ error: '소프트웨어 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 소프트웨어 등록
app.post('/api/software', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { name, manufacturer, version, type, license_type, total_licenses, purchase_date, expiry_date, price } = req.body;

        // 새 소프트웨어 ID 생성
        const maxIdResult = await pool.query("SELECT id FROM software WHERE id ~ '^SW[0-9]+$' ORDER BY CAST(substring(id, 3) AS INTEGER) DESC LIMIT 1");
        const maxId = maxIdResult.rows.length > 0 ? parseInt(maxIdResult.rows[0].id.substring(2)) : 0;
        const newId = 'SW' + String(maxId + 1).padStart(3, '0');

        const result = await pool.query(`
            INSERT INTO software (id, name, manufacturer, version, type, license_type, total_licenses, purchase_date, expiry_date, price, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [newId, name, manufacturer, version, type, license_type, total_licenses || 1, purchase_date || null, expiry_date || null, price, req.user.id]);

        await logActivity(req.user.id, `소프트웨어 등록: ${name} ${version}`, 'software', newId, null, result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create software error:', error);
        res.status(500).json({ error: '소프트웨어 등록 중 오류가 발생했습니다.' });
    }
});

// 소프트웨어 수정
app.put('/api/software/:id', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, manufacturer, version, type, license_type, total_licenses, purchase_date, expiry_date, price } = req.body;

        const oldResult = await pool.query('SELECT * FROM software WHERE id = $1', [id]);
        const oldData = oldResult.rows[0];

        const result = await pool.query(`
            UPDATE software
            SET name = $1, manufacturer = $2, version = $3, type = $4, license_type = $5,
                total_licenses = $6, purchase_date = $7, expiry_date = $8, price = $9
            WHERE id = $10 AND is_active = true
            RETURNING *
        `, [name, manufacturer, version, type, license_type, total_licenses || 1, purchase_date || null, expiry_date || null, price, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '소프트웨어를 찾을 수 없습니다.' });
        }

        await logActivity(req.user.id, `소프트웨어 수정: ${name} ${version}`, 'software', id, oldData, result.rows[0]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update software error:', error);
        res.status(500).json({ error: '소프트웨어 수정 중 오류가 발생했습니다.' });
    }
});

// 소프트웨어 삭제 (소프트 삭제)
app.delete('/api/software/:id', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE software
            SET is_active = false
            WHERE id = $1
            RETURNING name, version
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '소프트웨어를 찾을 수 없습니다.' });
        }

        const software = result.rows[0];
        await logActivity(req.user.id, `소프트웨어 삭제: ${software.name} ${software.version}`, 'software', id);

        res.json({ message: '소프트웨어가 삭제되었습니다.' });
    } catch (error) {
        console.error('Delete software error:', error);
        res.status(500).json({ error: '소프트웨어 삭제 중 오류가 발생했습니다.' });
    }
});

// === 자산 할당 API ===

// 할당 목록 조회
app.get('/api/assignments', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, e.name as employee_name, u.full_name as assigned_by_name,
                   CASE
                       WHEN a.asset_type = 'hardware' THEN CONCAT(h.type, ' ', h.manufacturer, ' ', h.model)
                       WHEN a.asset_type = 'software' THEN CONCAT(s.name, ' ', s.version)
                       ELSE '알 수 없음'
                   END as asset_description
            FROM assignments a
            LEFT JOIN employees e ON a.employee_id = e.id
            LEFT JOIN users u ON a.assigned_by = u.id
            LEFT JOIN hardware h ON a.asset_type = 'hardware' AND a.asset_id = h.id
            LEFT JOIN software s ON a.asset_type = 'software' AND a.asset_id = s.id
            WHERE a.is_active = true
            ORDER BY a.assigned_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: '할당 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 자산 할당
app.post('/api/assignments', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { employee_id, asset_type, asset_id, notes } = req.body;

        // 중복 할당 확인
        const existingResult = await pool.query(`
            SELECT * FROM assignments
            WHERE employee_id = $1 AND asset_type = $2 AND asset_id = $3 AND status = '사용중' AND is_active = true
        `, [employee_id, asset_type, asset_id]);

        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: '이미 할당된 자산입니다.' });
        }

        // 새 할당 ID 생성
        const maxIdResult = await pool.query("SELECT id FROM assignments WHERE id ~ '^AS[0-9]+$' ORDER BY CAST(substring(id, 3) AS INTEGER) DESC LIMIT 1");
        const maxId = maxIdResult.rows.length > 0 ? parseInt(maxIdResult.rows[0].id.substring(2)) : 0;
        const newId = 'AS' + String(maxId + 1).padStart(3, '0');

        const result = await pool.query(`
            INSERT INTO assignments (id, employee_id, asset_type, asset_id, assigned_date, status, notes, assigned_by)
            VALUES ($1, $2, $3, $4, CURRENT_DATE, '사용중', $5, $6)
            RETURNING *
        `, [newId, employee_id, asset_type, asset_id, notes, req.user.id]);

        // 자산 상태 업데이트
        if (asset_type === 'hardware') {
            await pool.query('UPDATE hardware SET status = $1, assigned_to = $2 WHERE id = $3', ['사용중', employee_id, asset_id]);
        } else if (asset_type === 'software') {
            await pool.query('UPDATE software SET current_users = current_users + 1 WHERE id = $1', [asset_id]);
        }

        await logActivity(req.user.id, `자산 할당: ${asset_type}/${asset_id} → ${employee_id}`, 'assignments', newId, null, result.rows[0]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ error: '자산 할당 중 오류가 발생했습니다.' });
    }
});

// 자산 반납
app.put('/api/assignments/:id/return', authenticateToken, authorize(['admin', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // 할당 정보 조회
        const assignmentResult = await pool.query('SELECT * FROM assignments WHERE id = $1 AND is_active = true', [id]);
        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({ error: '할당 정보를 찾을 수 없습니다.' });
        }

        const assignment = assignmentResult.rows[0];

        // 할당 상태 업데이트
        const result = await pool.query(`
            UPDATE assignments
            SET status = '반납완료', return_date = CURRENT_DATE, return_notes = $1
            WHERE id = $2
            RETURNING *
        `, [notes, id]);

        // 자산 상태 업데이트
        if (assignment.asset_type === 'hardware') {
            await pool.query('UPDATE hardware SET status = $1, assigned_to = NULL WHERE id = $2', ['대기중', assignment.asset_id]);
        } else if (assignment.asset_type === 'software') {
            await pool.query('UPDATE software SET current_users = GREATEST(0, current_users - 1) WHERE id = $1', [assignment.asset_id]);
        }

        await logActivity(req.user.id, `자산 반납: ${assignment.asset_type}/${assignment.asset_id}`, 'assignments', id);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Return assignment error:', error);
        res.status(500).json({ error: '자산 반납 중 오류가 발생했습니다.' });
    }
});

// === 활동 로그 API ===

// 최근 활동 조회
app.get('/api/activities', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const result = await pool.query(`
            SELECT a.*, u.full_name as user_name
            FROM activities a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT $1
        `, [limit]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: '활동 내역 조회 중 오류가 발생했습니다.' });
    }
});

// 기본 상태 확인
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'IT Inventory API Server is running' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 IT Inventory API Server running on port ${PORT}`);
});

// 프로세스 종료 처리
process.on('SIGINT', async () => {
    console.log('서버를 종료합니다...');
    await pool.end();
    process.exit(0);
});
