// IT Inventory System - REVERSE PROXY FIX - 2025-08-08 01:43 UTC - v6 - SAME ORIGIN API
// API 서비스 클래스
class ApiService {
    constructor() {
        // Handle different access methods for API URL construction
        const origin = window.location.origin;
        let apiUrl;

        if (origin.includes(':8080')) {
            // Development: localhost:8080 -> localhost:3001
            apiUrl = origin.replace(':8080', ':3001');
        } else if (origin.includes('it.roboetech.com')) {
            // Production: https://it.roboetech.com -> https://it.roboetech.com/api (same domain)
            apiUrl = origin;
        } else {
            // Fallback: add port 3001 to any other domain
            apiUrl = origin + ':3001';
        }

        this.baseUrl = apiUrl + '/api';
        this.token = localStorage.getItem('inventory_token');
        console.log('=== API URL CONSTRUCTION DEBUG ===');
        console.log('Current origin:', origin);
        console.log('Contains :8080?', origin.includes(':8080'));
        console.log('Contains it.roboetech.com?', origin.includes('it.roboetech.com'));
        console.log('Constructed apiUrl:', apiUrl);
        console.log('Final API Base URL:', this.baseUrl);
        console.log('================================');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            }
        };

        console.log('API Request:', { url, config });

        try {
            const response = await fetch(url, config);
            console.log('API Response status:', response.status);

            const data = await response.json();
            console.log('API Response data:', data);

            if (!response.ok) {
                // 토큰 만료 또는 인증 오류 시 자동 로그아웃
                if (response.status === 401 || response.status === 403) {
                    console.log('🔒 Token expired or unauthorized, logging out...');
                    this.logout();
                    showLoginModal();
                    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
                }
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    async login(username = 'admin', password = 'admin123') {
        try {
            const data = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            this.token = data.token;
            localStorage.setItem('inventory_token', this.token);
            localStorage.setItem('inventory_user', JSON.stringify(data.user));

            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    logout() {
        console.log('🔒 Logging out user...');
        this.token = null;
        localStorage.removeItem('inventory_token');
        localStorage.removeItem('inventory_user');
        
        // 데이터 스토어 초기화
        if (window.dataStore) {
            dataStore.employees = [];
            dataStore.hardware = [];
            dataStore.software = [];
            dataStore.assignments = [];
            dataStore.activities = [];
        }
    }

    // 임직원 API
    async getEmployees() {
        return await this.request('/employees');
    }

    async createEmployee(employee) {
        return await this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(employee)
        });
    }

    async updateEmployee(id, employee) {
        return await this.request(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employee)
        });
    }

    async deleteEmployee(id) {
        return await this.request(`/employees/${id}`, {
            method: 'DELETE'
        });
    }

    // 하드웨어 API
    async getHardware() {
        return await this.request('/hardware');
    }

    async createHardware(hardware) {
        return await this.request('/hardware', {
            method: 'POST',
            body: JSON.stringify(hardware)
        });
    }

    async updateHardware(id, hardware) {
        return await this.request(`/hardware/${id}`, {
            method: 'PUT',
            body: JSON.stringify(hardware)
        });
    }

    // 소프트웨어 API
    async getSoftware() {
        return await this.request('/software');
    }

    async createSoftware(software) {
        return await this.request('/software', {
            method: 'POST',
            body: JSON.stringify(software)
        });
    }

    // 할당 API
    async getAssignments() {
        return await this.request('/assignments');
    }

    async createAssignment(assignment) {
        return await this.request('/assignments', {
            method: 'POST',
            body: JSON.stringify(assignment)
        });
    }

    async returnAsset(assignmentId, notes) {
        return await this.request(`/assignments/${assignmentId}/return`, {
            method: 'PUT',
            body: JSON.stringify({ notes })
        });
    }

    // 활동 로그 API
    async getActivities(limit = 20) {
        return await this.request(`/activities?limit=${limit}`);
    }
}

// 데이터 저장소 (API 기반)
class DataStore {
    constructor() {
        this.api = new ApiService();
        this.employees = [];
        this.hardware = [];
        this.software = [];
        this.assignments = [];
        this.activities = [];

        // 자동 로그인 시도 후 데이터 로드
        this.initializeData();
    }

    async initializeData() {
        console.log('🔧 initializeData() called');
        console.log('🔧 Current token:', this.api.token);
        try {
            // 토큰이 없으면 로그인 모달 표시
            if (!this.api.token) {
                console.log('🔧 No token found, showing login modal');
                showLoginModal();
                return; // 로그인 완료 후 다시 시도
            }

            await this.loadAllData();
        } catch (error) {
            console.error('API 연결 실패:', error);
            // 인증 오류인 경우 로그인 모달 표시 (ApiService에서 이미 처리되지만 추가 안전장치)
            if (error.message && (error.message.includes('401') || error.message.includes('세션이 만료'))) {
                console.log('🔒 Authentication failed, clearing token and showing login modal');
                this.api.logout();
                showLoginModal();
                return;
            }
            
            // 다른 오류인 경우 빈 배열로 초기화
            this.employees = [];
            this.hardware = [];
            this.software = [];
            this.assignments = [];
            this.activities = [];
        }
    }

    async loadAllData() {
        try {
            [this.employees, this.hardware, this.software, this.assignments, this.activities] = await Promise.all([
                this.api.getEmployees(),
                this.api.getHardware(),
                this.api.getSoftware(),
                this.api.getAssignments(),
                this.api.getActivities()
            ]);

            console.log('🔄 데이터 로드 완료:');
            console.log('  - 임직원:', this.employees.length, '개');
            console.log('  - 하드웨어:', this.hardware.length, '개', this.hardware);
            console.log('  - 소프트웨어:', this.software.length, '개');
            console.log('  - 할당:', this.assignments.length, '개');
            console.log('  - 활동:', this.activities.length, '개');

            // 데이터가 로드되면 화면 업데이트
            if (typeof updateStatistics === 'function') {
                updateStatistics();
            }
            if (typeof renderDashboard === 'function') {
                renderDashboard();
            }
        } catch (error) {
            console.error('데이터 로드 중 오류:', error);
            throw error;
        }
    }

    addActivity(user, action) {
        const activity = {
            id: Date.now().toString(),
            user: user,
            action: action,
            timestamp: new Date().toISOString()
        };
        this.activities.unshift(activity);
        if (this.activities.length > 50) {
            this.activities = this.activities.slice(0, 50);
        }
    }

    // CRUD 메서드들 (API 기반)
    async addEmployee(employee) {
        try {
            const newEmployee = await this.api.createEmployee({
                name: employee.name,
                department: employee.department,
                hire_date: employee.hireDate,
                email: employee.email,
                phone: employee.phone
            });

            this.employees.push(newEmployee);
            this.addActivity('관리자', `직원 ${newEmployee.name} 등록`);
            return newEmployee;
        } catch (error) {
            console.error('임직원 등록 중 오류:', error);
            throw error;
        }
    }

    async updateEmployee(id, employee) {
        try {
            const updatedEmployee = await this.api.updateEmployee(id, {
                name: employee.name,
                department: employee.department,
                hire_date: employee.hireDate,
                email: employee.email,
                phone: employee.phone
            });

            const index = this.employees.findIndex(emp => emp.id === id);
            if (index !== -1) {
                this.employees[index] = updatedEmployee;
            }
            this.addActivity('관리자', `직원 ${updatedEmployee.name} 정보 수정`);
            return updatedEmployee;
        } catch (error) {
            console.error('임직원 수정 중 오류:', error);
            throw error;
        }
    }

    async deleteEmployee(id) {
        try {
            const employee = this.employees.find(emp => emp.id === id);
            await this.api.deleteEmployee(id);

            this.employees = this.employees.filter(emp => emp.id !== id);
            this.addActivity('관리자', `직원 ${employee?.name} 삭제`);
            return true;
        } catch (error) {
            console.error('임직원 삭제 중 오류:', error);
            throw error;
        }
    }

    async addHardware(hardware) {
        try {
            const newHardware = await this.api.createHardware({
                type: hardware.type,
                manufacturer: hardware.manufacturer,
                model: hardware.model,
                serial_number: hardware.serial,
                purchase_date: hardware.purchaseDate,
                price: hardware.price,
                notes: hardware.notes
            });

            this.hardware.push(newHardware);
            this.addActivity('관리자', `하드웨어 자산 ${newHardware.id} 등록`);
            return newHardware;
        } catch (error) {
            console.error('하드웨어 등록 중 오류:', error);
            throw error;
        }
    }

    async updateHardware(id, hardware) {
        try {
            const updatedHardware = await this.api.updateHardware(id, {
                type: hardware.type,
                manufacturer: hardware.manufacturer,
                model: hardware.model,
                serial_number: hardware.serial,
                purchase_date: hardware.purchaseDate,
                price: hardware.price,
                notes: hardware.notes,
                status: hardware.status
            });

            const index = this.hardware.findIndex(hw => hw.id === id);
            if (index !== -1) {
                this.hardware[index] = updatedHardware;
            }
            this.addActivity('관리자', `하드웨어 자산 ${id} 정보 수정`);
            return updatedHardware;
        } catch (error) {
            console.error('하드웨어 수정 중 오류:', error);
            throw error;
        }
    }

    async addSoftware(software) {
        try {
            const newSoftware = await this.api.createSoftware({
                name: software.name,
                manufacturer: software.manufacturer,
                version: software.version,
                type: software.type,
                license_type: software.licenseType,
                total_licenses: software.totalLicenses,
                purchase_date: software.purchaseDate,
                expiry_date: software.expiryDate,
                price: software.price
            });

            this.software.push(newSoftware);
            this.addActivity('관리자', `소프트웨어 ${newSoftware.name} 등록`);
            return newSoftware;
        } catch (error) {
            console.error('소프트웨어 등록 중 오류:', error);
            throw error;
        }
    }

    // 통합 자산 할당 메소드 (하드웨어 + 소프트웨어)
    async assignAsset(employeeId, assetId, assetType, assignDate, notes) {
        try {
            const newAssignment = await this.api.createAssignment({
                employee_id: employeeId,
                asset_type: assetType,
                asset_id: assetId,
                notes: notes
            });

            // 로컬 데이터 업데이트
            this.assignments.push(newAssignment);

            // 자산 상태 업데이트
            if (assetType === 'hardware') {
                const asset = this.hardware.find(hw => hw.id === assetId);
                if (asset) {
                    asset.status = '사용중';
                    asset.assigned_to = employeeId;
                }
            } else if (assetType === 'software') {
                const asset = this.software.find(sw => sw.id === assetId);
                if (asset) {
                    asset.current_users = (asset.current_users || 0) + 1;
                }
            }

            const employee = this.employees.find(emp => emp.id === employeeId);
            this.addActivity('관리자', `${assetId} → ${employee?.name} 할당 (${assetType === 'hardware' ? '하드웨어' : '소프트웨어'})`);
            return newAssignment;
        } catch (error) {
            console.error('자산 할당 중 오류:', error);
            throw error;
        }
    }

    // 하위 호환성을 위한 기존 메소드 유지
    assignHardware(employeeId, hardwareId, assignDate, notes) {
        return this.assignAsset(employeeId, hardwareId, 'hardware', assignDate, notes);
    }

    async returnAsset(assignmentId) {
        try {
            const assignment = this.assignments.find(as => as.id === assignmentId);
            if (!assignment) return false;

            await this.api.returnAsset(assignmentId, '');

            // 로컬 데이터 업데이트
            assignment.status = '반납완료';
            assignment.return_date = new Date().toISOString().split('T')[0];

            // 자산 상태 업데이트
            if (assignment.asset_type === 'hardware') {
                const asset = this.hardware.find(hw => hw.id === assignment.asset_id);
                if (asset) {
                    asset.status = '대기중';
                    asset.assigned_to = null;
                }
            } else if (assignment.asset_type === 'software') {
                const asset = this.software.find(sw => sw.id === assignment.asset_id);
                if (asset) {
                    asset.current_users = Math.max(0, (asset.current_users || 1) - 1);
                }
            }

            const employee = this.employees.find(emp => emp.id === assignment.employee_id);
            this.addActivity('관리자', `${assignment.asset_id} ← ${employee?.name} 반납`);
            return true;
        } catch (error) {
            console.error('자산 반납 중 오류:', error);
            throw error;
        }
    }

    // 하위 호환성을 위한 기존 메소드 유지
    returnHardware(assignmentId) {
        return this.returnAsset(assignmentId);
    }

}

// 글로벌 데이터 스토어
const dataStore = new DataStore();


// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 테스트용: 강제로 토큰 제거해서 로그인 모달 테스트
    console.log('🧪 Testing: Clearing localStorage to force login modal');
    localStorage.removeItem('inventory_token');
    localStorage.removeItem('inventory_user');
    
    initializeApp();
});

function initializeApp() {
    console.log('🔧 initializeApp() called');
    setupEventListeners();
    setupLoginModal();
    showTab('dashboard');
    
    // 인증 상태 확인 및 데이터 로드
    console.log('🔧 Calling dataStore.initializeData()');
    dataStore.initializeData();
    // 통계와 대시보드는 데이터 로드 후 자동으로 업데이트됨
}

function setupEventListeners() {
    // 탭 클릭 이벤트
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            showTab(tabName);
        });
    });

    // 검색 이벤트
    document.getElementById('employeeSearch')?.addEventListener('input', filterEmployees);
    document.getElementById('hardwareSearch')?.addEventListener('input', filterHardware);
    document.getElementById('softwareSearch')?.addEventListener('input', filterSoftware);
    document.getElementById('assignmentSearch')?.addEventListener('input', filterAssignments);

    // 필터 이벤트
    document.getElementById('departmentFilter')?.addEventListener('change', filterEmployees);
    document.getElementById('assetTypeFilter')?.addEventListener('change', filterHardware);
    document.getElementById('statusFilter')?.addEventListener('change', filterHardware);
    document.getElementById('softwareTypeFilter')?.addEventListener('change', filterSoftware);

    // 폼 제출 이벤트
    document.getElementById('employeeForm')?.addEventListener('submit', handleEmployeeSubmit);
    document.getElementById('hardwareForm')?.addEventListener('submit', handleHardwareSubmit);
    document.getElementById('softwareForm')?.addEventListener('submit', handleSoftwareSubmit);
    document.getElementById('assignmentForm')?.addEventListener('submit', handleAssignmentSubmit);

    // 모달 외부 클릭시 닫기
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function showTab(tabName) {
    // 모든 탭 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // 선택된 탭 표시
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 탭별 데이터 렌더링
    switch(tabName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'employees':
            renderEmployees();
            break;
        case 'hardware':
            renderHardware();
            break;
        case 'software':
            renderSoftware();
            break;
        case 'assignment':
            renderAssignments();
            break;
    }
}

function updateStatistics() {
    document.getElementById('totalEmployees').textContent = dataStore.employees.length;
    document.getElementById('totalAssets').textContent = dataStore.hardware.length;
    document.getElementById('totalSoftware').textContent = dataStore.software.length;
}

function renderDashboard() {
    updateStatistics();
    renderLicenseStatus();
    renderRecentActivities();
    renderAssetChart();
    
    // 대시보드의 PDF 뷰어 초기화
    setTimeout(() => {
        initializePdfScrollFix();
    }, 100);
}

function renderLicenseStatus() {
    const office = dataStore.software.find(sw => sw.name.includes('Office'));
    const windows = dataStore.software.find(sw => sw.name.includes('Windows'));
    const adobe = dataStore.software.find(sw => sw.name.includes('Adobe'));

    document.getElementById('officeCount').textContent = office ? (office.current_users || office.usedLicenses || 0) : 0;
    document.getElementById('windowsCount').textContent = windows ? (windows.current_users || windows.usedLicenses || 0) : 0;
    document.getElementById('adobeCount').textContent = adobe ? (adobe.current_users || adobe.usedLicenses || 0) : 0;
}

function renderRecentActivities() {
    const container = document.getElementById('recentActivities');
    const activities = dataStore.activities.slice(0, 10);

    if (activities.length === 0) {
        container.innerHTML = '<div class="empty-state">최근 활동이 없습니다.</div>';
        return;
    }

    container.innerHTML = activities.map(activity => {
        const date = activity.created_at ? new Date(activity.created_at) : new Date(activity.timestamp);
        const timeString = date.toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit', 
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const userName = activity.user_name || activity.user || '시스템';
        
        return `
            <div class="activity-item">
                <div>${activity.action}</div>
                <div class="activity-time">${timeString} - ${userName}</div>
            </div>
        `;
    }).join('');
}

function renderAssetChart() {
    const canvas = document.getElementById('assetChart');
    if (!canvas) {
        console.error('assetChart 캔버스를 찾을 수 없습니다.');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('📊 자산현황 차트 렌더링 시작');
    console.log('📊 전체 하드웨어 개수:', dataStore.hardware.length);

    // 간단한 도넛 차트
    const data = {
        '사용중': dataStore.hardware.filter(hw => hw.status === '사용중').length,
        '대기중': dataStore.hardware.filter(hw => hw.status === '대기중').length,
        '수리중': dataStore.hardware.filter(hw => hw.status === '수리중').length,
        '폐기': dataStore.hardware.filter(hw => hw.status === '폐기').length
    };

    console.log('📊 자산 상태별 데이터:', data);
    
    const colors = ['#28a745', '#ffc107', '#dc3545', '#6c757d'];
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    console.log('📊 총 자산 수:', total);

    if (total === 0) {
        console.log('📊 자산이 없어서 차트를 그리지 않습니다.');
        // 자산이 없을 때도 "데이터 없음" 메시지 표시
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('자산 데이터 없음', canvas.width/2, canvas.height/2);
        return;
    }

    let currentAngle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.entries(data).forEach(([, value], index) => {
        if (value > 0) {
            const sliceAngle = (value / total) * 2 * Math.PI;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, 40, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors[index];
            ctx.fill();

            currentAngle += sliceAngle;
        }
    });

    // 범례
    ctx.font = '12px Arial';
    let legendY = 20;
    Object.entries(data).forEach(([label, value], index) => {
        if (value > 0) {
            ctx.fillStyle = colors[index];
            ctx.fillRect(10, legendY, 15, 15);
            ctx.fillStyle = '#333';
            ctx.fillText(`${label}: ${value}개`, 30, legendY + 12);
            legendY += 25;
        }
    });
}

function renderEmployees() {
    const tbody = document.querySelector('#employeeTable tbody');
    const employees = dataStore.employees;

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">등록된 임직원이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = employees.map(emp => {
        const assignedAssets = dataStore.assignments.filter(as =>
            as.employeeId === emp.id && as.status === '할당중'
        ).length;

        return `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td><span class="status-badge status-assigned">${assignedAssets}개</span></td>
                <td>
                    <button class="btn btn-sm" onclick="editEmployee('${emp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployeeConfirm('${emp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderHardware() {
    const tbody = document.querySelector('#hardwareTable tbody');
    const hardware = dataStore.hardware;

    if (hardware.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">등록된 하드웨어 자산이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = hardware.map(hw => {
        const assignedEmployee = dataStore.employees.find(emp => emp.id === hw.assignedTo);
        const statusClass = getStatusClass(hw.status);

        return `
            <tr>
                <td>${hw.id}</td>
                <td>${hw.type}</td>
                <td>${hw.manufacturer}</td>
                <td>${hw.model}</td>
                <td>${hw.serial}</td>
                <td>${formatDate(hw.purchaseDate)}</td>
                <td><span class="status-badge ${statusClass}">${hw.status}</span></td>
                <td>${assignedEmployee ? assignedEmployee.name : '-'}</td>
                <td>
                    <button class="btn btn-sm" onclick="editHardware('${hw.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteHardwareConfirm('${hw.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderSoftware() {
    const tbody = document.querySelector('#softwareTable tbody');
    const software = dataStore.software;

    if (software.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">등록된 소프트웨어가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = software.map(sw => {
        const licenseType = sw.license_type || sw.licenseType || '';
        const totalLicenses = sw.total_licenses || sw.totalLicenses || 0;
        const currentUsers = sw.current_users || sw.usedLicenses || 0;
        const remainingLicenses = totalLicenses - currentUsers;
        
        return `
            <tr>
                <td>${sw.name || ''}</td>
                <td>${sw.manufacturer || ''}</td>
                <td>${sw.version || ''}</td>
                <td>${sw.type || ''}</td>
                <td>${licenseType}</td>
                <td>${totalLicenses}</td>
                <td>${currentUsers}</td>
                <td>${remainingLicenses}</td>
                <td>
                    <button class="btn btn-sm" onclick="editSoftware('${sw.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSoftwareConfirm('${sw.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderAssignments() {
    console.log('renderAssignments 호출됨');
    console.log('전체 assignments:', dataStore.assignments);

    const tbody = document.querySelector('#assignmentTable tbody');
    // API에서는 '사용중' 상태를 사용함
    const assignments = dataStore.assignments.filter(as => as.status === '사용중');

    console.log('사용중인 assignments:', assignments);

    if (assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">현재 할당된 자산이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = assignments.map(assignment => {
        // API 필드명 매핑: employee_id, asset_type, assigned_date
        const employee = dataStore.employees.find(emp => emp.id === assignment.employee_id);

        let asset = null;
        let assetType = '';
        let assetId = assignment.asset_id;
        let assetName = '';

        console.log('🔍 할당 정보:', {
            id: assignment.id,
            employee_id: assignment.employee_id,
            asset_type: assignment.asset_type,
            asset_id: assignment.asset_id,
            employee_name: assignment.employee_name
        });

        // API 응답 기준으로 수정
        if (assignment.asset_type === 'hardware') {
            asset = dataStore.hardware.find(hw => hw.id === assignment.asset_id);
            assetType = asset ? asset.type : '하드웨어';
            assetName = asset ? `${asset.manufacturer} ${asset.model}` : assignment.asset_description || '-';
        } else if (assignment.asset_type === 'software') {
            asset = dataStore.software.find(sw => sw.id === assignment.asset_id);
            assetType = '소프트웨어';
            assetName = asset ? asset.name : assignment.asset_description || '-';
        }

        return `
            <tr>
                <td>${formatDate(assignment.assigned_date)}</td>
                <td>${assignment.employee_name || (employee ? employee.name : '알 수 없음')}</td>
                <td>${employee ? employee.department : '-'}</td>
                <td>${assetType}</td>
                <td>${assetId || '알 수 없음'}</td>
                <td>${assetName}</td>
                <td><span class="status-badge status-assigned">사용중</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="returnAsset('${assignment.id}')">
                        <i class="fas fa-undo"></i> 반납
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // 할당 모달의 드롭다운 업데이트
    updateAssignmentDropdowns();
}

// 모달 함수들
function showEmployeeModal(employeeId = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');

    // 폼 초기화
    form.reset();

    // 편집 모드인 경우 기존 데이터 로드
    if (employeeId) {
        const employee = dataStore.employees.find(emp => emp.id === employeeId);
        if (employee) {
            // 숨겨진 input에 ID 저장 (편집 모드 구분용)
            form.setAttribute('data-employee-id', employee.id);

            document.getElementById('empName').value = employee.name;
            document.getElementById('empDepartment').value = employee.department;
            document.getElementById('empEmail').value = employee.email || '';
            document.getElementById('empPhone').value = employee.phone || '';
        }
    } else {
        // 신규 등록 모드
        form.removeAttribute('data-employee-id');
    }

    modal.style.display = 'block';
}

function showHardwareModal(hardwareId = null) {
    const modal = document.getElementById('hardwareModal');
    const form = document.getElementById('hardwareForm');

    if (hardwareId) {
        const hardware = dataStore.hardware.find(hw => hw.id === hardwareId);
        if (hardware) {
            document.getElementById('hwAssetTag').value = hardware.id;
            document.getElementById('hwType').value = hardware.type;
            document.getElementById('hwManufacturer').value = hardware.manufacturer;
            document.getElementById('hwModel').value = hardware.model;
            document.getElementById('hwSerial').value = hardware.serial;
            document.getElementById('hwPurchaseDate').value = hardware.purchaseDate;
            document.getElementById('hwPrice').value = hardware.price;
            document.getElementById('hwStatus').value = hardware.status;
            document.getElementById('hwNotes').value = hardware.notes;
            document.getElementById('hwAssetTag').disabled = true;
        }
    } else {
        form.reset();
        document.getElementById('hwAssetTag').disabled = false;
    }

    modal.style.display = 'block';
}

function showSoftwareModal(softwareId = null) {
    const modal = document.getElementById('softwareModal');
    const form = document.getElementById('softwareForm');

    // 폼 초기화
    form.reset();

    if (softwareId) {
        const software = dataStore.software.find(sw => sw.id === softwareId);
        console.log('편집할 소프트웨어 데이터:', software);
        
        if (software) {
            // 편집 모드임을 표시
            form.setAttribute('data-software-id', software.id);
            
            document.getElementById('swName').value = software.name || '';
            document.getElementById('swManufacturer').value = software.manufacturer || '';
            document.getElementById('swVersion').value = software.version || '';
            document.getElementById('swType').value = software.type || '';
            // API 필드명이 license_type이므로 이를 사용
            document.getElementById('swLicenseType').value = software.license_type || software.licenseType || '';
            document.getElementById('swTotalLicenses').value = software.total_licenses || software.totalLicenses || 1;
            document.getElementById('swPurchaseDate').value = software.purchase_date || software.purchaseDate || '';
            document.getElementById('swExpiryDate').value = software.expiry_date || software.expiryDate || '';
            document.getElementById('swPrice').value = software.price || '';
            
            console.log('라이선스 유형 설정:', software.license_type || software.licenseType);
        }
    } else {
        // 신규 생성 모드
        form.removeAttribute('data-software-id');
    }

    modal.style.display = 'block';
}

async function showAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignDate').value = new Date().toISOString().split('T')[0];

    // 자산 선택 드롭다운 초기화
    document.getElementById('hardwareGroup').style.display = 'none';
    document.getElementById('softwareGroup').style.display = 'none';
    document.getElementById('assignHardware').required = false;
    document.getElementById('assignSoftware').required = false;

    // 최신 데이터를 로드한 후 드롭다운 업데이트
    try {
        await dataStore.loadAllData();
        updateAssignmentDropdowns();
    } catch (error) {
        console.error('데이터 로드 중 오류:', error);
        updateAssignmentDropdowns(); // 실패 시에도 기존 데이터로 시도
    }
    
    modal.style.display = 'block';
}

function updateAssignmentDropdowns(updateEmployee = true) {
    const employeeSelect = document.getElementById('assignEmployee');
    const hardwareSelect = document.getElementById('assignHardware');
    const softwareSelect = document.getElementById('assignSoftware');

    // updateEmployee가 true일 때만 임직원 드롭다운 업데이트
    if (employeeSelect && updateEmployee) {
        // 현재 선택된 값을 보존
        const currentEmployeeValue = employeeSelect.value;
        console.log('🔍 updateAssignmentDropdowns - 임직원 현재 값:', currentEmployeeValue);
        
        employeeSelect.innerHTML = '<option value="">선택하세요</option>' +
            dataStore.employees.map(emp =>
                `<option value="${emp.id}">${emp.name} (${emp.department})</option>`
            ).join('');
            
        // 이전 선택 값 복원
        if (currentEmployeeValue) {
            employeeSelect.value = currentEmployeeValue;
            console.log('🔍 updateAssignmentDropdowns - 임직원 값 복원:', employeeSelect.value);
        }
    } else if (employeeSelect && !updateEmployee) {
        console.log('🔍 updateAssignmentDropdowns - 임직원 드롭다운 스킵 (현재 값 유지):', employeeSelect.value);
    }

    if (hardwareSelect) {
        console.log('🔧 전체 하드웨어 데이터:', dataStore.hardware);
        
        // 현재 선택된 값을 보존
        const currentHardwareValue = hardwareSelect.value;
        
        // 할당 가능한 하드웨어: 대기중이거나 assigned_to가 null인 경우
        const availableHardware = dataStore.hardware.filter(hw => 
            hw.status === '대기중' || hw.status === '사용가능' || 
            (hw.assigned_to === null && hw.status !== '폐기' && hw.status !== '수리중')
        );
        console.log('🔧 할당 가능한 하드웨어:', availableHardware);
        
        // 응급 상황을 위해 아무것도 없으면 모든 하드웨어 표시 (폐기 제외)
        let finalHardware = availableHardware;
        if (availableHardware.length === 0) {
            finalHardware = dataStore.hardware.filter(hw => hw.status !== '폐기');
            console.log('🚨 응급 모드: 모든 하드웨어 표시 (폐기 제외):', finalHardware);
        }
        
        hardwareSelect.innerHTML = '<option value="">선택하세요</option>' +
            finalHardware.map(hw =>
                `<option value="${hw.id}">${hw.id} - ${hw.type} ${hw.manufacturer} ${hw.model} (${hw.status})</option>`
            ).join('');
            
        // 이전 선택 값 복원 (해당 하드웨어가 여전히 available한 경우)
        if (currentHardwareValue && finalHardware.find(hw => hw.id === currentHardwareValue)) {
            hardwareSelect.value = currentHardwareValue;
        }
            
        console.log('🔧 최종 하드웨어 드롭다운 옵션 수:', finalHardware.length);
    }

    if (softwareSelect) {
        console.log('🔧 전체 소프트웨어 데이터:', dataStore.software);
        
        // 현재 선택된 값을 보존
        const currentSoftwareValue = softwareSelect.value;
        
        // API에서는 current_users 필드를 사용하므로 수정
        const availableSoftware = dataStore.software.filter(sw => {
            const currentUsers = sw.current_users || 0;
            const totalLicenses = sw.total_licenses || sw.totalLicenses || 1;
            return currentUsers < totalLicenses;
        });
        console.log('🔧 할당 가능한 소프트웨어:', availableSoftware);
        
        // 응급 상황을 위해 아무것도 없으면 모든 소프트웨어 표시
        let finalSoftware = availableSoftware;
        if (availableSoftware.length === 0) {
            finalSoftware = dataStore.software;
            console.log('🚨 응급 모드: 모든 소프트웨어 표시:', finalSoftware);
        }
        
        softwareSelect.innerHTML = '<option value="">선택하세요</option>' +
            finalSoftware.map(sw => {
                const currentUsers = sw.current_users || 0;
                const totalLicenses = sw.total_licenses || sw.totalLicenses || 1;
                const remainingLicenses = totalLicenses - currentUsers;
                return `<option value="${sw.id}">${sw.name} (${remainingLicenses}개 라이선스 남음)</option>`;
            }).join('');
            
        // 이전 선택 값 복원 (해당 소프트웨어가 여전히 available한 경우)
        if (currentSoftwareValue && finalSoftware.find(sw => sw.id === currentSoftwareValue)) {
            softwareSelect.value = currentSoftwareValue;
        }
            
        console.log('🔧 최종 소프트웨어 드롭다운 옵션 수:', finalSoftware.length);
    }
}

// 자산 유형에 따라 선택 옵션 업데이트
function updateAssetOptions() {
    const assetType = document.getElementById('assetType').value;
    const hardwareGroup = document.getElementById('hardwareGroup');
    const softwareGroup = document.getElementById('softwareGroup');
    const hardwareSelect = document.getElementById('assignHardware');
    const softwareSelect = document.getElementById('assignSoftware');
    const employeeSelect = document.getElementById('assignEmployee');

    console.log('🔄 자산 유형 변경:', assetType);
    console.log('🔍 자산 유형 변경 전 임직원 선택 값:', employeeSelect ? employeeSelect.value : 'NULL');

    if (assetType === 'hardware') {
        hardwareGroup.style.display = 'block';
        softwareGroup.style.display = 'none';
        hardwareSelect.required = true;
        softwareSelect.required = false;
        softwareSelect.value = '';
        
        // 하드웨어 드롭다운만 직접 업데이트 (임직원 드롭다운은 절대 건드리지 않음)
        console.log('🔄 하드웨어 선택 - 하드웨어 드롭다운만 업데이트');
        updateOnlyHardwareDropdown();
        console.log('🔍 하드웨어 선택 후 임직원 선택 값:', employeeSelect ? employeeSelect.value : 'NULL');
    } else if (assetType === 'software') {
        hardwareGroup.style.display = 'none';
        softwareGroup.style.display = 'block';
        hardwareSelect.required = false;
        softwareSelect.required = true;
        hardwareSelect.value = '';
        
        // 소프트웨어 드롭다운만 직접 업데이트 (임직원 드롭다운은 절대 건드리지 않음)
        console.log('🔄 소프트웨어 선택 - 소프트웨어 드롭다운만 업데이트');
        updateOnlySoftwareDropdown();
        console.log('🔍 소프트웨어 선택 후 임직원 선택 값:', employeeSelect ? employeeSelect.value : 'NULL');
    } else {
        hardwareGroup.style.display = 'none';
        softwareGroup.style.display = 'none';
        hardwareSelect.required = false;
        softwareSelect.required = false;
        hardwareSelect.value = '';
        softwareSelect.value = '';
        console.log('🔄 자산 유형 선택 해제 - 모든 드롭다운 숨김');
    }
}

// 하드웨어 드롭다운만 업데이트 (임직원 드롭다운은 절대 건드리지 않음)
function updateOnlyHardwareDropdown() {
    const hardwareSelect = document.getElementById('assignHardware');
    
    if (hardwareSelect) {
        console.log('🔧 하드웨어 드롭다운만 업데이트 - 전체 하드웨어 데이터:', dataStore.hardware.length, '개');
        
        // 현재 선택된 값을 보존
        const currentHardwareValue = hardwareSelect.value;
        
        // 할당 가능한 하드웨어: 대기중이거나 assigned_to가 null인 경우
        const availableHardware = dataStore.hardware.filter(hw => 
            hw.status === '대기중' || hw.status === '사용가능' || 
            (hw.assigned_to === null && hw.status !== '폐기' && hw.status !== '수리중')
        );
        console.log('🔧 할당 가능한 하드웨어:', availableHardware.length, '개');
        
        // 응급 상황을 위해 아무것도 없으면 모든 하드웨어 표시 (폐기 제외)
        let finalHardware = availableHardware;
        if (availableHardware.length === 0) {
            finalHardware = dataStore.hardware.filter(hw => hw.status !== '폐기');
            console.log('🚨 응급 모드: 모든 하드웨어 표시 (폐기 제외):', finalHardware.length, '개');
        }
        
        hardwareSelect.innerHTML = '<option value="">선택하세요</option>' +
            finalHardware.map(hw =>
                `<option value="${hw.id}">${hw.id} - ${hw.type} ${hw.manufacturer} ${hw.model} (${hw.status})</option>`
            ).join('');
            
        // 이전 선택 값 복원 (해당 하드웨어가 여전히 available한 경우)
        if (currentHardwareValue && finalHardware.find(hw => hw.id === currentHardwareValue)) {
            hardwareSelect.value = currentHardwareValue;
        }
            
        console.log('🔧 최종 하드웨어 드롭다운 옵션 수:', finalHardware.length, '개');
    }
}

// 소프트웨어 드롭다운만 업데이트 (임직원 드롭다운은 절대 건드리지 않음)
function updateOnlySoftwareDropdown() {
    const softwareSelect = document.getElementById('assignSoftware');
    
    if (softwareSelect) {
        console.log('🔧 소프트웨어 드롭다운만 업데이트 - 전체 소프트웨어 데이터:', dataStore.software.length, '개');
        
        // 현재 선택된 값을 보존
        const currentSoftwareValue = softwareSelect.value;
        
        // API에서는 current_users 필드를 사용하므로 수정
        const availableSoftware = dataStore.software.filter(sw => {
            const currentUsers = sw.current_users || 0;
            const totalLicenses = sw.total_licenses || sw.totalLicenses || 1;
            return currentUsers < totalLicenses;
        });
        console.log('🔧 할당 가능한 소프트웨어:', availableSoftware.length, '개');
        
        // 응급 상황을 위해 아무것도 없으면 모든 소프트웨어 표시
        let finalSoftware = availableSoftware;
        if (availableSoftware.length === 0) {
            finalSoftware = dataStore.software;
            console.log('🚨 응급 모드: 모든 소프트웨어 표시:', finalSoftware.length, '개');
        }
        
        softwareSelect.innerHTML = '<option value="">선택하세요</option>' +
            finalSoftware.map(sw => {
                const currentUsers = sw.current_users || 0;
                const totalLicenses = sw.total_licenses || sw.totalLicenses || 1;
                const remainingLicenses = totalLicenses - currentUsers;
                return `<option value="${sw.id}">${sw.name} ${sw.version || ''} (남은 라이선스: ${remainingLicenses}개)</option>`;
            }).join('');
            
        // 이전 선택 값 복원 (해당 소프트웨어가 여전히 available한 경우)
        if (currentSoftwareValue && finalSoftware.find(sw => sw.id === currentSoftwareValue)) {
            softwareSelect.value = currentSoftwareValue;
        }
            
        console.log('🔧 최종 소프트웨어 드롭다운 옵션 수:', finalSoftware.length, '개');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 폼 제출 핸들러들
async function handleEmployeeSubmit(event) {
    event.preventDefault();
    console.log('Employee form submitted');

    const form = document.getElementById('employeeForm');
    const employeeId = form.getAttribute('data-employee-id');

    // Get form elements with null checking
    const empNameEl = document.getElementById('empName');
    const empDepartmentEl = document.getElementById('empDepartment');
    const empEmailEl = document.getElementById('empEmail');
    const empPhoneEl = document.getElementById('empPhone');

    // Validate that required elements exist
    if (!empNameEl || !empDepartmentEl) {
        showAlert('폼 요소를 찾을 수 없습니다. 페이지를 새로고침해 주세요.', 'error');
        return;
    }

    const formData = {
        name: empNameEl.value.trim(),
        department: empDepartmentEl.value,
        position: '직원', // Default position since form doesn't have this field
        email: empEmailEl ? empEmailEl.value.trim() : '',
        phone: empPhoneEl ? empPhoneEl.value.trim() : ''
    };

    console.log('Form data:', formData);

    try {
        // 편집 모드인지 신규 등록인지 확인
        if (employeeId) {
            console.log('Updating employee:', employeeId);
            // 편집 모드: 기존 직원 정보 수정
            await dataStore.updateEmployee(employeeId, formData);
            showAlert('임직원 정보가 수정되었습니다.', 'success');
        } else {
            console.log('Adding new employee');
            // 신규 등록 모드: 새 직원 추가 (사번 자동 생성)
            const newEmployee = await dataStore.addEmployee(formData);
            console.log('New employee created:', newEmployee);
            showAlert(`임직원이 등록되었습니다. (사번: ${newEmployee.id})`, 'success');
        }

        closeModal('employeeModal');
        renderEmployees();
        updateStatistics();
    } catch (error) {
        console.error('Employee submit error details:', error);
        showAlert(`임직원 정보 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
}

async function handleHardwareSubmit(event) {
    event.preventDefault();

    const formData = {
        id: document.getElementById('hwAssetTag').value,
        type: document.getElementById('hwType').value,
        manufacturer: document.getElementById('hwManufacturer').value,
        model: document.getElementById('hwModel').value,
        serial: document.getElementById('hwSerial').value,
        purchaseDate: document.getElementById('hwPurchaseDate').value,
        price: parseInt(document.getElementById('hwPrice').value) || 0,
        status: document.getElementById('hwStatus').value,
        notes: document.getElementById('hwNotes').value
    };

    try {
        const existingHardware = dataStore.hardware.find(hw => hw.id === formData.id);

        if (existingHardware) {
            await dataStore.updateHardware(formData.id, formData);
        } else {
            await dataStore.addHardware(formData);
        }

        closeModal('hardwareModal');
        renderHardware();
        updateStatistics();
        showAlert('하드웨어 자산 정보가 저장되었습니다.', 'success');
    } catch (error) {
        showAlert('하드웨어 자산 정보 처리 중 오류가 발생했습니다.', 'error');
        console.error('Hardware submit error:', error);
    }
}

async function handleSoftwareSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('softwareForm');
    const softwareId = form.getAttribute('data-software-id');
    const isEditMode = !!softwareId;

    const formData = {
        name: document.getElementById('swName').value,
        manufacturer: document.getElementById('swManufacturer').value,
        version: document.getElementById('swVersion').value,
        type: document.getElementById('swType').value,
        license_type: document.getElementById('swLicenseType').value,  // API 필드명 맞춤
        total_licenses: parseInt(document.getElementById('swTotalLicenses').value) || 1,  // API 필드명 맞춤
        purchase_date: document.getElementById('swPurchaseDate').value,  // API 필드명 맞춤
        expiry_date: document.getElementById('swExpiryDate').value,  // API 필드명 맞춤
        price: parseInt(document.getElementById('swPrice').value) || 0
    };

    console.log('소프트웨어 제출:', { isEditMode, softwareId, formData });

    try {
        if (isEditMode) {
            // 편집 모드 - PUT 요청
            const response = await fetch(`${dataStore.api.baseUrl}/software/${softwareId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${dataStore.api.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '소프트웨어 수정에 실패했습니다.');
            }
        } else {
            // 신규 생성 모드 - POST 요청
            const response = await fetch(`${dataStore.api.baseUrl}/software`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${dataStore.api.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '소프트웨어 생성에 실패했습니다.');
            }
        }

        // 데이터 다시 로드
        await dataStore.loadAllData();

        closeModal('softwareModal');
        renderSoftware();
        updateStatistics();
        showAlert(`소프트웨어 정보가 ${isEditMode ? '수정' : '저장'}되었습니다.`, 'success');
    } catch (error) {
        showAlert(error.message || '소프트웨어 정보 처리 중 오류가 발생했습니다.', 'error');
        console.error('Software submit error:', error);
    }
}

async function handleAssignmentSubmit(event) {
    event.preventDefault();

    const employeeId = document.getElementById('assignEmployee').value;
    const assetType = document.getElementById('assetType').value;
    const assignDate = document.getElementById('assignDate').value;
    const notes = document.getElementById('assignNotes').value;

    let assetId = '';
    if (assetType === 'hardware') {
        assetId = document.getElementById('assignHardware').value;
    } else if (assetType === 'software') {
        assetId = document.getElementById('assignSoftware').value;
    }

    if (!employeeId || !assetType || !assetId) {
        showAlert('모든 필수 항목을 입력해주세요.', 'error');
        return;
    }

    try {
        const result = await dataStore.assignAsset(employeeId, assetId, assetType, assignDate, notes);

        if (result) {
            closeModal('assignmentModal');
            renderAssignments();
            if (assetType === 'hardware') {
                renderHardware();
            } else if (assetType === 'software') {
                renderSoftware();
            }
            renderDashboard();
            updateAssignmentDropdowns();
            showAlert('자산이 성공적으로 할당되었습니다.', 'success');
        } else {
            showAlert('자산 할당에 실패했습니다. 선택한 자산이 이미 할당되어 있거나 라이선스가 부족할 수 있습니다.', 'error');
        }
    } catch (error) {
        showAlert('자산 할당 처리 중 오류가 발생했습니다.', 'error');
        console.error('Assignment submit error:', error);
    }
}

// 편집 함수들
function editEmployee(employeeId) {
    showEmployeeModal(employeeId);
}

function editHardware(hardwareId) {
    showHardwareModal(hardwareId);
}

function editSoftware(softwareId) {
    showSoftwareModal(softwareId);
}

// 삭제 함수들
function deleteEmployeeConfirm(employeeId) {
    if (confirm('정말로 이 임직원을 삭제하시겠습니까?')) {
        if (dataStore.deleteEmployee(employeeId)) {
            renderEmployees();
            updateStatistics();
            showAlert('임직원이 삭제되었습니다.', 'success');
        }
    }
}

async function deleteHardwareConfirm(hardwareId) {
    if (confirm('정말로 이 하드웨어 자산을 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`${dataStore.api.baseUrl}/hardware/${hardwareId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${dataStore.api.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // 데이터 다시 로드
                await dataStore.loadAllData();
                renderHardware();
                updateStatistics();
                showAlert('하드웨어 자산이 삭제되었습니다.', 'success');
            } else {
                const errorData = await response.json();
                showAlert(errorData.error || '하드웨어 삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Hardware delete error:', error);
            showAlert('하드웨어 삭제 중 오류가 발생했습니다.', 'error');
        }
    }
}

async function deleteSoftwareConfirm(softwareId) {
    if (confirm('정말로 이 소프트웨어를 삭제하시겠습니까?')) {
        try {
            const response = await fetch(`${dataStore.api.baseUrl}/software/${softwareId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${dataStore.api.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // 데이터 다시 로드
                await dataStore.loadAllData();
                renderSoftware();
                updateStatistics();
                showAlert('소프트웨어가 삭제되었습니다.', 'success');
            } else {
                const errorData = await response.json();
                showAlert(errorData.error || '소프트웨어 삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Software delete error:', error);
            showAlert('소프트웨어 삭제 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 글로벌 자산 반납 함수 (HTML onclick에서 호출)
async function returnAsset(assignmentId) {
    console.log('자산 반납 처리 시작:', assignmentId);

    if (confirm('이 자산을 반납 처리하시겠습니까?')) {
        try {
            const result = await dataStore.returnAsset(assignmentId);
            if (result) {
                renderAssignments();
                renderHardware();
                renderDashboard();
                showAlert('자산이 성공적으로 반납되었습니다.', 'success');
            } else {
                showAlert('자산 반납에 실패했습니다. 할당 정보를 확인해주세요.', 'error');
            }
        } catch (error) {
            console.error('반납 처리 중 오류:', error);
            showAlert('반납 처리 중 오류가 발생했습니다: ' + error.message, 'error');
        }
    }
}

// 하위 호환성을 위한 별칭
async function returnHardware(assignmentId) {
    return await returnAsset(assignmentId);
}

// 필터링 함수들
function filterEmployees() {
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
    const departmentFilter = document.getElementById('departmentFilter').value;

    const filtered = dataStore.employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm) ||
                            emp.id.toLowerCase().includes(searchTerm) ||
                            emp.department.toLowerCase().includes(searchTerm);
        const matchesDepartment = !departmentFilter || emp.department === departmentFilter;

        return matchesSearch && matchesDepartment;
    });

    renderFilteredEmployees(filtered);
}

function filterHardware() {
    const searchTerm = document.getElementById('hardwareSearch').value.toLowerCase();
    const typeFilter = document.getElementById('assetTypeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = dataStore.hardware.filter(hw => {
        const matchesSearch = hw.id.toLowerCase().includes(searchTerm) ||
                            hw.model.toLowerCase().includes(searchTerm) ||
                            hw.manufacturer.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || hw.type === typeFilter;
        const matchesStatus = !statusFilter || hw.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    renderFilteredHardware(filtered);
}

function filterSoftware() {
    const searchTerm = document.getElementById('softwareSearch').value.toLowerCase();
    const typeFilter = document.getElementById('softwareTypeFilter').value;

    const filtered = dataStore.software.filter(sw => {
        const matchesSearch = sw.name.toLowerCase().includes(searchTerm) ||
                            sw.manufacturer.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || sw.type === typeFilter;

        return matchesSearch && matchesType;
    });

    renderFilteredSoftware(filtered);
}

function filterAssignments() {
    const searchTerm = document.getElementById('assignmentSearch').value.toLowerCase();

    const filtered = dataStore.assignments.filter(assignment => {
        // API 필드명 사용: employee_id, asset_id, employee_name
        const employee = dataStore.employees.find(emp => emp.id === assignment.employee_id);
        
        let asset = null;
        if (assignment.asset_type === 'hardware') {
            asset = dataStore.hardware.find(hw => hw.id === assignment.asset_id);
        } else if (assignment.asset_type === 'software') {
            asset = dataStore.software.find(sw => sw.id === assignment.asset_id);
        }

        const matchesSearch = (assignment.employee_name && assignment.employee_name.toLowerCase().includes(searchTerm)) ||
                            (employee && employee.name.toLowerCase().includes(searchTerm)) ||
                            (assignment.asset_id && assignment.asset_id.toLowerCase().includes(searchTerm)) ||
                            (asset && asset.name && asset.name.toLowerCase().includes(searchTerm));

        // API에서는 '사용중' 상태 사용
        return matchesSearch && assignment.status === '사용중';
    });

    renderFilteredAssignments(filtered);
}

// 필터된 결과 렌더링 함수들
function renderFilteredEmployees(employees) {
    const tbody = document.querySelector('#employeeTable tbody');

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">검색 결과가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = employees.map(emp => {
        const assignedAssets = dataStore.assignments.filter(as =>
            as.employeeId === emp.id && as.status === '할당중'
        ).length;

        return `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td><span class="status-badge status-assigned">${assignedAssets}개</span></td>
                <td>
                    <button class="btn btn-sm" onclick="editEmployee('${emp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEmployeeConfirm('${emp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderFilteredHardware(hardware) {
    const tbody = document.querySelector('#hardwareTable tbody');

    if (hardware.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">검색 결과가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = hardware.map(hw => {
        const assignedEmployee = dataStore.employees.find(emp => emp.id === hw.assignedTo);
        const statusClass = getStatusClass(hw.status);

        return `
            <tr>
                <td>${hw.id}</td>
                <td>${hw.type}</td>
                <td>${hw.manufacturer}</td>
                <td>${hw.model}</td>
                <td>${hw.serial}</td>
                <td>${formatDate(hw.purchaseDate)}</td>
                <td><span class="status-badge ${statusClass}">${hw.status}</span></td>
                <td>${assignedEmployee ? assignedEmployee.name : '-'}</td>
                <td>
                    <button class="btn btn-sm" onclick="editHardware('${hw.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteHardwareConfirm('${hw.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderFilteredSoftware(software) {
    const tbody = document.querySelector('#softwareTable tbody');

    if (software.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">검색 결과가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = software.map(sw => {
        const licenseType = sw.license_type || sw.licenseType || '';
        const totalLicenses = sw.total_licenses || sw.totalLicenses || 0;
        const currentUsers = sw.current_users || sw.usedLicenses || 0;
        const remainingLicenses = totalLicenses - currentUsers;
        
        return `
            <tr>
                <td>${sw.name || ''}</td>
                <td>${sw.manufacturer || ''}</td>
                <td>${sw.version || ''}</td>
                <td>${sw.type || ''}</td>
                <td>${licenseType}</td>
                <td>${totalLicenses}</td>
                <td>${currentUsers}</td>
                <td>${remainingLicenses}</td>
                <td>
                    <button class="btn btn-sm" onclick="editSoftware('${sw.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSoftwareConfirm('${sw.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderFilteredAssignments(assignments) {
    const tbody = document.querySelector('#assignmentTable tbody');

    if (assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">검색 결과가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = assignments.map(assignment => {
        // API 필드명 사용: employee_id, asset_type, asset_id
        const employee = dataStore.employees.find(emp => emp.id === assignment.employee_id);

        let asset = null;
        let assetType = '';
        let assetName = '';

        if (assignment.asset_type === 'hardware') {
            asset = dataStore.hardware.find(hw => hw.id === assignment.asset_id);
            assetType = asset ? asset.type : '하드웨어';
            assetName = asset ? `${asset.manufacturer} ${asset.model}` : assignment.asset_description || '-';
        } else if (assignment.asset_type === 'software') {
            asset = dataStore.software.find(sw => sw.id === assignment.asset_id);
            assetType = '소프트웨어';
            assetName = asset ? asset.name : assignment.asset_description || '-';
        }

        return `
            <tr>
                <td>${formatDate(assignment.assigned_date)}</td>
                <td>${assignment.employee_name || (employee ? employee.name : '알 수 없음')}</td>
                <td>${employee ? employee.department : '-'}</td>
                <td>${assetType}</td>
                <td>${assignment.asset_id || '알 수 없음'}</td>
                <td>${assetName}</td>
                <td><span class="status-badge status-assigned">사용중</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="returnAsset('${assignment.id}')">
                        <i class="fas fa-undo"></i> 반납
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 유틸리티 함수들
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
}

function getStatusClass(status) {
    switch(status) {
        case '사용중': return 'status-assigned';
        case '대기중': return 'status-available';
        case '수리중': return 'status-maintenance';
        case '폐기': return 'status-retired';
        default: return '';
    }
}

function showAlert(message, type = 'success') {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 새 알림 생성
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // 컨테이너 상단에 추가
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);

    // 3초 후 자동 제거
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// 엑셀 내보내기 함수
function exportToExcel(dataType) {
    let data, filename;

    switch(dataType) {
        case 'employees':
            data = prepareEmployeeData();
            filename = `임직원목록_${getCurrentDate()}.xlsx`;
            break;
        case 'hardware':
            data = prepareHardwareData();
            filename = `하드웨어자산_${getCurrentDate()}.xlsx`;
            break;
        case 'software':
            data = prepareSoftwareData();
            filename = `소프트웨어인벤토리_${getCurrentDate()}.xlsx`;
            break;
        case 'assignments':
            data = prepareAssignmentData();
            filename = `자산할당현황_${getCurrentDate()}.xlsx`;
            break;
        default:
            showAlert('알 수 없는 데이터 유형입니다.', 'error');
            return;
    }

    if (data.length === 0) {
        showAlert('내보낼 데이터가 없습니다.', 'warning');
        return;
    }

    try {
        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, dataType);

        // 파일 다운로드
        XLSX.writeFile(wb, filename);

        showAlert(`${filename} 파일이 다운로드되었습니다.`, 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        showAlert('엑셀 파일 생성 중 오류가 발생했습니다.', 'error');
    }
}

// 임직원 데이터 준비
function prepareEmployeeData() {
    return dataStore.employees.map(emp => {
        const assignedAssets = dataStore.assignments.filter(as =>
            as.employeeId === emp.id && as.status === '할당중'
        ).length;

        return {
            '사번': emp.id,
            '이름': emp.name,
            '부서': emp.department,
            '이메일': emp.email || '',
            '연락처': emp.phone || '',
            '할당된 자산 수': assignedAssets
        };
    });
}

// 하드웨어 데이터 준비
function prepareHardwareData() {
    return dataStore.hardware.map(hw => {
        const assignedEmployee = dataStore.employees.find(emp => emp.id === hw.assignedTo);

        return {
            '자산태그': hw.id,
            '유형': hw.type,
            '제조사': hw.manufacturer || '',
            '모델명': hw.model || '',
            '시리얼번호': hw.serial || '',
            '구입일': hw.purchaseDate || '',
            '구입가격': hw.price || 0,
            '상태': hw.status,
            '할당자': assignedEmployee ? assignedEmployee.name : '',
            '할당자 부서': assignedEmployee ? assignedEmployee.department : '',
            '비고': hw.notes || ''
        };
    });
}

// 소프트웨어 데이터 준비
function prepareSoftwareData() {
    return dataStore.software.map(sw => {
        const totalLicenses = sw.total_licenses || sw.totalLicenses || 0;
        const currentUsers = sw.current_users || sw.usedLicenses || 0;
        const remainingLicenses = totalLicenses - currentUsers;
        const usageRate = totalLicenses > 0 ?
            Math.round((currentUsers / totalLicenses) * 100) : 0;

        return {
            '소프트웨어명': sw.name,
            '제조사': sw.manufacturer || '',
            '버전': sw.version || '',
            '유형': sw.type,
            '라이선스 유형': sw.license_type || sw.licenseType || '',
            '총 라이선스': totalLicenses,
            '사용중 라이선스': currentUsers,
            '남은 라이선스': remainingLicenses,
            '사용률(%)': usageRate,
            '구입일': sw.purchaseDate || '',
            '만료일': sw.expiryDate || '',
            '구입가격': sw.price || 0
        };
    });
}

// 자산 할당 데이터 준비
function prepareAssignmentData() {
    const activeAssignments = dataStore.assignments.filter(as => as.status === '할당중');

    return activeAssignments.map(assignment => {
        const employee = dataStore.employees.find(emp => emp.id === assignment.employeeId);
        const hardware = dataStore.hardware.find(hw => hw.id === assignment.hardwareId);
        const assignDate = new Date(assignment.assignDate);
        const daysSinceAssign = Math.floor((new Date() - assignDate) / (1000 * 60 * 60 * 24));

        return {
            '할당ID': assignment.id,
            '할당일': assignment.assignDate,
            '할당 경과일': daysSinceAssign,
            '사번': employee ? employee.id : '알 수 없음',
            '임직원명': employee ? employee.name : '알 수 없음',
            '부서': employee ? employee.department : '',
            '자산태그': hardware ? hardware.id : '알 수 없음',
            '자산유형': hardware ? hardware.type : '',
            '제조사': hardware ? hardware.manufacturer : '',
            '모델명': hardware ? hardware.model : '',
            '시리얼번호': hardware ? hardware.serial : '',
            '상태': '할당중',
            '비고': assignment.notes || ''
        };
    });
}

// 현재 날짜를 YYYYMMDD 형식으로 반환
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// PDF 매뉴얼 관련 함수들
function openPdfInNewTab() {
    window.open('SMART_Check_Plus_User_Manual_V2.0.pdf', '_blank');
}

function downloadPdf() {
    const link = document.createElement('a');
    link.href = 'SMART_Check_Plus_User_Manual_V2.0.pdf';
    link.download = 'SW_라이선스_점검_매뉴얼_V2.0.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// PDF 뷰어 전환 함수들
function showPdfEmbed() {
    const embedViewer = document.getElementById('embedViewer');
    const objectViewer = document.getElementById('objectViewer');
    const tabs = document.querySelectorAll('.pdf-tab');

    // 뷰어 전환
    embedViewer.style.display = 'block';
    objectViewer.style.display = 'none';

    // 탭 활성화 상태 변경
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[0].classList.add('active');
}

function showPdfObject() {
    const embedViewer = document.getElementById('embedViewer');
    const objectViewer = document.getElementById('objectViewer');
    const tabs = document.querySelectorAll('.pdf-tab');

    // 뷰어 전환
    embedViewer.style.display = 'none';
    objectViewer.style.display = 'block';

    // 탭 활성화 상태 변경
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[1].classList.add('active');
}

// PDF 뷰어에서 마우스 휠 스크롤 시 페이지 스크롤 개선
function initializePdfScrollFix() {
    const pdfContainer = document.querySelector('.pdf-viewer-container');
    if (!pdfContainer) return;

    let isScrollingInPdf = false;

    pdfContainer.addEventListener('mouseenter', function() {
        isScrollingInPdf = true;
    });

    pdfContainer.addEventListener('mouseleave', function() {
        isScrollingInPdf = false;
    });

    // PDF 컨테이너에서 스크롤 이벤트 처리
    pdfContainer.addEventListener('wheel', function(e) {
        const container = e.currentTarget;
        const iframe = container.querySelector('iframe:not([style*="display: none"])') ||
                      container.querySelector('object:not([style*="display: none"])');

        if (!iframe) return;

        // PDF 뷰어가 맨 위나 맨 아래에 있을 때만 페이지 스크롤 허용
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (e.deltaY < 0 && scrollTop === 0) {
            // 페이지 맨 위에서 위로 스크롤 시 기본 동작 허용
            return;
        }

        if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
            // 페이지 맨 아래에서 아래로 스크롤 시 기본 동작 허용
            return;
        }
    }, { passive: true });
}

// 로그인 모달 관련 함수들
function setupLoginModal() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        // 포커스를 사용자명 입력 필드로 이동
        const usernameField = document.getElementById('loginUsername');
        if (usernameField) {
            setTimeout(() => usernameField.focus(), 100);
        }
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideLoginError() {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showLoginError('사용자명과 비밀번호를 입력하세요.');
        return;
    }
    
    try {
        hideLoginError();
        
        // 로그인 버튼 비활성화
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '로그인 중...';
        }
        
        // API 로그인 시도
        await dataStore.api.login(username, password);
        
        // 로그인 성공 시 데이터 로드 및 모달 숨기기
        await dataStore.loadAllData();
        hideLoginModal();
        
        // 통계 업데이트
        updateStatistics();
        renderDashboard();
        
        showAlert('로그인되었습니다.', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('로그인에 실패했습니다. 사용자명과 비밀번호를 확인하세요.');
    } finally {
        // 로그인 버튼 활성화
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '로그인';
        }
    }
}

// LDAP 상태 표시 함수
async function showLdapStatus() {
    const infoDiv = document.getElementById('loginInfo');
    
    try {
        // 토큰 없이 시도할 수 있는 공개 정보만 표시
        infoDiv.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> 인증 시스템 정보</h4>
            <ul>
                <li><strong>로컬 인증:</strong> 시스템 관리자 계정 (admin/admin123)</li>
                <li><strong>LDAP 인증:</strong> 도메인 자격 증명으로 로그인 가능</li>
                <li><strong>지원 형식:</strong> 사용자명, UID, 이메일</li>
            </ul>
            <p><small>LDAP가 설정된 경우 도메인 계정으로 자동 인증됩니다.</small></p>
        `;
        infoDiv.style.display = 'block';
        
        // 5초 후 자동 숨김
        setTimeout(() => {
            infoDiv.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error showing LDAP status:', error);
        infoDiv.innerHTML = '<p>인증 정보를 가져올 수 없습니다.</p>';
        infoDiv.style.display = 'block';
    }
}
