-- IT 자산 인벤토리 데이터베이스 스키마

-- 사용자 테이블 (인증/권한 관리)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 임직원 테이블
CREATE TABLE employees (
    id VARCHAR(20) PRIMARY KEY, -- EMP001, EMP002, ...
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50),
    hire_date DATE,
    email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 하드웨어 자산 테이블
CREATE TABLE hardware (
    id VARCHAR(20) PRIMARY KEY, -- HW001, HW002, ...
    type VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    price DECIMAL(12,2),
    status VARCHAR(20) DEFAULT '대기중' CHECK (status IN ('대기중', '사용중', '수리중', '폐기')),
    assigned_to VARCHAR(20) REFERENCES employees(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 소프트웨어 테이블
CREATE TABLE software (
    id VARCHAR(20) PRIMARY KEY, -- SW001, SW002, ...
    name VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(100),
    version VARCHAR(50),
    type VARCHAR(50),
    license_type VARCHAR(50),
    total_licenses INTEGER DEFAULT 1,
    used_licenses INTEGER DEFAULT 0,
    purchase_date DATE,
    expiry_date DATE,
    price DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 자산 할당 테이블
CREATE TABLE assignments (
    id VARCHAR(20) PRIMARY KEY, -- AS001, AS002, ...
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(id),
    hardware_id VARCHAR(20) NOT NULL REFERENCES hardware(id),
    assign_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT '할당중' CHECK (status IN ('할당중', '반납완료')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 활동 이력 테이블 (변경 추적)
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(200) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(20),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_hardware_status ON hardware(status);
CREATE INDEX idx_hardware_assigned_to ON hardware(assigned_to);
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_hardware ON assignments(hardware_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- 업데이트 트리거 (updated_at 자동 갱신)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_hardware_updated_at BEFORE UPDATE ON hardware 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_software_updated_at BEFORE UPDATE ON software 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO users (username, password_hash, full_name, email, role) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.FuIBNQVgAoJ2h4bLEohzE8PZKG0O6K', '시스템 관리자', 'admin@company.com', 'admin');

-- 샘플 데이터 (개발/테스트용)
INSERT INTO employees (id, name, department, position, hire_date, email, phone) VALUES 
('EMP001', '김철수', '개발팀', '과장', '2020-03-15', 'kim@company.com', '010-1234-5678'),
('EMP002', '이영희', '마케팅팀', '대리', '2021-07-01', 'lee@company.com', '010-9876-5432');

INSERT INTO hardware (id, type, manufacturer, model, serial_number, purchase_date, price, status) VALUES 
('HW001', '노트북', 'Dell', 'Latitude 5520', 'DL202301001', '2023-01-15', 1200000, '대기중'),
('HW002', '모니터', 'LG', '27UP850', 'LG202301002', '2023-02-01', 450000, '대기중');

INSERT INTO software (id, name, manufacturer, version, type, license_type, total_licenses, used_licenses, purchase_date, price) VALUES 
('SW001', 'Microsoft Office 365', 'Microsoft', '2023', '오피스', '다중사용자', 10, 5, '2023-01-01', 1500000),
('SW002', 'Windows 11 Pro', 'Microsoft', '23H2', '운영체제', '단일사용자', 20, 15, '2023-03-01', 2000000);