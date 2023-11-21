# build stage
FROM node:18.16.0-slim AS build

# 디렉토리 설정
WORKDIR /applications/portpolio

# package.json 복사
COPY ./package.json .

# 환경변수
# ARG ACTIVE_PROFILE
# ENV NODE_ENVIRONMENT=${ACTIVE_PROFILE}

# 필요한 패키지 설치
# RUN npm install --production --legacy-peer-deps
RUN npm install --legacy-peer-deps

# 전체 복사
COPY . .


# image create stage
FROM keymetrics/pm2:18-alpine AS image

# 디렉토리 설정
WORKDIR /applications/portpolio

# build stage에 필요 데이터 복사
COPY --from=build /applications/portpolio .

# 실행 ( pm2 )
CMD ["pm2-runtime", "start", "ecosystem.config.jsonc"]