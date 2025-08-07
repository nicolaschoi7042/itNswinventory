// 데이터 저장소 (로컬 스토리지 기반)
class DataStore {
    constructor() {
        this.employees = this.loadData('employees') || [];
        this.hardware = this.loadData('hardware') || [];
        this.software = this.loadData('software') || [];
        this.assignments = this.loadData('assignments') || [];
        this.activities = this.loadData('activities') || [];
        
        // 최초 실행 시에만 샘플 데이터 생성 (initialized 플래그 확인)
        const isInitialized = localStorage.getItem('inventory_initialized');
        if (!isInitialized) {
            this.createSampleData();
            localStorage.setItem('inventory_initialized', 'true');
        }
    }
    
    loadData(key) {
        const data = localStorage.getItem(`inventory_${key}`);
        return data ? JSON.parse(data) : null;
    }
    
    saveData(key, data) {
        localStorage.setItem(`inventory_${key}`, JSON.stringify(data));
    }
    
    createSampleData() {
        // 샘플 임직원 데이터
        this.employees = [
            {
                id: 'EMP001',
                name: '김철수',
                department: '개발팀',
                position: '과장',
                hireDate: '2020-03-15',
                email: 'kim@company.com',
                phone: '010-1234-5678'
            },
            {
                id: 'EMP002',
                name: '이영희',
                department: '마케팅팀',
                position: '대리',
                hireDate: '2021-07-01',
                email: 'lee@company.com',
                phone: '010-9876-5432'
            }
        ];
        
        // 샘플 하드웨어 데이터
        this.hardware = [
            {
                id: 'HW001',
                type: '노트북',
                manufacturer: 'Dell',
                model: 'Latitude 5520',
                serial: 'DL202301001',
                purchaseDate: '2023-01-15',
                price: 1200000,
                status: '사용중',
                assignedTo: 'EMP001',
                notes: ''
            },
            {
                id: 'HW002',
                type: '모니터',
                manufacturer: 'LG',
                model: '27UP850',
                serial: 'LG202301002',
                purchaseDate: '2023-02-01',
                price: 450000,
                status: '대기중',
                assignedTo: '',
                notes: ''
            }
        ];
        
        // 샘플 소프트웨어 데이터
        this.software = [
            {
                id: 'SW001',
                name: 'Microsoft Office 365',
                manufacturer: 'Microsoft',
                version: '2023',
                type: '오피스',
                licenseType: '다중사용자',
                totalLicenses: 10,
                usedLicenses: 5,
                purchaseDate: '2023-01-01',
                expiryDate: '2024-01-01',
                price: 1500000
            },
            {
                id: 'SW002',
                name: 'Windows 11 Pro',
                manufacturer: 'Microsoft',
                version: '23H2',
                type: '운영체제',
                licenseType: '단일사용자',
                totalLicenses: 20,
                usedLicenses: 15,
                purchaseDate: '2023-03-01',
                expiryDate: '',
                price: 2000000
            }
        ];
        
        // 샘플 할당 데이터
        this.assignments = [
            {
                id: 'AS001',
                employeeId: 'EMP001',
                hardwareId: 'HW001',
                assignDate: '2023-01-20',
                returnDate: '',
                status: '할당중',
                notes: '개발용 노트북 할당'
            }
        ];
        
        this.saveAllData();
        this.addActivity('시스템', '샘플 데이터가 생성되었습니다.');
    }
    
    saveAllData() {
        this.saveData('employees', this.employees);
        this.saveData('hardware', this.hardware);
        this.saveData('software', this.software);
        this.saveData('assignments', this.assignments);
        this.saveData('activities', this.activities);
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
        this.saveData('activities', this.activities);
    }
    
    // 모든 데이터 초기화 (개발/테스트 용도)
    clearAllData() {
        this.employees = [];
        this.hardware = [];
        this.software = [];
        this.assignments = [];
        this.activities = [];
        
        // 로컬 스토리지에서 모든 인벤토리 데이터 제거
        const keys = ['employees', 'hardware', 'software', 'assignments', 'activities'];
        keys.forEach(key => {
            localStorage.removeItem(`inventory_${key}`);
        });
        localStorage.removeItem('inventory_initialized');
        
        this.addActivity('시스템', '모든 데이터가 초기화되었습니다.');
        this.saveAllData();
    }
    
    // CRUD 메서드들
    addEmployee(employee) {
        // 사번 자동 생성 (기존 최대 사번 + 1)
        const existingIds = this.employees.map(emp => {
            const match = emp.id.match(/^EMP(\d+)$/);
            return match ? parseInt(match[1]) : 0;
        });
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        employee.id = 'EMP' + String(maxId + 1).padStart(3, '0');
        
        this.employees.push(employee);
        this.saveData('employees', this.employees);
        this.addActivity('관리자', `직원 ${employee.name} 등록`);
        return employee;
    }
    
    updateEmployee(id, employee) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...employee };
            this.saveData('employees', this.employees);
            this.addActivity('관리자', `직원 ${employee.name} 정보 수정`);
            return this.employees[index];
        }
        return null;
    }
    
    deleteEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.employees = this.employees.filter(emp => emp.id !== id);
            this.saveData('employees', this.employees);
            this.addActivity('관리자', `직원 ${employee.name} 삭제`);
            return true;
        }
        return false;
    }
    
    addHardware(hardware) {
        hardware.id = 'HW' + String(this.hardware.length + 1).padStart(3, '0');
        hardware.assignedTo = '';
        this.hardware.push(hardware);
        this.saveData('hardware', this.hardware);
        this.addActivity('관리자', `하드웨어 자산 ${hardware.id} 등록`);
        return hardware;
    }
    
    updateHardware(id, hardware) {
        const index = this.hardware.findIndex(hw => hw.id === id);
        if (index !== -1) {
            this.hardware[index] = { ...this.hardware[index], ...hardware };
            this.saveData('hardware', this.hardware);
            this.addActivity('관리자', `하드웨어 자산 ${id} 정보 수정`);
            return this.hardware[index];
        }
        return null;
    }
    
    deleteHardware(id) {
        const hardware = this.hardware.find(hw => hw.id === id);
        if (hardware) {
            this.hardware = this.hardware.filter(hw => hw.id !== id);
            this.saveData('hardware', this.hardware);
            this.addActivity('관리자', `하드웨어 자산 ${id} 삭제`);
            return true;
        }
        return false;
    }
    
    addSoftware(software) {
        software.id = 'SW' + String(this.software.length + 1).padStart(3, '0');
        software.usedLicenses = 0;
        this.software.push(software);
        this.saveData('software', this.software);
        this.addActivity('관리자', `소프트웨어 ${software.name} 등록`);
        return software;
    }
    
    updateSoftware(id, software) {
        const index = this.software.findIndex(sw => sw.id === id);
        if (index !== -1) {
            this.software[index] = { ...this.software[index], ...software };
            this.saveData('software', this.software);
            this.addActivity('관리자', `소프트웨어 ${id} 정보 수정`);
            return this.software[index];
        }
        return null;
    }
    
    deleteSoftware(id) {
        const software = this.software.find(sw => sw.id === id);
        if (software) {
            this.software = this.software.filter(sw => sw.id !== id);
            this.saveData('software', this.software);
            this.addActivity('관리자', `소프트웨어 ${software.name} 삭제`);
            return true;
        }
        return false;
    }
    
    assignHardware(employeeId, hardwareId, assignDate, notes) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        const hardware = this.hardware.find(hw => hw.id === hardwareId);
        
        if (employee && hardware && hardware.status === '대기중') {
            const assignment = {
                id: 'AS' + String(this.assignments.length + 1).padStart(3, '0'),
                employeeId: employeeId,
                hardwareId: hardwareId,
                assignDate: assignDate,
                returnDate: '',
                status: '할당중',
                notes: notes
            };
            
            this.assignments.push(assignment);
            hardware.status = '사용중';
            hardware.assignedTo = employeeId;
            
            this.saveData('assignments', this.assignments);
            this.saveData('hardware', this.hardware);
            this.addActivity('관리자', `${hardware.id} → ${employee.name} 할당`);
            return assignment;
        }
        return null;
    }
    
    returnHardware(assignmentId) {
        const assignment = this.assignments.find(as => as.id === assignmentId && as.status === '할당중');
        if (assignment) {
            const hardware = this.hardware.find(hw => hw.id === assignment.hardwareId);
            const employee = this.employees.find(emp => emp.id === assignment.employeeId);
            
            if (hardware && employee) {
                assignment.returnDate = new Date().toISOString().split('T')[0];
                assignment.status = '반납완료';
                hardware.status = '대기중';
                hardware.assignedTo = '';
                
                this.saveData('assignments', this.assignments);
                this.saveData('hardware', this.hardware);
                this.addActivity('관리자', `${hardware.id} ← ${employee.name} 반납`);
                return true;
            }
        }
        return false;
    }
}

// 글로벌 데이터 스토어
const dataStore = new DataStore();

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    showTab('dashboard');
    updateStatistics();
    renderDashboard();
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
}

function renderLicenseStatus() {
    const office = dataStore.software.find(sw => sw.name.includes('Office'));
    const windows = dataStore.software.find(sw => sw.name.includes('Windows'));
    const adobe = dataStore.software.find(sw => sw.name.includes('Adobe'));
    
    document.getElementById('officeCount').textContent = office ? office.usedLicenses : 0;
    document.getElementById('windowsCount').textContent = windows ? windows.usedLicenses : 0;
    document.getElementById('adobeCount').textContent = adobe ? adobe.usedLicenses : 0;
}

function renderRecentActivities() {
    const container = document.getElementById('recentActivities');
    const activities = dataStore.activities.slice(0, 10);
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="empty-state">최근 활동이 없습니다.</div>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div>${activity.action}</div>
            <div class="activity-time">${formatDateTime(activity.timestamp)} by ${activity.user}</div>
        </div>
    `).join('');
}

function renderAssetChart() {
    const canvas = document.getElementById('assetChart');
    const ctx = canvas.getContext('2d');
    
    // 간단한 도넛 차트
    const data = {
        '사용중': dataStore.hardware.filter(hw => hw.status === '사용중').length,
        '대기중': dataStore.hardware.filter(hw => hw.status === '대기중').length,
        '수리중': dataStore.hardware.filter(hw => hw.status === '수리중').length,
        '폐기': dataStore.hardware.filter(hw => hw.status === '폐기').length
    };
    
    const colors = ['#28a745', '#ffc107', '#dc3545', '#6c757d'];
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return;
    
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
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">등록된 임직원이 없습니다.</td></tr>';
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
                <td>${formatDate(emp.hireDate)}</td>
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
    
    tbody.innerHTML = software.map(sw => `
        <tr>
            <td>${sw.name}</td>
            <td>${sw.manufacturer}</td>
            <td>${sw.version}</td>
            <td>${sw.type}</td>
            <td>${sw.licenseType}</td>
            <td>${sw.totalLicenses}</td>
            <td>${sw.usedLicenses}</td>
            <td>${sw.totalLicenses - sw.usedLicenses}</td>
            <td>
                <button class="btn btn-sm" onclick="editSoftware('${sw.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteSoftwareConfirm('${sw.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderAssignments() {
    const tbody = document.querySelector('#assignmentTable tbody');
    const assignments = dataStore.assignments.filter(as => as.status === '할당중');
    
    if (assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">현재 할당된 자산이 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = assignments.map(assignment => {
        const employee = dataStore.employees.find(emp => emp.id === assignment.employeeId);
        const hardware = dataStore.hardware.find(hw => hw.id === assignment.hardwareId);
        
        return `
            <tr>
                <td>${formatDate(assignment.assignDate)}</td>
                <td>${employee ? employee.name : '알 수 없음'}</td>
                <td>${employee ? employee.department : '-'}</td>
                <td>${hardware ? hardware.type : '알 수 없음'}</td>
                <td>${hardware ? hardware.id : '알 수 없음'}</td>
                <td>${hardware ? hardware.model : '-'}</td>
                <td><span class="status-badge status-assigned">할당중</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="returnHardware('${assignment.id}')">
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
            document.getElementById('empPosition').value = employee.position;
            document.getElementById('empHireDate').value = employee.hireDate;
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
    
    if (softwareId) {
        const software = dataStore.software.find(sw => sw.id === softwareId);
        if (software) {
            document.getElementById('swName').value = software.name;
            document.getElementById('swManufacturer').value = software.manufacturer;
            document.getElementById('swVersion').value = software.version;
            document.getElementById('swType').value = software.type;
            document.getElementById('swLicenseType').value = software.licenseType;
            document.getElementById('swTotalLicenses').value = software.totalLicenses;
            document.getElementById('swPurchaseDate').value = software.purchaseDate;
            document.getElementById('swExpiryDate').value = software.expiryDate;
            document.getElementById('swPrice').value = software.price;
        }
    } else {
        form.reset();
    }
    
    modal.style.display = 'block';
}

function showAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignDate').value = new Date().toISOString().split('T')[0];
    updateAssignmentDropdowns();
    modal.style.display = 'block';
}

function updateAssignmentDropdowns() {
    const employeeSelect = document.getElementById('assignEmployee');
    const hardwareSelect = document.getElementById('assignHardware');
    
    if (employeeSelect) {
        employeeSelect.innerHTML = '<option value="">선택하세요</option>' +
            dataStore.employees.map(emp => 
                `<option value="${emp.id}">${emp.name} (${emp.department})</option>`
            ).join('');
    }
    
    if (hardwareSelect) {
        const availableHardware = dataStore.hardware.filter(hw => hw.status === '대기중');
        hardwareSelect.innerHTML = '<option value="">선택하세요</option>' +
            availableHardware.map(hw => 
                `<option value="${hw.id}">${hw.id} - ${hw.type} ${hw.model}</option>`
            ).join('');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 폼 제출 핸들러들
function handleEmployeeSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('employeeForm');
    const employeeId = form.getAttribute('data-employee-id');
    
    const formData = {
        name: document.getElementById('empName').value,
        department: document.getElementById('empDepartment').value,
        position: document.getElementById('empPosition').value,
        hireDate: document.getElementById('empHireDate').value,
        email: document.getElementById('empEmail').value || '',
        phone: document.getElementById('empPhone').value || ''
    };
    
    // 편집 모드인지 신규 등록인지 확인
    if (employeeId) {
        // 편집 모드: 기존 직원 정보 수정
        dataStore.updateEmployee(employeeId, formData);
        showAlert('임직원 정보가 수정되었습니다.', 'success');
    } else {
        // 신규 등록 모드: 새 직원 추가 (사번 자동 생성)
        const newEmployee = dataStore.addEmployee(formData);
        showAlert(`임직원이 등록되었습니다. (사번: ${newEmployee.id})`, 'success');
    }
    
    closeModal('employeeModal');
    renderEmployees();
    updateStatistics();
}

function handleHardwareSubmit(event) {
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
    
    const existingHardware = dataStore.hardware.find(hw => hw.id === formData.id);
    
    if (existingHardware) {
        dataStore.updateHardware(formData.id, formData);
    } else {
        dataStore.addHardware(formData);
    }
    
    closeModal('hardwareModal');
    renderHardware();
    updateStatistics();
    showAlert('하드웨어 자산 정보가 저장되었습니다.', 'success');
}

function handleSoftwareSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('swName').value,
        manufacturer: document.getElementById('swManufacturer').value,
        version: document.getElementById('swVersion').value,
        type: document.getElementById('swType').value,
        licenseType: document.getElementById('swLicenseType').value,
        totalLicenses: parseInt(document.getElementById('swTotalLicenses').value) || 1,
        purchaseDate: document.getElementById('swPurchaseDate').value,
        expiryDate: document.getElementById('swExpiryDate').value,
        price: parseInt(document.getElementById('swPrice').value) || 0
    };
    
    // 기존 소프트웨어 찾기 (이름으로)
    const existingSoftware = dataStore.software.find(sw => sw.name === formData.name);
    
    if (existingSoftware) {
        dataStore.updateSoftware(existingSoftware.id, formData);
    } else {
        dataStore.addSoftware(formData);
    }
    
    closeModal('softwareModal');
    renderSoftware();
    updateStatistics();
    showAlert('소프트웨어 정보가 저장되었습니다.', 'success');
}

function handleAssignmentSubmit(event) {
    event.preventDefault();
    
    const employeeId = document.getElementById('assignEmployee').value;
    const hardwareId = document.getElementById('assignHardware').value;
    const assignDate = document.getElementById('assignDate').value;
    const notes = document.getElementById('assignNotes').value;
    
    const result = dataStore.assignHardware(employeeId, hardwareId, assignDate, notes);
    
    if (result) {
        closeModal('assignmentModal');
        renderAssignments();
        renderHardware();
        renderDashboard();
        showAlert('자산이 성공적으로 할당되었습니다.', 'success');
    } else {
        showAlert('자산 할당에 실패했습니다. 선택한 자산이 이미 할당되어 있을 수 있습니다.', 'error');
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

function deleteHardwareConfirm(hardwareId) {
    if (confirm('정말로 이 하드웨어 자산을 삭제하시겠습니까?')) {
        if (dataStore.deleteHardware(hardwareId)) {
            renderHardware();
            updateStatistics();
            showAlert('하드웨어 자산이 삭제되었습니다.', 'success');
        }
    }
}

function deleteSoftwareConfirm(softwareId) {
    if (confirm('정말로 이 소프트웨어를 삭제하시겠습니까?')) {
        if (dataStore.deleteSoftware(softwareId)) {
            renderSoftware();
            updateStatistics();
            showAlert('소프트웨어가 삭제되었습니다.', 'success');
        }
    }
}

function returnHardware(assignmentId) {
    if (confirm('이 자산을 반납 처리하시겠습니까?')) {
        if (dataStore.returnHardware(assignmentId)) {
            renderAssignments();
            renderHardware();
            renderDashboard();
            showAlert('자산이 성공적으로 반납되었습니다.', 'success');
        } else {
            showAlert('자산 반납에 실패했습니다. 할당 정보를 확인해주세요.', 'error');
        }
    }
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
        const employee = dataStore.employees.find(emp => emp.id === assignment.employeeId);
        const hardware = dataStore.hardware.find(hw => hw.id === assignment.hardwareId);
        
        const matchesSearch = (employee && employee.name.toLowerCase().includes(searchTerm)) ||
                            (hardware && hardware.id.toLowerCase().includes(searchTerm));
        
        return matchesSearch && assignment.status === '할당중';
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
                <td>${formatDate(emp.hireDate)}</td>
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
    
    tbody.innerHTML = software.map(sw => `
        <tr>
            <td>${sw.name}</td>
            <td>${sw.manufacturer}</td>
            <td>${sw.version}</td>
            <td>${sw.type}</td>
            <td>${sw.licenseType}</td>
            <td>${sw.totalLicenses}</td>
            <td>${sw.usedLicenses}</td>
            <td>${sw.totalLicenses - sw.usedLicenses}</td>
            <td>
                <button class="btn btn-sm" onclick="editSoftware('${sw.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteSoftwareConfirm('${sw.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderFilteredAssignments(assignments) {
    const tbody = document.querySelector('#assignmentTable tbody');
    
    if (assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = assignments.map(assignment => {
        const employee = dataStore.employees.find(emp => emp.id === assignment.employeeId);
        const hardware = dataStore.hardware.find(hw => hw.id === assignment.hardwareId);
        
        return `
            <tr>
                <td>${formatDate(assignment.assignDate)}</td>
                <td>${employee ? employee.name : '알 수 없음'}</td>
                <td>${employee ? employee.department : '-'}</td>
                <td>${hardware ? hardware.type : '알 수 없음'}</td>
                <td>${hardware ? hardware.id : '알 수 없음'}</td>
                <td>${hardware ? hardware.model : '-'}</td>
                <td><span class="status-badge status-assigned">할당중</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="returnHardware('${assignment.id}')">
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
            '직급': emp.position,
            '입사일': emp.hireDate,
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
        const remainingLicenses = sw.totalLicenses - sw.usedLicenses;
        const usageRate = sw.totalLicenses > 0 ? 
            Math.round((sw.usedLicenses / sw.totalLicenses) * 100) : 0;
        
        return {
            '소프트웨어명': sw.name,
            '제조사': sw.manufacturer || '',
            '버전': sw.version || '',
            '유형': sw.type,
            '라이선스 유형': sw.licenseType,
            '총 라이선스': sw.totalLicenses,
            '사용중 라이선스': sw.usedLicenses,
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
            '직급': employee ? employee.position : '',
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

