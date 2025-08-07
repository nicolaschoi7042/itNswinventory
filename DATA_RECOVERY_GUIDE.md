# 🛡️ IT 자산 관리 시스템 - 데이터 복구 가이드

## 📋 목차
1. [즉시 대응](#즉시-대응)
2. [복구 시나리오](#복구-시나리오)
3. [백업 활용](#백업-활용)
4. [데이터 검증](#데이터-검증)
5. [예방 조치](#예방-조치)

---

## 🚨 즉시 대응

### 데이터 문제 발견 시 첫 번째 조치
```bash
# 1. 시스템 즉시 중단 (추가 손상 방지)
docker compose down

# 2. 현재 시간 기록
echo "문제 발견 시간: $(date)" > /tmp/incident_$(date +%Y%m%d_%H%M%S).log

# 3. 긴급 스냅샷 생성
sudo cp -r /var/lib/docker/volumes/itnswinventory_postgres_data/_data /backup/emergency_$(date +%Y%m%d_%H%M%S)
```

---

## 🔄 복구 시나리오

### 시나리오 1: 데이터베이스 완전 손실
```bash
# 1. 최신 백업 확인
ls -la backend/backup/

# 2. PostgreSQL 컨테이너 재시작
docker compose up -d database

# 3. 데이터베이스 복원
docker exec -i it-inventory-db psql -U inventory_user -d inventory_db < backend/backup/backup_YYYYMMDD_HHMMSS.sql

# 4. 데이터 검증
docker exec it-inventory-db psql -U inventory_user -d inventory_db -c "SELECT COUNT(*) FROM employees;"
```

### 시나리오 2: 특정 테이블 데이터 손상
```bash
# 1. 문제 테이블 확인
docker exec it-inventory-db psql -U inventory_user -d inventory_db -c "SELECT * FROM employees LIMIT 5;"

# 2. 해당 테이블만 복원 (예: employees 테이블)
# 백업에서 특정 테이블 추출
pg_restore -U inventory_user -d inventory_db -t employees backup_file.sql

# 3. 데이터 정합성 확인
docker exec it-inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
  (SELECT COUNT(*) FROM employees) as employee_count,
  (SELECT COUNT(*) FROM assignments WHERE employee_id NOT IN (SELECT id FROM employees)) as orphaned_assignments;
"
```

### 시나리오 3: 로컬 스토리지 데이터 복구 (브라우저)
```javascript
// 브라우저 개발자 도구에서 실행
// 1. 백업 데이터 복원
const backupData = {
  employees: [...], // 백업된 데이터
  hardware: [...],
  software: [...],
  assignments: [...]
};

// 2. 로컬 스토리지에 복원
Object.keys(backupData).forEach(key => {
  localStorage.setItem(`inventory_${key}`, JSON.stringify(backupData[key]));
});

// 3. 페이지 새로고침으로 확인
location.reload();
```

---

## 💾 백업 활용

### 자동 백업 확인
```bash
# 1. 백업 디렉터리 확인
ls -la backend/backup/
ls -la /backup/ # 외부 백업 위치

# 2. 백업 파일 검증
file backend/backup/backup_$(date +%Y%m%d)*.sql
head -20 backend/backup/backup_$(date +%Y%m%d)*.sql

# 3. 백업 파일 크기 확인 (비정상적으로 작으면 문제)
du -h backend/backup/backup_*.sql
```

### 수동 백업 생성
```bash
# 1. 현재 상태 긴급 백업
docker exec it-inventory-db pg_dump -U inventory_user -d inventory_db > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 개별 테이블 백업
docker exec it-inventory-db pg_dump -U inventory_user -d inventory_db -t employees > employees_backup_$(date +%Y%m%d_%H%M%S).sql
docker exec it-inventory-db pg_dump -U inventory_user -d inventory_db -t hardware > hardware_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## ✅ 데이터 검증

### 복구 후 필수 검증 항목
```sql
-- 1. 기본 테이블 레코드 수 확인
SELECT 
  'employees' as table_name, COUNT(*) as record_count FROM employees
UNION ALL
SELECT 'hardware', COUNT(*) FROM hardware  
UNION ALL
SELECT 'software', COUNT(*) FROM software
UNION ALL
SELECT 'assignments', COUNT(*) FROM assignments;

-- 2. 데이터 정합성 확인
SELECT 
  'orphaned_assignments' as check_type,
  COUNT(*) as issue_count
FROM assignments a 
WHERE a.employee_id NOT IN (SELECT id FROM employees WHERE is_active = true);

-- 3. 최근 데이터 확인
SELECT 
  'recent_employees' as check_type,
  COUNT(*) as count
FROM employees 
WHERE created_at > NOW() - INTERVAL '7 days';

-- 4. 중복 데이터 확인
SELECT 
  email, COUNT(*) as duplicate_count
FROM employees 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### API 엔드포인트 테스트
```bash
# 1. 기본 API 응답 확인
curl -s http://localhost:3000/api/health | jq .

# 2. 로그인 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq .

# 3. 데이터 조회 테스트 (토큰 필요)
TOKEN="YOUR_JWT_TOKEN"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/employees | jq '. | length'
```

---

## 🛡️ 예방 조치

### 정기 백업 검증
```bash
#!/bin/bash
# backup_verify.sh - 매주 실행 권장

echo "🔍 백업 검증 시작: $(date)"

# 1. 백업 파일 존재 확인
BACKUP_DIR="backend/backup"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup_*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 백업 파일을 찾을 수 없습니다!"
    exit 1
fi

echo "📁 최신 백업: $LATEST_BACKUP"

# 2. 백업 파일 크기 확인 (10KB 미만이면 문제)
SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP" 2>/dev/null)
if [ "$SIZE" -lt 10240 ]; then
    echo "⚠️ 백업 파일 크기가 너무 작습니다: ${SIZE} bytes"
    exit 1
fi

# 3. SQL 구문 검증
if head -10 "$LATEST_BACKUP" | grep -q "PostgreSQL database dump"; then
    echo "✅ 백업 파일 형식 정상"
else
    echo "❌ 백업 파일 형식 이상"
    exit 1
fi

echo "✅ 백업 검증 완료"
```

### 모니터링 스크립트
```bash
#!/bin/bash
# monitor.sh - cron으로 5분마다 실행 권장

# 1. 데이터베이스 연결 확인
if ! docker exec it-inventory-db pg_isready -U inventory_user >/dev/null 2>&1; then
    echo "❌ 데이터베이스 연결 실패: $(date)" >> /var/log/inventory_alerts.log
    # 알림 발송 (이메일, Slack 등)
fi

# 2. API 서버 상태 확인
if ! curl -s -f http://localhost:3000/api/health >/dev/null; then
    echo "❌ API 서버 응답 없음: $(date)" >> /var/log/inventory_alerts.log
fi

# 3. 디스크 사용량 확인 (80% 이상시 경고)
DISK_USAGE=$(df /var/lib/docker/volumes | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️ 디스크 사용량 ${DISK_USAGE}%: $(date)" >> /var/log/inventory_alerts.log
fi
```

---

## 📞 긴급 연락처 및 절차

### 1. 담당자 연락처
```
- 시스템 관리자: [연락처]
- 백업 담당자: [연락처]  
- IT 책임자: [연락처]
```

### 2. 외부 지원
```
- GitHub Issues: https://github.com/nicolaschoi7042/itNswinventory/issues
- Docker Support: 공식 문서 참조
- PostgreSQL Support: 공식 커뮤니티
```

### 3. 문서 업데이트
- 문제 발생 시 이 가이드 업데이트
- 복구 과정 상세 기록
- 개선 사항 반영

---

## 🔗 관련 파일
- `backend/backup/backup.sh` - 자동 백업 스크립트
- `backend/backup/restore.sh` - 복원 스크립트  
- `docker-compose.production.yml` - 운영 환경 설정
- `.env` - 환경 변수 설정

---

**💡 중요**: 정기적인 백업 검증과 복구 테스트를 통해 실제 상황에 대비하세요!