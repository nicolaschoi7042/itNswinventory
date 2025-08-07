# Nginx 베이스 이미지 사용
FROM nginx:alpine

# 메타데이터 설정
LABEL maintainer="IT Team"
LABEL description="IT Asset and Software Inventory Management System"
LABEL version="1.0"

# 기본 nginx 설정 파일 제거
RUN rm /etc/nginx/conf.d/default.conf

# 커스텀 nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/

# 웹 애플리케이션 파일들을 컨테이너로 복사
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY SMART_Check_Plus_User_Manual_V2.0.pdf /usr/share/nginx/html/

# 포트 80 노출
EXPOSE 80

# Nginx 시작 명령
CMD ["nginx", "-g", "daemon off;"]
