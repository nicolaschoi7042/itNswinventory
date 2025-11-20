#!/bin/bash

# IT 자산 인벤토리 시스템 - 데이터베이스 복원 스크립트
# 사용법: ./scripts/restore-db.sh <백업파일경로>

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
# 환경 변수로 컨테이너 이름 지정 가능 (기본값: 프로덕션)
# 개발 환경: CONTAINER_NAME=it-inventory-postgres ./scripts/restore-db.sh <백업파일>
# 프로덕션: ./scripts/restore-db.sh <백업파일>
CONTAINER_NAME="${CONTAINER_NAME:-it-postgres-prod}"
DB_USER="inventory_user"
DB_NAME="inventory_db"
BACKUP_FILE="$1"

# 함수 정의
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  IT 자산 인벤토리 - 데이터베이스 복원${NC}"
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

show_usage() {
    echo "사용법: $0 <백업파일경로>"
    echo ""
    echo "예제:"
    echo "  $0 backups/inventory_backup_20250119_120000.sql"
    echo "  $0 backups/inventory_backup_20250119_120000.sql.gz"
    echo ""
}

# 메인 실행
print_header

# 1. 인자 확인
if [ -z "$BACKUP_FILE" ]; then
    print_error "백업 파일 경로를 지정해주세요"
    echo ""
    show_usage
    exit 1
fi

# 2. 백업 파일 존재 확인
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
    exit 1
fi
print_success "백업 파일 확인: $BACKUP_FILE"

# 3. 압축 파일 처리
TEMP_FILE=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
    print_info "압축된 백업 파일 감지. 압축 해제 중..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
    print_success "압축 해제 완료"
fi

# 4. Docker 컨테이너 확인
print_info "Docker 컨테이너 상태 확인 중..."
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    print_error "데이터베이스 컨테이너가 실행 중이지 않습니다: ${CONTAINER_NAME}"
    print_info "다음 명령어로 컨테이너를 시작하세요:"
    echo "  docker compose up -d it-inventory-db"
    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
    exit 1
fi
print_success "데이터베이스 컨테이너 실행 중"

# 5. 데이터베이스 연결 확인
print_info "데이터베이스 연결 확인 중..."
if ! docker exec "${CONTAINER_NAME}" pg_isready -U "${DB_USER}" > /dev/null 2>&1; then
    print_error "데이터베이스가 준비되지 않았습니다. 잠시 후 다시 시도하세요."
    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
    exit 1
fi
print_success "데이터베이스 연결 정상"

# 6. 현재 데이터베이스 통계 확인
print_info "현재 데이터베이스 통계:"
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
" 2>/dev/null || echo "  (데이터 없음 또는 테이블 미생성)"

# 7. 확인 메시지
echo ""
print_warning "경고: 이 작업은 현재 데이터베이스의 모든 데이터를 백업 데이터로 덮어씁니다!"
echo ""
read -p "계속하시겠습니까? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "복원이 취소되었습니다."
    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
    exit 0
fi

# 8. 데이터베이스 복원 실행
print_info "데이터베이스 복원 시작..."
print_info "백업 파일: $BACKUP_FILE"

if docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "$BACKUP_FILE"; then
    print_success "데이터베이스 복원 완료"
else
    print_error "데이터베이스 복원 실패"
    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
    exit 1
fi

# 9. 임시 파일 정리
if [ -n "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
    print_info "임시 파일 정리 완료"
fi

# 10. 복원 후 데이터베이스 통계 확인
print_info "복원 후 데이터베이스 통계:"
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
"

# 11. 데이터 무결성 검사
print_info "데이터 무결성 검사 중..."
INTEGRITY_CHECK=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "
SELECT COUNT(*) FROM users WHERE username IS NOT NULL;
" 2>/dev/null | tr -d ' ')

if [ "$INTEGRITY_CHECK" -gt 0 ]; then
    print_success "데이터 무결성 검사 통과 (사용자 $INTEGRITY_CHECK 명)"
else
    print_warning "사용자 데이터가 없습니다. 백업 파일을 확인하세요."
fi

# 12. 완료 메시지
echo ""
print_success "데이터베이스 복원이 성공적으로 완료되었습니다!"
echo ""
print_info "다음 단계:"
echo "  1. 전체 서비스를 시작하세요:"
echo "     ./start.sh"
echo "  2. 웹 브라우저에서 접속하여 데이터를 확인하세요:"
echo "     http://localhost:8080"
echo "  3. 관리자 계정으로 로그인하세요:"
echo "     아이디: admin"
echo "     비밀번호: admin123"
echo "  4. 모니터링 스크립트로 시스템 상태를 확인하세요:"
echo "     ./scripts/monitor.sh"
echo ""
