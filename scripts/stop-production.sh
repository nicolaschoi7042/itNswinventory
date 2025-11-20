#!/bin/bash

# IT 자산 인벤토리 시스템 - 프로덕션 환경 중지 스크립트
# 사용법: ./scripts/stop-production.sh [--remove-volumes]

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 스크립트 디렉토리 및 프로젝트 루트
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 함수 정의
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  IT 자산 인벤토리 - 프로덕션 환경 중지${NC}"
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

# 1. 실행 중인 프로덕션 컨테이너 확인
print_info "실행 중인 프로덕션 컨테이너 확인 중..."
if ! docker ps --format '{{.Names}}' | grep -q "it-.*-prod"; then
    print_warning "실행 중인 프로덕션 컨테이너가 없습니다."

    # 중지된 컨테이너 확인
    if docker ps -a --format '{{.Names}}' | grep -q "it-.*-prod"; then
        print_info "중지된 프로덕션 컨테이너가 발견되었습니다."
        docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "it-.*-prod" || true
    else
        print_info "프로덕션 컨테이너가 없습니다."
        exit 0
    fi
else
    print_info "실행 중인 프로덕션 컨테이너:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|it-.*-prod)" || true
fi
echo ""

# 2. 중지 확인
read -p "프로덕션 환경을 중지하시겠습니까? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "중지가 취소되었습니다."
    exit 0
fi

# 3. 백업 권장 메시지
print_warning "중요: 프로덕션 환경을 중지하기 전에 백업을 권장합니다!"
echo ""
read -p "지금 데이터베이스를 백업하시겠습니까? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "데이터베이스 백업 시작..."
    if [ -f "./scripts/backup-db.sh" ]; then
        ./scripts/backup-db.sh
        print_success "백업 완료"
    else
        print_error "백업 스크립트를 찾을 수 없습니다: ./scripts/backup-db.sh"
    fi
    echo ""
fi

# 4. 프로덕션 컨테이너 중지
print_info "프로덕션 컨테이너 중지 중..."
if docker compose -f docker-compose.production.yml stop; then
    print_success "컨테이너 중지 완료"
else
    print_error "컨테이너 중지 실패"
    exit 1
fi

# 5. 컨테이너 제거
echo ""
print_info "컨테이너 제거 중..."
if docker compose -f docker-compose.production.yml down; then
    print_success "컨테이너 제거 완료"
else
    print_error "컨테이너 제거 실패"
    exit 1
fi

# 6. 볼륨 제거 옵션
if [ "$1" = "--remove-volumes" ]; then
    echo ""
    print_warning "⚠️  경고: 볼륨을 제거하면 모든 데이터가 영구적으로 삭제됩니다!"
    print_warning "이 작업은 되돌릴 수 없습니다!"
    echo ""
    read -p "정말로 모든 데이터를 삭제하시겠습니까? (DELETE 입력): " -r
    echo ""
    if [ "$REPLY" = "DELETE" ]; then
        print_info "볼륨 제거 중..."
        if docker compose -f docker-compose.production.yml down -v; then
            print_success "볼륨 제거 완료"
        else
            print_error "볼륨 제거 실패"
        fi
    else
        print_info "볼륨 제거가 취소되었습니다."
    fi
fi

# 7. Docker 정리 옵션
echo ""
read -p "사용하지 않는 Docker 리소스를 정리하시겠습니까? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Docker 리소스 정리 중..."
    docker system prune -f
    print_success "Docker 정리 완료"
fi

# 8. 완료 메시지
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  프로덕션 환경 중지 완료!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
print_info "📋 중지된 서비스:"
echo "  - 웹 프론트엔드 (it-frontend-prod)"
echo "  - API 백엔드 (it-backend-prod)"
echo "  - PostgreSQL 데이터베이스 (it-postgres-prod)"
echo "  - 백업 스케줄러 (it-backup-scheduler-prod)"
echo ""
print_info "🔧 다음 단계:"
echo "  - 서비스 재시작: ./scripts/start-production.sh"
echo "  - 백업 확인: ls -lh backups/"
echo "  - 로그 확인: docker compose -f docker-compose.production.yml logs"
echo ""

# 9. 볼륨 상태 확인
print_info "💾 남아있는 데이터 볼륨:"
docker volume ls | grep -E "(inventory|postgres|backup)" || echo "  (데이터 볼륨 없음)"
echo ""

print_success "프로덕션 환경이 성공적으로 중지되었습니다!"
echo ""
