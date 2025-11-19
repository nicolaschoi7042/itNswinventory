# 서버 이전 빠른 가이드

IT 자산 인벤토리 시스템을 빠르게 새 서버로 이전하기 위한 핵심 명령어 모음입니다.

상세한 설명이 필요하면 [전체 마이그레이션 가이드(MIGRATION_GUIDE.md)](MIGRATION_GUIDE.md)를 참조하세요.

---

## 📋 사전 체크리스트

### 기존 서버
- [ ] Docker 실행 중
- [ ] 데이터베이스 정상 작동
- [ ] 충분한 디스크 공간 (백업 크기의 2배)

### 새 서버
- [ ] Docker 설치 완료 (20.10+)
- [ ] Docker Compose 설치 완료 (2.0+)
- [ ] 포트 개방: 8080, 3001, 5432
- [ ] 충분한 디스크 공간 (10GB+)

---

## 🚀 빠른 마이그레이션 (3단계)

### 1️⃣ 기존 서버: 백업 생성

```bash
cd /home/linux/workspace/itNswinventory

# 전체 시스템 백업 (권장)
./scripts/full-backup.sh

# 백업 완료 확인
ls -lh backups/*.tar.gz
```

**백업 내용:**
- 데이터베이스 전체 덤프
- 환경 설정 파일
- 애플리케이션 코드
- 문서

---

### 2️⃣ 백업 파일 전송

```bash
# 백업 파일을 새 서버로 전송
scp backups/it-inventory-full-backup_*.tar.gz user@새서버IP:/home/user/

# 또는 rsync 사용 (더 빠름)
rsync -avz --progress backups/it-inventory-full-backup_*.tar.gz user@새서버IP:/home/user/
```

---

### 3️⃣ 새 서버: 복원 및 시작

```bash
# SSH로 새 서버 접속
ssh user@새서버IP

# 백업 압축 해제
mkdir -p ~/migration-temp
cd ~/migration-temp
tar -xzf ~/it-inventory-full-backup_*.tar.gz

# 프로젝트 디렉토리 생성 및 파일 복사
mkdir -p ~/itNswinventory
cd it-inventory-full-backup_*/
cp -r app/* ~/itNswinventory/
cp config/.env ~/itNswinventory/backend/.env
cp config/docker-compose.yml ~/itNswinventory/
cp config/nginx.conf ~/itNswinventory/ 2>/dev/null || true

# 환경 설정 수정 (중요!)
cd ~/itNswinventory
nano backend/.env
# 수정 항목:
# - FRONTEND_URL=http://새서버IP:8080
# - LDAP_SERVER=ldap://LDAP서버IP:389 (LDAP 사용 시)

# 실행 권한 설정
chmod +x *.sh scripts/*.sh

# 데이터베이스 시작 및 복원
docker compose up -d it-inventory-db
sleep 30
docker exec it-inventory-db pg_isready -U inventory_user

# 데이터베이스 복원
./scripts/restore-db.sh ~/migration-temp/it-inventory-full-backup_*/database_backup.sql

# 전체 서비스 시작
./start.sh

# 상태 확인
docker compose ps
```

---

## ✅ 검증 (5분)

### 1. 컨테이너 상태
```bash
docker compose ps
# 모든 서비스가 "Up" 또는 "Up (healthy)" 상태여야 함
```

### 2. 웹 접속
브라우저에서: `http://새서버IP:8080`

### 3. 로그인 테스트
- 아이디: `admin`
- 비밀번호: `admin123`

### 4. 데이터 확인
- [ ] 임직원 데이터 표시
- [ ] 하드웨어 자산 표시
- [ ] 소프트웨어 라이선스 표시
- [ ] 할당 현황 표시

### 5. 데이터 개수 검증
```bash
docker exec it-inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 'employees' as table, COUNT(*) FROM employees
UNION ALL SELECT 'hardware', COUNT(*) FROM hardware
UNION ALL SELECT 'software', COUNT(*) FROM software
UNION ALL SELECT 'assignments', COUNT(*) FROM assignments;"
```

백업 시 출력된 통계와 비교!

---

## ⚡ 데이터베이스만 백업/복원 (더 빠름)

### 백업 (기존 서버)
```bash
cd /home/linux/workspace/itNswinventory
./scripts/backup-db.sh
```

### 복원 (새 서버)
```bash
# 1. Git에서 프로젝트 클론
git clone <저장소URL> ~/itNswinventory
cd ~/itNswinventory

# 2. 환경 설정 파일 복사 및 수정
cp ~/backup.env backend/.env
nano backend/.env  # IP 주소 등 수정

# 3. 데이터베이스 시작 및 복원
chmod +x scripts/*.sh
docker compose up -d it-inventory-db
sleep 30
./scripts/restore-db.sh ~/inventory_backup_*.sql

# 4. 전체 서비스 시작
./start.sh
```

---

## 🔧 필수 환경 변수 수정

`backend/.env` 파일에서 **반드시 수정**해야 할 항목:

```bash
# 새 서버 IP로 변경
FRONTEND_URL=http://새서버IP:8080

# LDAP 서버 주소 (LDAP 사용 시)
LDAP_SERVER=ldap://LDAP서버IP:389
```

**변경하지 말아야 할 항목 (중요!):**

```bash
# 데이터베이스 설정 (백업과 일치해야 함)
DB_PASSWORD=inventory_password_2024
DB_USER=inventory_user
DB_NAME=inventory_db

# JWT 시크릿 (기존 토큰 호환성)
JWT_SECRET=inventory-jwt-secret-key-2024

# LDAP 인증 정보 (기존과 동일하게)
LDAP_BIND_DN=cn=admin,dc=roboetech,dc=com
LDAP_BIND_PASSWORD=admin
```

---

## 🚨 문제 해결

### 컨테이너가 시작되지 않음
```bash
docker compose down -v
docker compose up -d
docker compose logs -f
```

### 웹 페이지 접속 안 됨
```bash
# 방화벽 확인
sudo ufw allow 8080/tcp

# 컨테이너 로그
docker compose logs it-inventory-web
```

### API 연결 오류
```bash
# API 서버 상태
curl http://localhost:3001/api/health

# 데이터베이스 연결
docker exec it-inventory-db pg_isready -U inventory_user
```

### 데이터베이스 복원 실패
```bash
# 완전 초기화 후 재시도
docker compose down -v
docker compose up -d it-inventory-db
sleep 30
./scripts/restore-db.sh <백업파일>
```

---

## 📞 추가 도움말

- **상세 가이드**: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **데이터 복구**: [DATA_RECOVERY_GUIDE.md](DATA_RECOVERY_GUIDE.md)
- **LDAP 설정**: [LDAP_SETUP.md](LDAP_SETUP.md)
- **기본 사용법**: [README.md](README.md)

---

## 💡 팁

### 다운타임 최소화
1. 백업을 미리 생성하고 새 서버에 전송
2. 새 서버에서 복원 및 테스트 완료
3. 서비스 전환 시점에만 DNS 변경 또는 사용자 안내

### 백업 자동화
```bash
# 매일 새벽 2시 자동 백업
crontab -e
# 추가:
0 2 * * * cd /home/linux/workspace/itNswinventory && ./scripts/full-backup.sh >> /var/log/it-inventory-backup.log 2>&1
```

### 모니터링 자동화
```bash
# 5분마다 자동 모니터링 및 자가 치유
crontab -e
# 추가:
*/5 * * * * cd /home/linux/workspace/itNswinventory && ./scripts/monitor.sh --auto-heal >> /var/log/it-inventory-monitor.log 2>&1
```

---

**예상 소요 시간**: 30분 ~ 1시간
**서비스 중단 시간**: 10-20분 (복원 및 검증)
