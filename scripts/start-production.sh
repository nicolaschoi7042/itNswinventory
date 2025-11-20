#!/bin/bash

# IT 자산 인벤토리 시스템 - 프로덕션 환경 시작 스크립트
# 사용법: ./scripts/start-production.sh [--with-monitoring]

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
    echo -e "${BLUE}  IT 자산 인벤토리 - 프로덕션 환경 시작${NC}"
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

# 1. Docker 설치 확인
print_info "Docker 설치 확인 중..."
if ! command -v docker &> /dev/null; then
    print_error "Docker가 설치되어 있지 않습니다."
    echo "Docker 설치 후 다시 시도해주세요: https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker 설치 확인 완료"

# 2. Docker Compose 설치 확인
if ! command -v docker compose version &> /dev/null; then
    print_error "Docker Compose V2가 설치되어 있지 않습니다."
    echo "Docker Compose 설치 후 다시 시도해주세요."
    exit 1
fi
print_success "Docker Compose 설치 확인 완료"

# 3. .env 파일 확인
print_info "환경 설정 파일 확인 중..."
if [ ! -f "backend/.env" ]; then
    print_error "backend/.env 파일이 없습니다."
    echo ""
    print_info "다음 단계를 따라주세요:"
    echo "  1. 템플릿 복사: cp .env.production backend/.env"
    echo "  2. backend/.env 파일 편집"
    echo "  3. 모든 'CHANGE_ME_' 값을 실제 값으로 변경"
    echo "  4. 다시 이 스크립트 실행"
    exit 1
fi

# 환경 변수 검증
if grep -q "CHANGE_ME_" backend/.env; then
    print_error "backend/.env 파일에 변경되지 않은 플레이스홀더 값이 있습니다."
    echo ""
    print_info "다음 값들을 반드시 변경해야 합니다:"
    grep "CHANGE_ME_" backend/.env
    echo ""
    read -p "그래도 계속하시겠습니까? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "배포가 취소되었습니다."
        exit 0
    fi
    print_warning "보안 경고를 무시하고 계속합니다..."
fi
print_success "환경 설정 파일 확인 완료"

# 4. .env 파일을 환경 변수로 로드
print_info ".env 파일 로드 중..."
set -a  # 모든 변수를 export
source backend/.env
set +a
print_success ".env 파일 로드 완료"

# 5. 필수 디렉토리 생성
print_info "필수 디렉토리 생성 중..."
mkdir -p logs
mkdir -p backups
mkdir -p backend/backup
print_success "디렉토리 생성 완료"

# 6. 모니터링 프로파일 확인
PROFILE_ARGS=""
if [ "$1" = "--with-monitoring" ]; then
    print_info "모니터링 스택 포함 모드"
    PROFILE_ARGS="--profile monitoring"
fi

# 7. 기존 컨테이너 확인
print_info "기존 프로덕션 컨테이너 확인 중..."
if docker ps -a --format '{{.Names}}' | grep -q "it-.*-prod"; then
    print_warning "기존 프로덕션 컨테이너가 발견되었습니다."
    docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep "it-.*-prod" || true
    echo ""
    read -p "기존 컨테이너를 중지하고 새로 시작하시겠습니까? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "기존 컨테이너 중지 중..."
        docker compose -f docker-compose.production.yml down
        print_success "기존 컨테이너 중지 완료"
    else
        print_info "배포가 취소되었습니다."
        exit 0
    fi
fi

# 8. Docker 이미지 빌드
print_info "Docker 이미지 빌드 중..."
echo ""
if docker compose -f docker-compose.production.yml build $PROFILE_ARGS; then
    print_success "이미지 빌드 완료"
else
    print_error "이미지 빌드 실패"
    exit 1
fi

# 9. 컨테이너 시작
echo ""
print_info "프로덕션 컨테이너 시작 중..."
if docker compose -f docker-compose.production.yml up -d $PROFILE_ARGS; then
    print_success "컨테이너 시작 완료"
else
    print_error "컨테이너 시작 실패"
    exit 1
fi

# 10. 컨테이너 헬스체크 대기
echo ""
print_info "서비스 헬스체크 대기 중 (최대 60초)..."
sleep 5

for i in {1..12}; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep "it-.*-prod" | grep -q "healthy\|Up"; then
        print_success "서비스 헬스체크 통과 ($i/12)"
        break
    fi
    echo -n "."
    sleep 5
    if [ $i -eq 12 ]; then
        print_warning "헬스체크 타임아웃. 수동으로 확인이 필요할 수 있습니다."
    fi
done
echo ""

# 11. 서비스 상태 확인
print_info "컨테이너 상태:"
docker compose -f docker-compose.production.yml ps

# 12. 완료 메시지
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  프로덕션 환경 시작 완료!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
print_info "📋 접속 정보:"
echo "  - 웹 인터페이스: http://localhost:8080"
echo "  - 내부망 접속: http://$(hostname -I | awk '{print $1}'):8080"
if [ -n "$PROFILE_ARGS" ]; then
    echo "  - Grafana 모니터링: http://localhost:3001"
fi
echo ""
print_info "🔧 관리 명령어:"
echo "  - 서비스 중지: ./scripts/stop-production.sh"
echo "  - 로그 확인: docker compose -f docker-compose.production.yml logs -f"
echo "  - 상태 확인: docker compose -f docker-compose.production.yml ps"
echo "  - 시스템 모니터링: ./scripts/monitor.sh"
echo "  - 데이터베이스 백업: ./scripts/backup-db.sh"
echo ""
print_info "📚 추가 문서:"
echo "  - 프로덕션 배포 가이드: PRODUCTION_DEPLOYMENT.md (작성 예정)"
echo "  - 마이그레이션 가이드: MIGRATION_GUIDE.md"
echo "  - 빠른 마이그레이션: QUICK_MIGRATION.md"
echo ""
print_success "프로덕션 환경이 성공적으로 시작되었습니다!"
echo ""
