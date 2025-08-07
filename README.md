# IT 자산 및 SW 인벤토리 관리시스템

## 📋 개요
회사 내 임직원의 IT 자산 및 소프트웨어 인벤토리를 관리하는 웹기반 시스템입니다.

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
├── Dockerfile              # Docker 이미지 빌드 설정
├── docker-compose.yml      # Docker Compose 설정
├── nginx.conf              # Nginx 웹서버 설정
├── index.html              # 메인 HTML 파일
├── styles.css              # CSS 스타일시트
├── script.js               # JavaScript 로직
├── start.sh                # 서비스 시작 스크립트
├── stop.sh                 # 서비스 중지 스크립트
├── logs/                   # Nginx 로그 디렉토리 (자동 생성)
└── README.md               # 이 파일
```

## 🔧 주요 기능
- **임직원 관리**: 사번, 이름, 부서, 직급 등 정보 관리
- **하드웨어 자산 관리**: PC, 노트북, 모니터 등 IT 자산 추적
- **소프트웨어 인벤토리**: 라이선스 및 설치 현황 관리
- **자산 할당 관리**: 임직원별 자산 할당/반납 이력
- **엑셀 내보내기**: 각 항목별 데이터 엑셀 파일로 내보내기

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