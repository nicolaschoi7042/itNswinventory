# IT 자산 인벤토리 시스템 - 서버 이전 가이드

이 문서는 IT 자산 인벤토리 시스템을 다른 서버로 이전하는 전체 과정을 안내합니다.

## 목차

1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [백업 단계](#백업-단계)
4. [새 서버 준비](#새-서버-준비)
5. [복원 단계](#복원-단계)
6. [검증 및 테스트](#검증-및-테스트)
7. [문제 해결](#문제-해결)
8. [롤백 절차](#롤백-절차)

---

## 개요

### 마이그레이션 방법

두 가지 방법 중 선택할 수 있습니다:

#### 방법 1: 전체 시스템 백업 (권장)
- **장점**: 모든 파일과 설정을 한 번에 백업
- **단점**: 백업 파일 크기가 큼
- **사용 시나리오**: 첫 이전, 완전한 복제 필요 시

#### 방법 2: 데이터베이스만 백업
- **장점**: 백업 파일 크기가 작음, 빠름
- **단점**: 애플리케이션 파일은 Git에서 별도로 받아야 함
- **사용 시나리오**: Git 저장소 사용 가능, 빠른 이전 필요 시

### 예상 소요 시간

- **백업**: 5-10분
- **전송**: 네트워크 속도에 따라 다름 (로컬 네트워크: 1-5분, 인터넷: 10-30분)
- **복원**: 10-15분
- **검증**: 5-10분
- **총계**: 약 30분 ~ 1시간

### 다운타임

- **서비스 중단 시간**: 약 10-20분 (복원 및 검증 시간)
- **최소화 방법**: 백업과 새 서버 준비를 미리 완료한 후, DNS 전환 시점에만 서비스 중단

---

## 사전 준비

### 체크리스트

#### 기존 서버

- [ ] 서버 접근 권한 확인
- [ ] Docker 및 Docker Compose 설치 확인
- [ ] 충분한 디스크 공간 확인 (백업 파일 크기의 2배 이상)
- [ ] 데이터베이스가 정상 작동 중인지 확인
- [ ] 현재 데이터 통계 확인 (백업 후 비교용)

#### 새 서버

- [ ] 서버 접근 권한 확인
- [ ] Docker 설치 (버전 20.10 이상)
- [ ] Docker Compose 설치 (버전 2.0 이상)
- [ ] 충분한 디스크 공간 확인 (최소 10GB 이상)
- [ ] 필요한 포트 개방 (8080, 3001, 5432, 5050)
- [ ] 네트워크 설정 확인 (LDAP 서버 접근 가능 여부)

### 필수 도구 설치 확인

```bash
# Docker 설치 확인
docker --version
# 출력 예: Docker version 24.0.7, build afdd53b

# Docker Compose 설치 확인
docker compose version
# 출력 예: Docker Compose version v2.23.0

# Git 설치 확인 (방법 2 사용 시)
git --version
```

Docker가 설치되지 않은 경우:

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 로그아웃 후 다시 로그인
```

### 네트워크 정보 수집

다음 정보를 미리 확인하세요:

- 새 서버 IP 주소: _______________
- LDAP 서버 주소 (사용 시): _______________
- LDAP 서버 포트 (기본 389): _______________
- 새 서버에서 LDAP 서버 접근 가능 여부: [ ] 예 [ ] 아니오

---

## 백업 단계

### 방법 1: 전체 시스템 백업 (권장)

#### 1단계: 백업 스크립트 실행

```bash
cd /home/linux/workspace/itNswinventory

# 전체 시스템 백업 실행
./scripts/full-backup.sh

# 또는 백업 디렉토리 지정
./scripts/full-backup.sh /path/to/backup/directory
```

**스크립트가 수행하는 작업:**
- 데이터베이스 전체 덤프 생성
- 환경 설정 파일 백업 (.env, docker-compose.yml 등)
- 애플리케이션 파일 백업 (HTML, JS, CSS, 백엔드 코드)
- 문서 파일 백업
- 백업 정보 파일 생성

#### 2단계: 백업 파일 확인

```bash
# 백업 디렉토리 내용 확인
ls -lh backups/

# 백업 정보 확인
cat backups/it-inventory-full-backup_YYYYMMDD_HHMMSS/BACKUP_INFO.txt
```

#### 3단계: 백업 파일 전송 준비

압축된 백업 파일을 새 서버로 전송할 준비를 합니다.

```bash
# 백업 파일 목록 확인
ls -lh backups/*.tar.gz

# 예상 출력:
# it-inventory-full-backup_20250119_143000.tar.gz  15M
```

### 방법 2: 데이터베이스만 백업

#### 1단계: 데이터베이스 백업

```bash
cd /home/linux/workspace/itNswinventory

# 데이터베이스만 백업
./scripts/backup-db.sh

# 또는 백업 디렉토리 지정
./scripts/backup-db.sh /path/to/backup/directory
```

#### 2단계: 환경 설정 파일 백업 (수동)

```bash
# .env 파일 백업
cp backend/.env backend/.env.backup
```

---

## 새 서버 준비

### 1단계: 백업 파일 전송

#### 방법 1을 사용한 경우 (전체 시스템 백업)

```bash
# SCP를 사용한 전송
scp backups/it-inventory-full-backup_YYYYMMDD_HHMMSS.tar.gz user@새서버IP:/home/user/

# 또는 rsync 사용 (더 빠름)
rsync -avz --progress backups/it-inventory-full-backup_YYYYMMDD_HHMMSS.tar.gz user@새서버IP:/home/user/
```

#### 방법 2를 사용한 경우 (데이터베이스만 백업)

```bash
# 데이터베이스 백업 파일 전송
scp backups/inventory_backup_YYYYMMDD_HHMMSS.sql.gz user@새서버IP:/home/user/

# 환경 설정 파일 전송
scp backend/.env user@새서버IP:/home/user/
```

### 2단계: 새 서버에서 파일 준비

SSH로 새 서버에 접속:

```bash
ssh user@새서버IP
```

#### 방법 1: 전체 백업에서 복원

```bash
# 작업 디렉토리 생성
mkdir -p ~/it-inventory
cd ~/it-inventory

# 백업 파일 압축 해제
tar -xzf ~/it-inventory-full-backup_YYYYMMDD_HHMMSS.tar.gz

# 백업 디렉토리로 이동
cd it-inventory-full-backup_YYYYMMDD_HHMMSS

# 애플리케이션 파일을 프로젝트 디렉토리로 복사
mkdir -p ~/itNswinventory
cp -r app/* ~/itNswinventory/

# 설정 파일 복사
cp config/.env ~/itNswinventory/backend/.env
cp config/docker-compose.yml ~/itNswinventory/
cp config/nginx.conf ~/itNswinventory/

# 데이터베이스 백업 파일 위치 확인
ls -lh database_backup.sql
```

#### 방법 2: Git에서 프로젝트 받기

```bash
# Git 저장소 클론
cd ~
git clone <저장소URL> itNswinventory
cd itNswinventory

# 환경 설정 파일 복사
cp ~/env.backup backend/.env
```

### 3단계: 환경 설정 수정

새 서버 환경에 맞게 설정을 수정합니다:

```bash
cd ~/itNswinventory

# .env 파일 편집
nano backend/.env
```

**수정이 필요한 항목:**

```bash
# 새 서버 IP 주소로 변경
FRONTEND_URL=http://새서버IP:8080

# LDAP 서버 주소 (네트워크 환경에 따라 변경)
LDAP_SERVER=ldap://LDAP서버IP:389

# 필요시 시간대 설정
TZ=Asia/Seoul
```

**변경하지 말아야 할 항목 (중요!):**

```bash
# 데이터베이스 인증 정보 (백업과 일치해야 함)
DB_PASSWORD=inventory_password_2024
DB_USER=inventory_user
DB_NAME=inventory_db

# JWT 시크릿 (기존 토큰 호환성)
JWT_SECRET=inventory-jwt-secret-key-2024
```

### 4단계: 스크립트 실행 권한 설정

```bash
# 실행 권한 부여
chmod +x *.sh
chmod +x scripts/*.sh
```

---

## 복원 단계

### 1단계: 데이터베이스 컨테이너 시작

```bash
cd ~/itNswinventory

# 데이터베이스 컨테이너만 시작
docker compose up -d it-inventory-db

# 컨테이너 상태 확인
docker compose ps
```

### 2단계: 데이터베이스 준비 대기

데이터베이스가 완전히 초기화될 때까지 기다립니다:

```bash
# 30초 대기
sleep 30

# 데이터베이스 준비 상태 확인
docker exec it-inventory-db pg_isready -U inventory_user

# 출력: /var/run/postgresql:5432 - accepting connections
```

### 3단계: 데이터베이스 복원

#### 방법 1을 사용한 경우

```bash
# 백업 디렉토리에서 데이터베이스 복원
./scripts/restore-db.sh ~/it-inventory/it-inventory-full-backup_YYYYMMDD_HHMMSS/database_backup.sql
```

#### 방법 2를 사용한 경우

```bash
# 백업 파일 압축 해제 (필요시)
gunzip ~/inventory_backup_YYYYMMDD_HHMMSS.sql.gz

# 데이터베이스 복원
./scripts/restore-db.sh ~/inventory_backup_YYYYMMDD_HHMMSS.sql
```

**복원 스크립트가 수행하는 작업:**
1. 백업 파일 검증
2. 현재 데이터베이스 통계 표시
3. 확인 프롬프트 (yes 입력)
4. 데이터 복원
5. 복원 후 통계 표시
6. 데이터 무결성 검사

### 4단계: 전체 서비스 시작

```bash
# 모든 서비스 시작
./start.sh

# 서비스 시작 확인
docker compose ps
```

**정상 출력 예:**
```
NAME                      STATUS
it-inventory-api          Up (healthy)
it-inventory-db           Up (healthy)
it-inventory-pgadmin      Up
it-inventory-web          Up
```

---

## 검증 및 테스트

### 1단계: 컨테이너 상태 확인

```bash
# 모든 컨테이너가 실행 중인지 확인
docker compose ps

# 로그 확인
docker compose logs -f --tail=50
```

### 2단계: 네트워크 연결 확인

```bash
# 웹 서버 응답 확인
curl -I http://localhost:8080

# API 서버 헬스 체크
curl http://localhost:3001/api/health
```

예상 출력:
```json
{"status":"ok","timestamp":"2025-01-19T..."}
```

### 3단계: 데이터 검증

```bash
# 데이터베이스 접속하여 데이터 확인
docker exec -it it-inventory-db psql -U inventory_user -d inventory_db

# SQL 쿼리 실행
SELECT
    'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'hardware', COUNT(*) FROM hardware
UNION ALL
SELECT 'software', COUNT(*) FROM software
UNION ALL
SELECT 'assignments', COUNT(*) FROM assignments;

# 종료
\q
```

**백업 시 기록한 통계와 비교하세요!**

### 4단계: 웹 브라우저 테스트

1. 웹 브라우저 열기
2. 주소 입력: `http://새서버IP:8080`
3. 로그인 페이지 확인

#### 관리자 계정으로 로그인

- **아이디**: admin
- **비밀번호**: admin123

#### 데이터 확인 항목

- [ ] 임직원 탭: 모든 직원 데이터 표시 확인
- [ ] 하드웨어 탭: 자산 데이터 표시 확인
- [ ] 소프트웨어 탭: 라이선스 데이터 표시 확인
- [ ] 할당 현황: 할당 이력 확인

#### 기능 테스트

- [ ] 새 임직원 추가
- [ ] 새 하드웨어 자산 추가
- [ ] 자산 할당
- [ ] 데이터 수정
- [ ] 엑셀 내보내기
- [ ] 데이터 삭제 (신중하게!)

### 5단계: LDAP 연동 테스트 (LDAP 사용 시)

```bash
# LDAP 연결 로그 확인
docker compose logs it-inventory-api | grep LDAP
```

웹 인터페이스에서 LDAP 계정으로 로그인 시도:

- [ ] LDAP 사용자로 로그인 성공
- [ ] 올바른 역할 할당 확인 (Admin/Manager/User)

### 6단계: 모니터링 설정

```bash
# 모니터링 스크립트 실행
./scripts/monitor.sh

# 자동 치유 모드로 5분마다 실행 (선택사항)
(crontab -l 2>/dev/null; echo "*/5 * * * * cd ~/itNswinventory && ./scripts/monitor.sh --auto-heal >> /var/log/it-inventory-monitor.log 2>&1") | crontab -
```

---

## 문제 해결

### 문제 1: 데이터베이스 컨테이너가 시작되지 않음

**증상:**
```bash
docker compose ps
# it-inventory-db  Exit 1
```

**해결 방법:**

```bash
# 로그 확인
docker compose logs it-inventory-db

# 볼륨 삭제 후 재시작
docker compose down -v
docker compose up -d it-inventory-db
```

### 문제 2: 데이터베이스 복원 실패

**증상:**
```
ERROR: relation "users" already exists
```

**해결 방법:**

```bash
# 기존 데이터베이스 완전 삭제 후 재생성
docker compose down -v
docker compose up -d it-inventory-db
sleep 30

# 다시 복원
./scripts/restore-db.sh <백업파일>
```

### 문제 3: 웹 페이지가 표시되지 않음

**증상:**
브라우저에서 `http://새서버IP:8080`에 접속할 수 없음

**해결 방법:**

```bash
# 1. 컨테이너 상태 확인
docker compose ps

# 2. 방화벽 확인
sudo ufw status
sudo ufw allow 8080/tcp

# 3. nginx 로그 확인
docker compose logs it-inventory-web
```

### 문제 4: API 연결 오류

**증상:**
웹 페이지는 열리지만 데이터가 로드되지 않음

**해결 방법:**

```bash
# 1. API 서버 로그 확인
docker compose logs it-inventory-api

# 2. API 서버 직접 테스트
curl http://localhost:3001/api/health

# 3. 데이터베이스 연결 확인
docker exec it-inventory-db pg_isready -U inventory_user
```

### 문제 5: LDAP 연동 실패

**증상:**
LDAP 계정으로 로그인할 수 없음

**해결 방법:**

```bash
# 1. LDAP 설정 확인
cat backend/.env | grep LDAP

# 2. LDAP 서버 연결 테스트
docker exec it-inventory-api nc -zv LDAP서버IP 389

# 3. LDAP 로그 확인
docker compose logs it-inventory-api | grep LDAP

# 4. host 네트워크 모드 확인
docker inspect it-inventory-api | grep NetworkMode
# 출력: "NetworkMode": "host"
```

### 문제 6: 권한 오류

**증상:**
```
permission denied: ./scripts/backup-db.sh
```

**해결 방법:**

```bash
# 실행 권한 부여
chmod +x scripts/*.sh
chmod +x *.sh
```

---

## 롤백 절차

마이그레이션 중 문제가 발생하면 다음 절차로 롤백할 수 있습니다:

### 시나리오 1: 새 서버에서 문제 발생, 기존 서버 정상

**조치:**
1. 새 서버 서비스 중지:
   ```bash
   docker compose down -v
   ```

2. 기존 서버 계속 사용 (다운타임 없음)

3. 문제 분석 및 해결 후 재시도

### 시나리오 2: 새 서버 복원 완료 후 데이터 문제 발견

**조치:**
1. 새 서버 서비스 중지:
   ```bash
   docker compose down -v
   ```

2. 백업 파일 재확인

3. 데이터베이스 재복원:
   ```bash
   docker compose up -d it-inventory-db
   sleep 30
   ./scripts/restore-db.sh <백업파일>
   ./start.sh
   ```

### 시나리오 3: DNS 전환 후 문제 발생

**조치:**
1. DNS를 기존 서버 IP로 다시 변경

2. DNS 전파 대기 (5-30분)

3. 기존 서버 정상 동작 확인

4. 새 서버 문제 해결 후 재시도

---

## 마이그레이션 체크리스트

### 사전 준비 단계

- [ ] 기존 서버 접근 권한 확인
- [ ] 새 서버 Docker 설치 완료
- [ ] 새 서버 Docker Compose 설치 완료
- [ ] 디스크 공간 확인 (양쪽 서버)
- [ ] 네트워크 정보 수집 (IP, LDAP 등)
- [ ] 백업 시간 계획 (사용자에게 공지)

### 백업 단계

- [ ] 백업 스크립트 실행
- [ ] 백업 파일 생성 확인
- [ ] 백업 파일 크기 확인 (너무 작지 않은지)
- [ ] 백업 정보 파일 확인
- [ ] 데이터베이스 통계 기록
- [ ] 백업 파일 압축 (선택)

### 전송 단계

- [ ] 백업 파일 전송 완료
- [ ] 전송된 파일 무결성 확인 (파일 크기 비교)
- [ ] 압축 해제 (필요시)

### 복원 단계

- [ ] 프로젝트 파일 배치
- [ ] 환경 설정 파일 수정
- [ ] 실행 권한 설정
- [ ] 데이터베이스 컨테이너 시작
- [ ] 데이터베이스 준비 확인
- [ ] 데이터베이스 복원 실행
- [ ] 전체 서비스 시작

### 검증 단계

- [ ] 모든 컨테이너 실행 확인
- [ ] 컨테이너 헬스 체크 확인
- [ ] 네트워크 연결 확인
- [ ] 데이터베이스 통계 비교
- [ ] 웹 페이지 접속 확인
- [ ] 관리자 로그인 확인
- [ ] 데이터 표시 확인
- [ ] LDAP 연동 확인 (사용 시)
- [ ] 기본 기능 테스트

### 마무리 단계

- [ ] 모니터링 설정
- [ ] 로그 로테이션 설정 (선택)
- [ ] 백업 스케줄 설정 (선택)
- [ ] 사용자에게 이전 완료 공지
- [ ] 기존 서버 종료 계획 수립
- [ ] 문서 업데이트 (새 서버 IP 등)

---

## 추가 참고 자료

- [README.md](README.md) - 기본 설치 및 사용 가이드
- [DATA_RECOVERY_GUIDE.md](DATA_RECOVERY_GUIDE.md) - 데이터 복구 절차
- [LDAP_SETUP.md](LDAP_SETUP.md) - LDAP 설정 상세 가이드
- [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md) - 시스템 업그레이드 가이드

---

## 지원

마이그레이션 중 문제가 발생하면:

1. 로그 확인: `docker compose logs -f`
2. 컨테이너 상태 확인: `docker compose ps`
3. 모니터링 스크립트 실행: `./scripts/monitor.sh`
4. 문제 해결 섹션 참조

---

**마지막 업데이트**: 2025-01-19
**문서 버전**: 1.0
