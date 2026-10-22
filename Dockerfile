# Stage 1: Build React frontend
FROM node:20-alpine AS build

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

LABEL maintainer="IT Team"
LABEL description="IT Asset and Software Inventory Management System"
LABEL version="2.0"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy static assets that are not part of the React app
COPY favicon.ico /usr/share/nginx/html/
COPY SMART_Check_Plus_User_Manual_V2.0.pdf /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
