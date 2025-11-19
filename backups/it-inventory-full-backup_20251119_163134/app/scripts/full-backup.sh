#!/bin/bash

# IT 자산 인벤토리 시스템 - 전체 시스템 백업 스크립트
# 사용법: ./scripts/full-backup.sh [백업디렉토리]

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
CONTAINER_NAME="it-inventory-postgres"
DB_USER="inventory_user"
DB_NAME="inventory_db"
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="it-inventory-full-backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 함수 정의
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  IT 자산 인벤토리 - 전체 시스템 백업${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 메인 실행
print_header

print_info "프로젝트 디렉토리: ${PROJECT_DIR}"
print_info "백업 생성 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. 백업 디렉토리 생성
print_info "백업 디렉토리 생성 중..."
mkdir -p "${BACKUP_PATH}"
print_success "백업 디렉토리 생성: ${BACKUP_PATH}"

# 2. 데이터베이스 백업
echo ""
print_info "==== 1/4: 데이터베이스 백업 ===="
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    DB_BACKUP_FILE="${BACKUP_PATH}/database_backup.sql"
    print_info "데이터베이스 덤프 생성 중..."

    if docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${DB_BACKUP_FILE}"; then
        print_success "데이터베이스 백업 완료"

        # 통계 정보 저장
        docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "
        SELECT
            '  - ' || table_name || ': ' || count || ' 레코드'
        FROM (
            SELECT 'users' as table_name, COUNT(*)::text as count FROM users
            UNION ALL
            SELECT 'employees', COUNT(*)::text FROM employees
            UNION ALL
            SELECT 'hardware', COUNT(*)::text FROM hardware
            UNION ALL
            SELECT 'software', COUNT(*)::text FROM software
            UNION ALL
            SELECT 'assignments', COUNT(*)::text FROM assignments
            UNION ALL
            SELECT 'activities', COUNT(*)::text FROM activities
        ) t;
        " > "${BACKUP_PATH}/database_stats.txt"

        FILE_SIZE=$(stat -f%z "${DB_BACKUP_FILE}" 2>/dev/null || stat -c%s "${DB_BACKUP_FILE}" 2>/dev/null)
        print_info "데이터베이스 덤프 크기: ${FILE_SIZE} bytes"
    else
        print_error "데이터베이스 백업 실패"
        exit 1
    fi
else
    print_warning "데이터베이스 컨테이너가 실행되지 않음 - 데이터베이스 백업 건너뜀"
fi

# 3. 환경 설정 파일 백업
echo ""
print_info "==== 2/4: 환경 설정 파일 백업 ===="
mkdir -p "${BACKUP_PATH}/config"

# .env 파일 백업
if [ -f "${PROJECT_DIR}/backend/.env" ]; then
    cp "${PROJECT_DIR}/backend/.env" "${BACKUP_PATH}/config/.env"
    print_success "환경 변수 파일 백업: backend/.env"
else
    print_warning "환경 변수 파일 없음: backend/.env"
fi

# docker-compose.yml 백업
if [ -f "${PROJECT_DIR}/docker-compose.yml" ]; then
    cp "${PROJECT_DIR}/docker-compose.yml" "${BACKUP_PATH}/config/docker-compose.yml"
    print_success "Docker Compose 설정 백업: docker-compose.yml"
fi

# nginx 설정 백업
if [ -f "${PROJECT_DIR}/nginx.conf" ]; then
    cp "${PROJECT_DIR}/nginx.conf" "${BACKUP_PATH}/config/nginx.conf"
    print_success "Nginx 설정 백업: nginx.conf"
fi

# 4. 중요 파일 백업
echo ""
print_info "==== 3/4: 애플리케이션 파일 백업 ===="
mkdir -p "${BACKUP_PATH}/app"

# 프론트엔드 파일
FRONTEND_FILES=(
    "index.html"
    "script.js"
    "styles-ny-business.css"
    "favicon.ico"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "${PROJECT_DIR}/${file}" ]; then
        cp "${PROJECT_DIR}/${file}" "${BACKUP_PATH}/app/"
        print_success "백업: ${file}"
    fi
done

# 백엔드 파일
mkdir -p "${BACKUP_PATH}/app/backend"
if [ -f "${PROJECT_DIR}/backend/server.js" ]; then
    cp "${PROJECT_DIR}/backend/server.js" "${BACKUP_PATH}/app/backend/"
    print_success "백업: backend/server.js"
fi

if [ -f "${PROJECT_DIR}/backend/package.json" ]; then
    cp "${PROJECT_DIR}/backend/package.json" "${BACKUP_PATH}/app/backend/"
    print_success "백업: backend/package.json"
fi

if [ -f "${PROJECT_DIR}/backend/database.sql" ]; then
    cp "${PROJECT_DIR}/backend/database.sql" "${BACKUP_PATH}/app/backend/"
    print_success "백업: backend/database.sql"
fi

# Dockerfile 백업
for dockerfile in Dockerfile Dockerfile.backend; do
    if [ -f "${PROJECT_DIR}/${dockerfile}" ]; then
        cp "${PROJECT_DIR}/${dockerfile}" "${BACKUP_PATH}/app/"
        print_success "백업: ${dockerfile}"
    fi
done

# 스크립트 백업
if [ -d "${PROJECT_DIR}/scripts" ]; then
    cp -r "${PROJECT_DIR}/scripts" "${BACKUP_PATH}/app/"
    print_success "백업: scripts/ 디렉토리"
fi

# 문서 파일 백업
DOCS=(
    "README.md"
    "CLAUDE.md"
    "DATA_RECOVERY_GUIDE.md"
    "LDAP_SETUP.md"
    "UPGRADE_GUIDE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "${PROJECT_DIR}/${doc}" ]; then
        cp "${PROJECT_DIR}/${doc}" "${BACKUP_PATH}/app/"
    fi
done

# 5. 백업 정보 파일 생성
echo ""
print_info "==== 4/4: 백업 정보 파일 생성 ===="

cat > "${BACKUP_PATH}/BACKUP_INFO.txt" << EOF
IT 자산 인벤토리 시스템 - 백업 정보
=====================================

백업 생성 시간: $(date '+%Y-%m-%d %H:%M:%S')
백업 이름: ${BACKUP_NAME}
호스트: $(hostname)
운영 체제: $(uname -s)

프로젝트 정보:
- 프로젝트 디렉토리: ${PROJECT_DIR}
- Git 브랜치: $(cd "${PROJECT_DIR}" && git branch --show-current 2>/dev/null || echo "N/A")
- Git 커밋: $(cd "${PROJECT_DIR}" && git rev-parse --short HEAD 2>/dev/null || echo "N/A")

백업 내용:
- 데이터베이스 덤프: database_backup.sql
- 환경 설정: config/
- 애플리케이션 파일: app/

복원 방법:
1. 새 서버에 Docker 및 Docker Compose 설치
2. 백업 파일을 새 서버로 전송
3. app/ 디렉토리의 내용을 프로젝트 디렉토리로 복사
4. config/.env 파일을 backend/.env로 복사 (필요시 IP 주소 등 수정)
5. 데이터베이스 복원:
   ./scripts/restore-db.sh /path/to/database_backup.sql
6. 서비스 시작:
   ./start.sh

데이터베이스 통계:
EOF

if [ -f "${BACKUP_PATH}/database_stats.txt" ]; then
    cat "${BACKUP_PATH}/database_stats.txt" >> "${BACKUP_PATH}/BACKUP_INFO.txt"
fi

cat >> "${BACKUP_PATH}/BACKUP_INFO.txt" << EOF

주의사항:
- 환경 변수 파일(.env)에는 민감한 정보가 포함되어 있습니다
- 백업 파일을 안전하게 보관하세요
- LDAP 서버 주소 등 네트워크 설정은 새 환경에 맞게 조정하세요
EOF

print_success "백업 정보 파일 생성: BACKUP_INFO.txt"

# 6. 백업 압축
echo ""
read -p "백업을 압축하시겠습니까? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "백업 압축 중... (시간이 걸릴 수 있습니다)"

    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}/"

    if [ $? -eq 0 ]; then
        ARCHIVE_SIZE=$(stat -f%z "${BACKUP_NAME}.tar.gz" 2>/dev/null || stat -c%s "${BACKUP_NAME}.tar.gz" 2>/dev/null)
        ARCHIVE_SIZE_MB=$(echo "scale=2; ${ARCHIVE_SIZE}/1024/1024" | bc 2>/dev/null || echo "N/A")

        print_success "백업 압축 완료: ${BACKUP_NAME}.tar.gz"
        print_info "압축 파일 크기: ${ARCHIVE_SIZE} bytes (${ARCHIVE_SIZE_MB} MB)"

        read -p "압축되지 않은 백업 디렉토리를 삭제하시겠습니까? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "${BACKUP_NAME}"
            print_success "압축되지 않은 디렉토리 삭제 완료"
        fi
    else
        print_error "백업 압축 실패"
    fi
fi

# 7. 완료 메시지
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  백업이 성공적으로 완료되었습니다!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
print_info "백업 위치:"
echo "  ${BACKUP_DIR}/${BACKUP_NAME}/"
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ]; then
    echo "  또는"
    echo "  ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz (압축)"
fi
echo ""
print_info "다음 단계:"
echo "  1. 백업 파일을 안전한 위치에 보관하세요"
echo "  2. 새 서버로 백업 파일을 전송하세요:"
if [ -f "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" ]; then
    echo "     scp ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz user@newserver:/path/to/"
else
    echo "     scp -r ${BACKUP_DIR}/${BACKUP_NAME} user@newserver:/path/to/"
fi
echo "  3. BACKUP_INFO.txt 파일을 참조하여 복원하세요"
echo ""
