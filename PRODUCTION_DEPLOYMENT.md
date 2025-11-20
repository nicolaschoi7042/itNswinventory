# IT 자산 인벤토리 시스템 - 프로덕션 배포 가이드

## 📋 목차

1. [개요](#개요)
2. [시스템 요구사항](#시스템-요구사항)
3. [배포 전 체크리스트](#배포-전-체크리스트)
4. [프로덕션 환경 설정](#프로덕션-환경-설정)
5. [배포 절차](#배포-절차)
6. [백업 및 복구](#백업-및-복구)
7. [모니터링](#모니터링)
8. [트러블슈팅](#트러블슈팅)
9. [보안 권장사항](#보안-권장사항)
10. [유지보수](#유지보수)

---

## 개요

이 문서는 IT 자산 인벤토리 시스템을 프로덕션 환경에 배포하기 위한 상세 가이드입니다.

### 프로덕션 vs 개발 환경 차이점

| 구분 | 개발 환경 | 프로덕션 환경 |
|-----|----------|-------------|
| Docker Compose 파일 | `docker-compose.yml` | `docker-compose.production.yml` |
| 컨테이너 네트워크 | Host 모드 (API) | Bridge 네트워크 |
| 컨테이너 이름 | `it-inventory-*` | `it-*-prod` |
| 자동 백업 | 수동 | 매일 2회 자동 (오전 2시, 오후 2시) |
| 모니터링 | 없음 | Prometheus + Grafana (선택사항) |
| NODE_ENV | development | production |

---

## 시스템 요구사항

### 하드웨어

- **CPU**: 최소 2 코어 (권장 4 코어)
- **메모리**: 최소 4GB RAM (권장 8GB)
- **디스크**: 최소 20GB 여유 공간 (권장 50GB 이상)
- **네트워크**: 1Gbps 이상

### 소프트웨어

- **OS**: Ubuntu 20.04 LTS 이상 또는 CentOS 8 이상
- **Docker**: 20.10 이상
- **Docker Compose**: V2 (docker compose 명령어 지원)
- **Git**: 2.x 이상

### 네트워크 요구사항

- **필수 포트**:
  - `8080`: 웹 인터페이스 (HTTP)
  - `5432`: PostgreSQL 데이터베이스 (내부 네트워크만)

- **선택 포트** (모니터링 사용 시):
  - `3001`: Grafana 대시보드

- **LDAP 연결**:
  - LDAP 서버 접근 가능 (기본: `172.30.1.97:389`)

---

## 배포 전 체크리스트

### 1. 시스템 준비
- [ ] Docker 설치 및 실행 확인
- [ ] Docker Compose V2 설치 확인
- [ ] 디스크 여유 공간 확인 (최소 20GB)
- [ ] 필요한 포트가 열려있는지 확인
- [ ] 방화벽 설정 확인

### 2. 네트워크 확인
- [ ] LDAP 서버 연결 테스트
- [ ] DNS 해상도 확인
- [ ] 내부 네트워크 라우팅 확인

### 3. 보안 준비
- [ ] SSL/TLS 인증서 준비 (선택사항)
- [ ] 강력한 비밀번호 생성
- [ ] JWT Secret 키 생성
- [ ] 보안 정책 검토

### 4. 백업 계획
- [ ] 백업 저장소 준비
- [ ] 백업 보관 정책 결정
- [ ] 복구 절차 테스트

---

## 프로덕션 환경 설정

### 1. 환경 변수 파일 생성

프로덕션 환경 템플릿을 복사하여 실제 환경 변수 파일을 생성합니다:

```bash
# 프로젝트 루트 디렉토리에서 실행
cp .env.production backend/.env
```

### 2. 환경 변수 설정

`backend/.env` 파일을 편집하여 모든 `CHANGE_ME_` 값을 변경합니다:

```bash
nano backend/.env
```

**필수 변경 항목:**

#### 데이터베이스 비밀번호
```bash
# 강력한 비밀번호로 변경 (최소 16자, 영문/숫자/특수문자 혼합)
DB_PASSWORD=your_strong_database_password_here
```

**생성 방법:**
```bash
# 무작위 비밀번호 생성
openssl rand -base64 24
```

#### JWT Secret 키
```bash
# 최소 32자 이상의 무작위 문자열
JWT_SECRET=your_random_jwt_secret_key_min_32_chars
```

**생성 방법:**
```bash
# 무작위 JWT Secret 생성
openssl rand -base64 48
```

#### LDAP 설정
```bash
# LDAP 서버 정보 확인 및 변경
LDAP_ENABLED=true
LDAP_SERVER=ldap://172.30.1.97:389
LDAP_BIND_DN=cn=admin,dc=roboetech,dc=com
LDAP_BIND_PASSWORD=your_ldap_bind_password
```

**LDAP 연결 테스트:**
```bash
# ldapsearch 명령어로 LDAP 서버 연결 테스트
ldapsearch -x -H ldap://172.30.1.97:389 -D "cn=admin,dc=roboetech,dc=com" -W -b "ou=users,dc=roboetech,dc=com"
```

### 3. 파일 권한 설정

보안을 위해 환경 변수 파일의 권한을 제한합니다:

```bash
chmod 600 backend/.env
```

### 4. 환경 변수 검증

설정한 환경 변수를 검증합니다:

```bash
# CHANGE_ME_ 문자열이 남아있는지 확인
grep "CHANGE_ME_" backend/.env

# 결과가 없어야 정상입니다.
```

---

## 배포 절차

### 방법 1: 자동 배포 스크립트 사용 (권장)

프로덕션 배포 스크립트를 사용하여 자동으로 배포합니다:

```bash
# 기본 배포 (모니터링 제외)
./scripts/start-production.sh

# 모니터링 포함 배포
./scripts/start-production.sh --with-monitoring
```

스크립트는 다음 작업을 자동으로 수행합니다:
1. Docker 및 Docker Compose 설치 확인
2. 환경 변수 파일 검증
3. 필수 디렉토리 생성
4. 기존 컨테이너 확인 및 중지
5. Docker 이미지 빌드
6. 컨테이너 시작
7. 헬스체크 대기
8. 배포 완료 메시지 출력

### 방법 2: 수동 배포

단계별로 수동 배포하는 방법:

#### 1단계: 필수 디렉토리 생성
```bash
mkdir -p logs backups backend/backup
```

#### 2단계: 환경 변수 로드
```bash
# .env 파일을 환경 변수로 로드
set -a
source backend/.env
set +a
```

#### 3단계: Docker 이미지 빌드
```bash
# 프로덕션 이미지 빌드
docker compose -f docker-compose.production.yml build

# 모니터링 포함 빌드
docker compose -f docker-compose.production.yml build --profile monitoring
```

#### 4단계: 컨테이너 시작
```bash
# 기본 서비스 시작
docker compose -f docker-compose.production.yml up -d

# 모니터링 포함 시작
docker compose -f docker-compose.production.yml --profile monitoring up -d
```

#### 5단계: 서비스 상태 확인
```bash
# 컨테이너 상태 확인
docker compose -f docker-compose.production.yml ps

# 로그 확인
docker compose -f docker-compose.production.yml logs -f
```

### 배포 후 검증

#### 1. 컨테이너 상태 확인
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**예상 결과:**
```
NAMES                          STATUS              PORTS
it-frontend-prod              Up 2 minutes        0.0.0.0:8080->80/tcp
it-backend-prod               Up 2 minutes (healthy)
it-postgres-prod              Up 2 minutes (healthy)   0.0.0.0:5432->5432/tcp
it-backup-scheduler-prod      Up 2 minutes
```

#### 2. 웹 인터페이스 접속
```bash
# 로컬에서 접속
curl http://localhost:8080

# 상태 코드 200이면 정상
```

브라우저에서 접속: `http://서버IP:8080`

#### 3. API 서버 헬스체크
```bash
curl http://localhost:3000/api/health
```

**예상 응답:**
```json
{"status":"OK","timestamp":"2025-11-20T..."}
```

#### 4. 데이터베이스 연결 확인
```bash
docker exec it-postgres-prod pg_isready -U inventory_user -d inventory_db
```

**예상 결과:**
```
/var/run/postgresql:5432 - accepting connections
```

#### 5. LDAP 연결 테스트 (LDAP 활성화 시)

관리자 계정으로 로그인하여 LDAP 인증을 테스트합니다.

---

## 백업 및 복구

### 자동 백업 (프로덕션 환경)

프로덕션 환경에서는 백업 스케줄러가 자동으로 매일 2회 백업을 수행합니다:
- **오전 2시**: 일일 백업
- **오후 2시**: 추가 백업

백업 로그 확인:
```bash
docker logs it-backup-scheduler-prod
```

### 수동 백업

#### 데이터베이스 백업
```bash
# 환경 변수 설정
export CONTAINER_NAME=it-postgres-prod

# 백업 실행
./scripts/backup-db.sh

# 백업 파일 확인
ls -lh backups/
```

#### 전체 시스템 백업
```bash
# 전체 백업 (데이터베이스 + 설정 파일 + 애플리케이션)
./scripts/full-backup.sh
```

### 백업 검증

백업 파일의 무결성을 정기적으로 검증합니다:

```bash
# 최신 백업 파일 확인
LATEST_BACKUP=$(ls -t backups/inventory_backup_*.sql | head -1)

# 파일 크기 확인 (최소 1KB 이상)
ls -lh "$LATEST_BACKUP"

# PostgreSQL 덤프 헤더 확인
head -5 "$LATEST_BACKUP" | grep "PostgreSQL database dump"
```

### 데이터 복구

#### 방법 1: 복구 스크립트 사용
```bash
# 환경 변수 설정
export CONTAINER_NAME=it-postgres-prod

# 복구 실행
./scripts/restore-db.sh backups/inventory_backup_20251120_020000.sql
```

#### 방법 2: 수동 복구
```bash
# 1. 백업 파일이 압축된 경우 압축 해제
gunzip backups/inventory_backup_20251120_020000.sql.gz

# 2. 데이터베이스 복구
docker exec -i it-postgres-prod psql -U inventory_user -d inventory_db < backups/inventory_backup_20251120_020000.sql

# 3. 데이터 검증
docker exec it-postgres-prod psql -U inventory_user -d inventory_db -c "SELECT COUNT(*) FROM users;"
```

### 백업 보관 정책

**권장 보관 정책:**
- **일일 백업**: 최근 7일분 보관
- **주간 백업**: 최근 4주분 보관
- **월간 백업**: 최근 12개월분 보관

**자동 정리 스크립트 (Cron 등록):**
```bash
# /etc/cron.daily/cleanup-old-backups
#!/bin/bash
# 7일 이상 된 백업 파일 삭제
find /path/to/backups -name "inventory_backup_*.sql*" -mtime +7 -delete
```

---

## 모니터링

### 시스템 모니터링 스크립트

모니터링 스크립트를 사용하여 시스템 상태를 확인합니다:

```bash
# 환경 변수 설정 (프로덕션 컨테이너 이름 사용)
export CONTAINER_PREFIX=it
export CONTAINER_WEB=it-frontend-prod
export CONTAINER_DB=it-postgres-prod
export CONTAINER_API=it-backend-prod

# 모니터링 실행
./scripts/monitor.sh

# 자가 치유 포함 모니터링
./scripts/monitor.sh --auto-heal
```

### Cron으로 자동 모니터링 설정

```bash
# Crontab 편집
crontab -e

# 5분마다 모니터링 실행
*/5 * * * * cd /path/to/itNswinventory && export CONTAINER_PREFIX=it && export CONTAINER_WEB=it-frontend-prod && export CONTAINER_DB=it-postgres-prod && export CONTAINER_API=it-backend-prod && ./scripts/monitor.sh >> /var/log/it-inventory-monitor.log 2>&1

# 매시간 자가 치유 포함 모니터링
0 * * * * cd /path/to/itNswinventory && export CONTAINER_PREFIX=it && export CONTAINER_WEB=it-frontend-prod && export CONTAINER_DB=it-postgres-prod && export CONTAINER_API=it-backend-prod && ./scripts/monitor.sh --auto-heal >> /var/log/it-inventory-monitor.log 2>&1
```

### Prometheus + Grafana 모니터링 (선택사항)

모니터링 스택을 사용하려면:

```bash
# 모니터링 포함 시작
./scripts/start-production.sh --with-monitoring

# Grafana 접속
# URL: http://서버IP:3001
# 아이디: admin
# 비밀번호: backend/.env의 GRAFANA_PASSWORD 값
```

### 로그 모니터링

#### 실시간 로그 확인
```bash
# 모든 컨테이너 로그
docker compose -f docker-compose.production.yml logs -f

# 특정 컨테이너 로그
docker logs -f it-backend-prod
docker logs -f it-postgres-prod
```

#### 로그 파일 위치
- **Nginx 로그**: `./logs/`
- **API 로그**: Docker 볼륨 `api_logs`
- **데이터베이스 로그**: Docker 로그

---

## 트러블슈팅

### 1. 컨테이너가 시작되지 않음

**증상:** 컨테이너가 반복적으로 재시작되거나 시작 실패

**해결 방법:**
```bash
# 1. 로그 확인
docker compose -f docker-compose.production.yml logs

# 2. 특정 컨테이너 상태 확인
docker inspect it-backend-prod

# 3. 환경 변수 확인
docker exec it-backend-prod env | grep -E "DB_|JWT_|LDAP_"

# 4. 데이터베이스 연결 확인
docker exec it-postgres-prod pg_isready -U inventory_user
```

### 2. LDAP 인증 실패

**증상:** LDAP 계정으로 로그인할 수 없음

**해결 방법:**
```bash
# 1. LDAP 서버 연결 테스트
docker exec it-backend-prod nc -zv 172.30.1.97 389

# 2. LDAP 환경 변수 확인
docker exec it-backend-prod env | grep LDAP

# 3. API 로그에서 LDAP 오류 확인
docker logs it-backend-prod | grep LDAP

# 4. 수동 LDAP 테스트 (호스트에서)
ldapsearch -x -H ldap://172.30.1.97:389 -D "cn=admin,dc=roboetech,dc=com" -W -b "ou=users,dc=roboetech,dc=com"
```

**일반적인 원인:**
- LDAP 서버 접근 불가 (방화벽, 네트워크)
- 잘못된 LDAP_BIND_DN 또는 LDAP_BIND_PASSWORD
- 잘못된 사용자 Base DN

### 3. 데이터베이스 연결 실패

**증상:** API 서버가 데이터베이스에 연결할 수 없음

**해결 방법:**
```bash
# 1. 데이터베이스 컨테이너 상태 확인
docker ps | grep postgres-prod

# 2. 데이터베이스 로그 확인
docker logs it-postgres-prod

# 3. 네트워크 연결 확인
docker exec it-backend-prod ping -c 3 database

# 4. 환경 변수 확인
docker exec it-backend-prod env | grep DB_
```

### 4. 백업 실패

**증상:** 자동 백업이 실행되지 않거나 실패

**해결 방법:**
```bash
# 1. 백업 스케줄러 로그 확인
docker logs it-backup-scheduler-prod

# 2. 백업 스크립트 실행 권한 확인
docker exec it-backup-scheduler-prod ls -la /scripts/backup-db.sh

# 3. 디스크 공간 확인
df -h

# 4. 수동 백업 테스트
docker exec it-backup-scheduler-prod /scripts/backup-db.sh /backups
```

### 5. 웹 인터페이스 접속 불가

**증상:** 브라우저에서 웹 인터페이스에 접속할 수 없음

**해결 방법:**
```bash
# 1. 프론트엔드 컨테이너 상태 확인
docker ps | grep frontend-prod

# 2. 포트 바인딩 확인
docker port it-frontend-prod

# 3. 네트워크 연결 확인
curl -I http://localhost:8080

# 4. Nginx 로그 확인
docker logs it-frontend-prod

# 5. 방화벽 확인
sudo ufw status | grep 8080
```

---

## 보안 권장사항

### 1. 환경 변수 보안

- **절대 Git에 커밋하지 않기**: `backend/.env` 파일은 `.gitignore`에 포함
- **강력한 비밀번호 사용**: 최소 16자, 영문/숫자/특수문자 혼합
- **정기적인 비밀번호 변경**: 최소 90일마다
- **파일 권한 제한**: `chmod 600 backend/.env`

### 2. 네트워크 보안

```bash
# 방화벽 설정 (UFW 예시)
sudo ufw allow 8080/tcp comment "IT Inventory Web"
sudo ufw deny 5432/tcp comment "PostgreSQL - internal only"
sudo ufw enable
```

### 3. SSL/TLS 설정 (권장)

프로덕션 환경에서는 HTTPS를 사용하는 것을 권장합니다.

#### Nginx SSL 설정 예시:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8080;
    }
}
```

### 4. 데이터베이스 보안

- 외부 접근 차단 (내부 네트워크만)
- 강력한 비밀번호 사용
- 정기적인 백업
- 접근 로그 모니터링

### 5. 컨테이너 보안

```bash
# Docker 이미지 취약점 스캔
docker scan it-backend-prod

# 불필요한 권한 제거
# docker-compose.production.yml에서 privileged: false 확인

# 읽기 전용 루트 파일 시스템 (선택사항)
# read_only: true 옵션 사용
```

---

## 유지보수

### 정기 유지보수 작업

#### 일일 작업
- [ ] 시스템 로그 확인
- [ ] 백업 상태 확인
- [ ] 디스크 사용량 확인

#### 주간 작업
- [ ] 시스템 업데이트 확인
- [ ] 백업 복구 테스트
- [ ] 성능 모니터링
- [ ] 로그 분석

#### 월간 작업
- [ ] 보안 패치 적용
- [ ] 비밀번호 변경 검토
- [ ] 백업 정책 검토
- [ ] 용량 계획 검토

### 시스템 업데이트

#### 애플리케이션 업데이트
```bash
# 1. Git 저장소 업데이트
git pull origin main

# 2. 백업 생성
./scripts/backup-db.sh

# 3. 서비스 중지
./scripts/stop-production.sh

# 4. 새 버전 배포
./scripts/start-production.sh

# 5. 업데이트 검증
curl http://localhost:8080
```

#### Docker 이미지 업데이트
```bash
# 1. 이미지 재빌드
docker compose -f docker-compose.production.yml build --no-cache

# 2. 서비스 재시작
docker compose -f docker-compose.production.yml up -d

# 3. 상태 확인
docker compose -f docker-compose.production.yml ps
```

### 로그 로테이션

로그 파일이 과도하게 커지는 것을 방지하기 위해 로테이션 설정:

```bash
# /etc/logrotate.d/it-inventory
/path/to/itNswinventory/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
```

### 데이터베이스 유지보수

```bash
# VACUUM 실행 (데이터베이스 최적화)
docker exec it-postgres-prod psql -U inventory_user -d inventory_db -c "VACUUM ANALYZE;"

# 테이블 크기 확인
docker exec it-postgres-prod psql -U inventory_user -d inventory_db -c "
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

---

## 추가 리소스

### 관련 문서
- [마이그레이션 가이드](MIGRATION_GUIDE.md)
- [빠른 마이그레이션](QUICK_MIGRATION.md)
- [데이터 복구 가이드](DATA_RECOVERY_GUIDE.md)
- [LDAP 설정 가이드](LDAP_SETUP.md)
- [업그레이드 가이드](UPGRADE_GUIDE.md)

### 스크립트 참조
- 프로덕션 시작: `scripts/start-production.sh`
- 프로덕션 중지: `scripts/stop-production.sh`
- 데이터베이스 백업: `scripts/backup-db.sh`
- 데이터베이스 복구: `scripts/restore-db.sh`
- 전체 백업: `scripts/full-backup.sh`
- 시스템 모니터링: `scripts/monitor.sh`

### 지원 및 문의

문제가 발생하거나 도움이 필요한 경우:
1. 로그 파일 확인
2. 트러블슈팅 섹션 참조
3. 이슈 트래커에 문의

---

## 버전 정보

- **문서 버전**: 1.0
- **최종 업데이트**: 2025-11-20
- **애플리케이션 버전**: 2.0

---

**면책 조항**: 이 문서는 IT 자산 인벤토리 시스템의 프로덕션 배포를 돕기 위한 가이드입니다. 실제 프로덕션 환경은 조직의 보안 정책과 요구사항에 따라 추가적인 설정이 필요할 수 있습니다.
