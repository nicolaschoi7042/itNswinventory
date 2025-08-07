#!/bin/bash

# IT 자산 인벤토리 Docker 서비스 시작 스크립트

echo "🚀 IT 자산 인벤토리 관리 시스템 시작..."

# Docker가 설치되어 있는지 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "Docker 설치 후 다시 시도해주세요."
    exit 1
fi

# Docker Compose가 설치되어 있는지 확인
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    echo "Docker Compose 설치 후 다시 시도해주세요."
    exit 1
fi

# 로그 디렉토리 생성
mkdir -p logs

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너 중지 중..."
docker-compose down

# 새로운 이미지 빌드 및 컨테이너 시작
echo "🔨 Docker 이미지 빌드 중..."
docker-compose build --no-cache

echo "▶️ 컨테이너 시작 중..."
docker-compose up -d

# 서비스 상태 확인
if [ $? -eq 0 ]; then
    echo "✅ IT 자산 인벤토리 시스템이 성공적으로 시작되었습니다!"
    echo ""
    echo "📋 접속 정보:"
    echo "   URL: http://localhost:8080"
    echo "   내부망에서 접속: http://$(hostname -I | awk '{print $1}'):8080"
    echo ""
    echo "🔧 관리 명령어:"
    echo "   서비스 중지: ./stop.sh 또는 docker-compose down"
    echo "   로그 확인: docker-compose logs -f"
    echo "   상태 확인: docker-compose ps"
    echo ""
else
    echo "❌ 서비스 시작에 실패했습니다."
    echo "로그를 확인해주세요: docker-compose logs"
    exit 1
fi