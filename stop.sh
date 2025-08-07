#!/bin/bash

# IT 자산 인벤토리 Docker 서비스 중지 스크립트

echo "🛑 IT 자산 인벤토리 관리 시스템 중지 중..."

# Docker Compose로 서비스 중지
docker-compose down

if [ $? -eq 0 ]; then
    echo "✅ 서비스가 성공적으로 중지되었습니다."

    # 사용하지 않는 이미지 정리 (선택사항)
    read -p "🧹 사용하지 않는 Docker 이미지를 정리하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker system prune -f
        echo "✨ Docker 이미지 정리가 완료되었습니다."
    fi
else
    echo "❌ 서비스 중지에 실패했습니다."
    exit 1
fi
