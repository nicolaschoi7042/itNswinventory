#!/bin/bash

# IT 자산 인벤토리 시스템 - 데이터베이스 백업 스크립트
# 사용법: ./scripts/backup-db.sh [백업디렉토리]

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
# 환경 변수로 컨테이너 이름 지정 가능 (기본값: 프로덕션)
# 개발 환경: CONTAINER_NAME=it-inventory-postgres ./scripts/backup-db.sh
# 프로덕션: ./scripts/backup-db.sh
CONTAINER_NAME="${CONTAINER_NAME:-it-postgres-prod}"
DB_USER="inventory_user"
DB_NAME="inventory_db"
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="inventory_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# 함수 정의
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  IT 자산 인벤토리 - 데이터베이스 백업${NC}"
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

# 1. 데이터베이스 확인
# 백업 스케줄러 컨테이너(it-backup-scheduler-prod)에는 docker 가 없어 docker exec 가 늘 실패했다.
# 그때는 같은 네트워크의 DB 컨테이너 이름으로 직접 붙는다.
if command -v docker >/dev/null 2>&1; then
    db_run() { docker exec "${CONTAINER_NAME}" "$@"; }
    print_info "Docker 컨테이너 상태 확인 중..."
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "데이터베이스 컨테이너가 실행 중이지 않습니다: ${CONTAINER_NAME}"
        print_info "다음 명령어로 컨테이너를 시작하세요: docker compose up -d it-inventory-db"
        exit 1
    fi
else
    export PGPASSWORD="${DB_PASSWORD:?DB_PASSWORD 환경 변수가 없습니다}"
    db_run() { "$1" -h "${CONTAINER_NAME}" "${@:2}"; }
    print_info "데이터베이스 접속 확인 중: ${CONTAINER_NAME}"
    if ! pg_isready -h "${CONTAINER_NAME}" -U "${DB_USER}" -d "${DB_NAME}" >/dev/null; then
        print_error "데이터베이스에 접속할 수 없습니다: ${CONTAINER_NAME}"
        exit 1
    fi
fi
print_success "데이터베이스 실행 중"

# 2. 백업 디렉토리 생성
print_info "백업 디렉토리 생성: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"
print_success "백업 디렉토리 준비 완료"

# 3. 데이터베이스 백업 실행
print_info "데이터베이스 백업 시작..."
print_info "백업 파일: ${BACKUP_PATH}"

if db_run pg_dump -U "${DB_USER}" -d "${DB_NAME}" > "${BACKUP_PATH}"; then
    print_success "데이터베이스 백업 완료"
else
    print_error "데이터베이스 백업 실패"
    exit 1
fi

# 4. 백업 파일 검증
print_info "백업 파일 검증 중..."

# 파일 크기 확인
FILE_SIZE=$(stat -f%z "${BACKUP_PATH}" 2>/dev/null || stat -c%s "${BACKUP_PATH}" 2>/dev/null)
if [ "${FILE_SIZE}" -lt 1000 ]; then
    print_error "백업 파일이 너무 작습니다 (${FILE_SIZE} bytes). 백업이 제대로 되지 않았을 수 있습니다."
    exit 1
fi

# PostgreSQL 덤프 헤더 확인
if head -5 "${BACKUP_PATH}" | grep -q "PostgreSQL database dump"; then
    print_success "백업 파일 형식 검증 완료"
else
    print_warning "백업 파일 형식을 확인할 수 없습니다"
fi

# 5. 백업 파일 정보 출력
print_info "백업 파일 정보:"
echo "  - 파일명: ${BACKUP_FILE}"
echo "  - 경로: ${BACKUP_PATH}"
if [ -f "${BACKUP_PATH}" ]; then
    FILE_SIZE_MB=$(echo "scale=2; ${FILE_SIZE}/1024/1024" | bc 2>/dev/null || echo "N/A")
    echo "  - 크기: ${FILE_SIZE} bytes (${FILE_SIZE_MB} MB)"
    echo "  - 생성 시간: $(date)"
fi

# 6. 테이블별 레코드 수 출력
print_info "데이터베이스 통계:"
db_run psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "
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
"

# 7. 압축 옵션
# cron 에서는 입력이 없어 read 가 실패하고 set -e 로 스크립트가 실패 종료된다. 터미널에서만 묻는다.
REPLY=""
if [ -t 0 ]; then
    echo ""
    read -p "백업 파일을 압축하시겠습니까? (y/N): " -n 1 -r
    echo ""
fi
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "백업 파일 압축 중..."
    gzip "${BACKUP_PATH}"
    BACKUP_PATH="${BACKUP_PATH}.gz"
    print_success "압축 완료: ${BACKUP_PATH}"

    FILE_SIZE_COMPRESSED=$(stat -f%z "${BACKUP_PATH}" 2>/dev/null || stat -c%s "${BACKUP_PATH}" 2>/dev/null)
    FILE_SIZE_MB=$(echo "scale=2; ${FILE_SIZE_COMPRESSED}/1024/1024" | bc 2>/dev/null || echo "N/A")
    echo "  - 압축 후 크기: ${FILE_SIZE_COMPRESSED} bytes (${FILE_SIZE_MB} MB)"
fi

# 8. 완료 메시지
echo ""
print_success "백업이 성공적으로 완료되었습니다!"
echo ""
print_info "다음 단계:"
echo "  1. 백업 파일을 안전한 위치에 보관하세요"
echo "  2. 새 서버로 백업 파일을 전송하세요:"
echo "     scp ${BACKUP_PATH} user@newserver:/path/to/backup/"
echo "  3. 새 서버에서 복원하세요:"
echo "     ./scripts/restore-db.sh ${BACKUP_FILE}"
echo ""
