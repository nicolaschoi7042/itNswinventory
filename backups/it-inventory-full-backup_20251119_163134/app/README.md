# IT 자산 및 SW 인벤토리 관리시스템 v2.0

## 📋 개요
회사 내 임직원의 IT 자산 및 소프트웨어 인벤토리를 관리하는 웹기반 시스템입니다.

**v2.0 주요 개선사항:**
- ✅ **크로스 브라우저 데이터 공유**: PostgreSQL 데이터베이스 백엔드 도입으로 모든 브라우저에서 동일한 데이터 접근 가능
- ✅ **데이터 영속성**: 브라우저 캐시를 삭제해도 데이터가 보존됨
- ✅ **다중 사용자 지원**: 여러 명이 동시에 시스템 사용 가능
- ✅ **향상된 성능**: REST API 기반 실시간 데이터 동기화
- ❌ **localStorage 제거**: 더 이상 브라우저 로컬 스토리지에 의존하지 않음

## 🚀 Docker 기반 배포

### 전제조건
- Docker 20.10 이상
- Docker Compose 2.0 이상
- 포트 8080이 사용 가능한 상태

### 🔧 설치 및 실행

#### 1. 저장소 클론 또는 파일 복사
```bash
# 모든 파일이 같은 디렉토리에 있는지 확인
ls -la
# 출력: Dockerfile, docker-compose.yml, nginx.conf, index.html, styles.css, script.js
```

#### 2. 스크립트 실행 권한 부여
```bash
chmod +x start.sh stop.sh
```

#### 3. 서비스 시작
```bash
./start.sh
```

또는 직접 Docker Compose 명령어 사용:
```bash
# 이미지 빌드 및 컨테이너 시작
docker-compose up -d --build

# 서비스 상태 확인
docker-compose ps
```

#### 4. 접속 확인
- 로컬에서: http://localhost:8080
- 사내망에서: http://[서버IP]:8080

### 🛑 서비스 중지
```bash
./stop.sh
```

또는:
```bash
docker-compose down
```

## 📁 파일 구조
```
itNswinventory/
├── Dockerfile              # 프론트엔드 Docker 이미지 빌드 설정
├── Dockerfile.backend      # 백엔드 Docker 이미지 빌드 설정
├── docker-compose.yml      # Docker Compose 설정
├── nginx.conf              # Nginx 웹서버 설정
├── index.html              # 메인 HTML 파일
├── styles-ny-business.css  # CSS 스타일시트
├── script.js               # JavaScript 로직
├── start.sh                # 서비스 시작 스크립트
├── stop.sh                 # 서비스 중지 스크립트
├── backend/
│   ├── server.js           # Express API 서버
│   ├── package.json        # Node.js 의존성
│   ├── database.sql        # 데이터베이스 스키마
│   └── .env                # 환경 변수 설정
├── scripts/
│   ├── backup-db.sh        # 데이터베이스 백업 스크립트
│   ├── restore-db.sh       # 데이터베이스 복원 스크립트
│   ├── full-backup.sh      # 전체 시스템 백업 스크립트
│   └── monitor.sh          # 시스템 모니터링 스크립트
├── backups/                # 백업 파일 저장 디렉토리 (자동 생성)
├── logs/                   # Nginx 로그 디렉토리 (자동 생성)
├── README.md               # 이 파일
├── MIGRATION_GUIDE.md      # 서버 이전 가이드
├── DATA_RECOVERY_GUIDE.md  # 데이터 복구 가이드
├── LDAP_SETUP.md           # LDAP 설정 가이드
└── CLAUDE.md               # 프로젝트 개발 가이드
```

## 🔧 주요 기능
- **임직원 관리**: 사번, 이름, 부서, 직급 등 정보 관리
- **하드웨어 자산 관리**: PC, 노트북, 모니터 등 IT 자산 추적
- **소프트웨어 인벤토리**: 라이선스 및 설치 현황 관리
- **자산 할당 관리**: 임직원별 자산 할당/반납 이력
- **엑셀 내보내기**: 각 항목별 데이터 엑셀 파일로 내보내기

## 🏗️ 시스템 아키텍처

### 서비스 구성
- **프론트엔드 (it-inventory)**: Nginx 기반 웹 서버 - 포트 8080
- **백엔드 API (it-inventory-api)**: Node.js + Express REST API - 포트 3000
- **데이터베이스 (it-inventory-db)**: PostgreSQL 15 - 포트 5432
- **데이터베이스 관리도구 (it-inventory-pgadmin)**: pgAdmin 4 - 포트 5050

### 접근 URL
- **웹 애플리케이션**: http://localhost:8080
- **API 문서**: http://localhost:3000/api/health
- **데이터베이스 관리**: http://localhost:5050 (admin@itinventory.com / admin123)

### 데이터베이스
- **사용자**: inventory_user
- **데이터베이스명**: inventory_db
- **기본 관리자 계정**: admin / admin123

## 🛠️ 관리 명령어

### 로그 확인
```bash
# 실시간 로그 보기
docker-compose logs -f

# 특정 서비스 로그만 보기
docker-compose logs -f it-inventory
```

### 컨테이너 상태 확인
```bash
docker-compose ps
```

### 컨테이너 재시작
```bash
docker-compose restart
```

### 이미지 강제 리빌드
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 💾 백업 및 복원

시스템은 자동화된 백업/복원 스크립트를 제공합니다.

### 데이터베이스 백업
```bash
# 데이터베이스만 백업 (빠름)
./scripts/backup-db.sh

# 백업 디렉토리 지정
./scripts/backup-db.sh /path/to/backup/
```

### 전체 시스템 백업
```bash
# 데이터베이스 + 애플리케이션 파일 + 설정 파일 전체 백업 (권장)
./scripts/full-backup.sh

# 백업 디렉토리 지정
./scripts/full-backup.sh /path/to/backup/
```

### 데이터베이스 복원
```bash
# 백업 파일에서 복원
./scripts/restore-db.sh backups/inventory_backup_YYYYMMDD_HHMMSS.sql

# 압축된 백업 파일도 자동 처리
./scripts/restore-db.sh backups/inventory_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 백업 파일 위치
- 기본 백업 디렉토리: `./backups/`
- 백업 파일 형식:
  - 데이터베이스: `inventory_backup_YYYYMMDD_HHMMSS.sql(.gz)`
  - 전체 시스템: `it-inventory-full-backup_YYYYMMDD_HHMMSS.tar.gz`

## 🔄 서버 이전

다른 서버로 시스템을 이전해야 하는 경우 상세한 가이드를 참조하세요:

**[📖 서버 이전 가이드 (MIGRATION_GUIDE.md)](MIGRATION_GUIDE.md)**

마이그레이션 가이드에는 다음 내용이 포함되어 있습니다:
- 단계별 이전 절차
- 백업 및 복원 방법
- 환경 설정 조정 가이드
- 검증 및 테스트 방법
- 문제 해결 팁
- 롤백 절차

## 🔒 보안 설정
- 내부망 전용 서비스 (외부 접근 차단 권장)
- Nginx 보안 헤더 적용
- 정적 파일 캐싱 최적화

## 📊 데이터 저장
현재 버전은 브라우저 로컬 스토리지를 사용합니다.
- 각 사용자별로 독립적인 데이터 저장
- 브라우저 캐시 삭제 시 데이터 손실 가능
- 향후 데이터베이스 연동 업그레이드 예정

## 🚨 문제 해결

### 포트 충돌
```bash
# 다른 포트 사용 (예: 9090)
# docker-compose.yml에서 "8080:80"을 "9090:80"으로 변경
```

### 권한 문제
```bash
# Linux에서 Docker 권한 오류 시
sudo usermod -aG docker $USER
# 로그아웃 후 다시 로그인 필요
```

### 컨테이너 완전 재시작
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📞 지원
- 시스템 관리자: IT팀
- 기술 지원: 개발팀

## 📝 업데이트 내역
- v1.0: 초기 버전 - 기본 CRUD 기능, 엑셀 내보내기
- Docker 지원 추가
