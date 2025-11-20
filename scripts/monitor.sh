#!/bin/bash
# IT 자산 관리 시스템 모니터링 스크립트
# 사용법: ./monitor.sh [--check-all] [--alert-email=your@email.com]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/var/log/it-inventory-monitor.log"
ALERT_FILE="/tmp/it-inventory-alerts.json"

# 컨테이너 이름 설정 (환경 변수로 오버라이드 가능)
# 개발 환경: 기본값 사용
# 프로덕션: CONTAINER_PREFIX=it ./scripts/monitor.sh
CONTAINER_PREFIX="${CONTAINER_PREFIX:-it}"
CONTAINER_WEB="${CONTAINER_WEB:-${CONTAINER_PREFIX}-frontend-prod}"
CONTAINER_DB="${CONTAINER_DB:-${CONTAINER_PREFIX}-postgres-prod}"
CONTAINER_API="${CONTAINER_API:-${CONTAINER_PREFIX}-backend-prod}"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log_message "INFO" "$1"; }
log_warn() { log_message "WARN" "${YELLOW}$1${NC}"; }
log_error() { log_message "ERROR" "${RED}$1${NC}"; }
log_success() { log_message "SUCCESS" "${GREEN}$1${NC}"; }

# 알림 시스템
add_alert() {
    local severity=$1
    local component=$2
    local message=$3
    local timestamp=$(date --iso-8601=seconds)

    # JSON 형태로 알림 저장
    if [ ! -f "$ALERT_FILE" ]; then
        echo "[]" > "$ALERT_FILE"
    fi

    local alert=$(jq -n \
        --arg timestamp "$timestamp" \
        --arg severity "$severity" \
        --arg component "$component" \
        --arg message "$message" \
        '{timestamp: $timestamp, severity: $severity, component: $component, message: $message}')

    jq ". += [$alert]" "$ALERT_FILE" > "${ALERT_FILE}.tmp" && mv "${ALERT_FILE}.tmp" "$ALERT_FILE"
}

# Docker 컨테이너 상태 확인
check_containers() {
    log_info "🐳 Docker 컨테이너 상태 확인..."

    local containers=("$CONTAINER_WEB" "$CONTAINER_DB" "$CONTAINER_API")
    local all_healthy=true

    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            log_success "✅ $container: 정상 실행 중"
        else
            log_error "❌ $container: 실행되지 않음"
            add_alert "critical" "$container" "컨테이너가 실행되지 않음"
            all_healthy=false
        fi
    done

    return $([[ "$all_healthy" == true ]] && echo 0 || echo 1)
}

# 데이터베이스 연결 확인
check_database() {
    log_info "🗄️ 데이터베이스 연결 확인..."

    if docker exec "$CONTAINER_DB" pg_isready -U inventory_user >/dev/null 2>&1; then
        log_success "✅ PostgreSQL: 연결 정상"

        # 기본 쿼리 테스트
        local record_count=$(docker exec "$CONTAINER_DB" psql -U inventory_user -d inventory_db -t -c "SELECT COUNT(*) FROM employees;" 2>/dev/null | xargs)
        if [[ "$record_count" =~ ^[0-9]+$ ]]; then
            log_success "✅ 데이터베이스 쿼리: 정상 ($record_count명의 임직원)"
        else
            log_warn "⚠️ 데이터베이스 쿼리 실행 중 문제 발생"
            add_alert "warning" "database" "쿼리 실행 오류"
        fi
        return 0
    else
        log_error "❌ PostgreSQL: 연결 실패"
        add_alert "critical" "database" "데이터베이스 연결 실패"
        return 1
    fi
}

# API 서버 상태 확인
check_api() {
    log_info "🔧 API 서버 상태 확인..."

    local api_url="http://localhost:3000/api/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$api_url" --connect-timeout 10)

    if [ "$response" = "200" ]; then
        log_success "✅ API 서버: 정상 응답 (HTTP $response)"

        # API 응답 내용 확인
        local api_response=$(curl -s "$api_url" --connect-timeout 5)
        if echo "$api_response" | jq -e '.status == "OK"' >/dev/null 2>&1; then
            log_success "✅ API 응답 내용: 정상"
        else
            log_warn "⚠️ API 응답 내용에 문제가 있을 수 있음"
        fi
        return 0
    else
        log_error "❌ API 서버: 응답 실패 (HTTP $response)"
        add_alert "critical" "api" "API 서버 응답 실패 (HTTP $response)"
        return 1
    fi
}

# 웹 서버 확인
check_web() {
    log_info "🌐 웹 서버 상태 확인..."

    local web_url="http://localhost:8080/index.html"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$web_url" --connect-timeout 10)

    if [ "$response" = "200" ]; then
        log_success "✅ 웹 서버: 정상 응답 (HTTP $response)"
        return 0
    else
        log_error "❌ 웹 서버: 응답 실패 (HTTP $response)"
        add_alert "warning" "web" "웹 서버 응답 실패 (HTTP $response)"
        return 1
    fi
}

# 디스크 사용량 확인
check_disk_usage() {
    log_info "💾 디스크 사용량 확인..."

    local disk_usage=$(df /var/lib/docker/volumes 2>/dev/null | tail -1 | awk '{print $5}' | sed 's/%//' || echo "0")

    if [ "$disk_usage" -gt 90 ]; then
        log_error "❌ 디스크 사용량: ${disk_usage}% (위험 수준)"
        add_alert "critical" "disk" "디스크 사용량 위험: ${disk_usage}%"
    elif [ "$disk_usage" -gt 80 ]; then
        log_warn "⚠️ 디스크 사용량: ${disk_usage}% (경고 수준)"
        add_alert "warning" "disk" "디스크 사용량 경고: ${disk_usage}%"
    else
        log_success "✅ 디스크 사용량: ${disk_usage}% (정상)"
    fi
}

# 백업 상태 확인
check_backups() {
    log_info "💾 백업 상태 확인..."

    local backup_dir="$PROJECT_ROOT/backend/backup"
    if [ ! -d "$backup_dir" ]; then
        log_error "❌ 백업 디렉터리를 찾을 수 없음: $backup_dir"
        add_alert "warning" "backup" "백업 디렉터리 없음"
        return 1
    fi

    local latest_backup=$(ls -t "$backup_dir"/backup_*.sql 2>/dev/null | head -1)
    if [ -z "$latest_backup" ]; then
        log_warn "⚠️ 백업 파일이 없습니다"
        add_alert "warning" "backup" "백업 파일 없음"
        return 1
    fi

    # 백업 파일 나이 확인 (24시간 이상 된 경우 경고)
    local backup_age=$(find "$latest_backup" -mtime +1 2>/dev/null | wc -l)
    if [ "$backup_age" -gt 0 ]; then
        log_warn "⚠️ 최신 백업이 24시간 이상 되었습니다: $(basename "$latest_backup")"
        add_alert "warning" "backup" "백업이 24시간 이상 오래됨"
    else
        log_success "✅ 백업 상태: 정상 ($(basename "$latest_backup"))"
    fi

    # 백업 파일 크기 확인
    local backup_size=$(stat -f%z "$latest_backup" 2>/dev/null || stat -c%s "$latest_backup" 2>/dev/null)
    if [ "$backup_size" -lt 10240 ]; then  # 10KB 미만
        log_warn "⚠️ 백업 파일 크기가 너무 작습니다: ${backup_size} bytes"
        add_alert "warning" "backup" "백업 파일 크기 이상"
    fi
}

# 메모리 사용량 확인
check_memory() {
    log_info "🧠 메모리 사용량 확인..."

    # 전체 시스템 메모리
    local total_mem=$(free -m | awk 'NR==2{print $2}')
    local used_mem=$(free -m | awk 'NR==2{print $3}')
    local mem_percentage=$((used_mem * 100 / total_mem))

    if [ "$mem_percentage" -gt 90 ]; then
        log_error "❌ 시스템 메모리 사용량: ${mem_percentage}% (${used_mem}MB/${total_mem}MB)"
        add_alert "critical" "memory" "시스템 메모리 사용량 위험: ${mem_percentage}%"
    elif [ "$mem_percentage" -gt 80 ]; then
        log_warn "⚠️ 시스템 메모리 사용량: ${mem_percentage}% (${used_mem}MB/${total_mem}MB)"
    else
        log_success "✅ 시스템 메모리 사용량: ${mem_percentage}% (${used_mem}MB/${total_mem}MB)"
    fi

    # Docker 컨테이너별 메모리 (가능한 경우)
    if command -v docker >/dev/null && docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" 2>/dev/null | grep -E "(it-inventory|postgres)" >/dev/null; then
        log_info "📊 컨테이너별 메모리 사용량:"
        docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep -E "(CONTAINER|it-inventory|postgres)" | while IFS= read -r line; do
            log_info "   $line"
        done
    fi
}

# 알림 리포트 생성
generate_alert_report() {
    if [ ! -f "$ALERT_FILE" ] || [ "$(jq '. | length' "$ALERT_FILE")" = "0" ]; then
        log_success "✅ 알림 없음 - 모든 시스템 정상"
        return 0
    fi

    log_warn "📋 알림 리포트:"
    jq -r '.[] | "  [\(.severity | ascii_upcase)] \(.component): \(.message) (\(.timestamp))"' "$ALERT_FILE"

    # 심각한 알림 개수
    local critical_count=$(jq '[.[] | select(.severity == "critical")] | length' "$ALERT_FILE")
    local warning_count=$(jq '[.[] | select(.severity == "warning")] | length' "$ALERT_FILE")

    if [ "$critical_count" -gt 0 ]; then
        log_error "🚨 심각한 문제 ${critical_count}개 발견!"
        return 2
    elif [ "$warning_count" -gt 0 ]; then
        log_warn "⚠️ 경고 ${warning_count}개 발견"
        return 1
    fi
}

# 자가 치유 시도
attempt_self_healing() {
    log_info "🔧 자가 치유 시도..."

    # 컨테이너가 중지된 경우 재시작 시도
    if ! docker ps --format "table {{.Names}}" | grep -q "$CONTAINER_PREFIX"; then
        log_info "💡 중지된 컨테이너 재시작 시도..."
        cd "$PROJECT_ROOT" && docker compose up -d
        sleep 10

        if check_containers >/dev/null && check_api >/dev/null; then
            log_success "✅ 자가 치유 성공: 컨테이너 재시작됨"
            return 0
        fi
    fi

    log_warn "⚠️ 자가 치유 실패 또는 불가능"
    return 1
}

# 메인 실행
main() {
    echo "🔍 IT 자산 관리 시스템 모니터링 시작 ($(date))"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 알림 파일 초기화
    echo "[]" > "$ALERT_FILE"

    local exit_code=0

    # 순차적으로 모든 검사 실행
    check_containers || exit_code=1
    check_database || exit_code=1
    check_api || exit_code=1
    check_web || exit_code=1
    check_disk_usage
    check_memory
    check_backups

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 알림 리포트 생성
    local alert_status
    generate_alert_report
    alert_status=$?

    # 심각한 문제가 있고 자가 치유 옵션이 활성화된 경우
    if [ "$alert_status" -eq 2 ] && [ "$1" = "--auto-heal" ]; then
        attempt_self_healing
    fi

    echo "🏁 모니터링 완료 ($(date))"

    # 전체 상태에 따른 종료 코드
    if [ "$alert_status" -eq 2 ]; then
        exit 2  # 심각한 문제
    elif [ "$alert_status" -eq 1 ] || [ "$exit_code" -eq 1 ]; then
        exit 1  # 경고
    else
        exit 0  # 정상
    fi
}

# 도움말
show_help() {
    cat << EOF
IT 자산 관리 시스템 모니터링 스크립트

사용법:
  $0 [옵션]

옵션:
  --check-all     모든 검사 실행 (기본값)
  --auto-heal     문제 발견시 자가 치유 시도
  --help          이 도움말 표시

종료 코드:
  0: 모든 시스템 정상
  1: 경고 수준 문제 발견
  2: 심각한 문제 발견

예제:
  $0                    # 기본 모니터링
  $0 --auto-heal        # 자가 치유 포함 모니터링

cron 설정 예제:
  # 5분마다 모니터링
  */5 * * * * /path/to/monitor.sh >/dev/null 2>&1

  # 매시간 자가 치유 포함 모니터링
  0 * * * * /path/to/monitor.sh --auto-heal
EOF
}

# 인수 처리
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --auto-heal)
        main --auto-heal
        ;;
    *)
        main "$@"
        ;;
esac
