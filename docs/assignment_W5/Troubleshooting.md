# Troubleshooting

일반적인 문제 및 해결 방법을 다룹니다.

## 목차

- [설치 문제](#설치-문제)
- [런타임 문제](#런타임-문제)
- [Docker 문제](#docker-문제)
- [성능 문제](#성능-문제)
- [자주 묻는 질문 (FAQ)](#자주-묻는-질문-faq)

## 설치 문제

### npm install 실패

**증상**: `npm install` 실행 중 오류 발생

**해결방법**:

1. npm 캐시 삭제:
   ```bash
   npm cache clean --force
   ```

2. node_modules 디렉토리 삭제:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Node.js 버전 확인:
   ```bash
   node --version
   npm --version
   ```

### 권한 거부 오류 (Permission Denied)

**증상**: `EACCES: permission denied` 오류

**해결방법** (Linux/Mac):

```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

또는 Node 버전 관리자(nvm) 사용을 권장합니다.

## 런타임 문제

### 포트 이미 사용 중 (Port Already in Use)

**증상**: `Error: listen EADDRINUSE: address already in use :::3000`

**해결방법**:

Windows:
```powershell
# 포트 3000을 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# 프로세스 종료 (PID 대체)
taskkill /PID <PID> /F
```

Linux/Mac:
```bash
lsof -i :3000
kill -9 <PID>
```

### 메모리 부족

**증상**: 애플리케이션이 갑자기 종료됨

**해결방법**:

Node.js 메모리 제한 증가:
```bash
node --max-old-space-size=4096 app.js
```

## Docker 문제

### Docker Compose 시작 실패

**증상**: `docker-compose up` 실패

**해결방법**:

1. Docker 데몬 실행 확인:
   ```bash
   docker ps
   ```

2. Docker Compose 버전 확인:
   ```bash
   docker-compose --version
   ```

3. 기존 컨테이너 정리:
   ```bash
   docker-compose down
   docker system prune
   docker-compose up -d
   ```

### 컨테이너 로그 확인

```bash
# 모든 컨테이너 로그 보기
docker-compose logs -f

# 특정 서비스 로그만 보기
docker-compose logs -f <service-name>
```

## 성능 문제

### 대시보드 로딩이 느림

**원인**:
- 데이터베이스 쿼리 최적화 부족
- 브라우저 캐시 문제
- 네트워크 대역폭 부족

**해결방법**:

1. 브라우저 캐시 삭제:
   - F12 → Application → Clear Site Data

2. 성능 프로파일링:
   ```bash
   npm run profile
   ```

3. 데이터베이스 인덱스 재구성:
   ```bash
   npm run db:reindex
   ```

## 자주 묻는 질문 (FAQ)

### Q1: 프로젝트를 어떻게 시작해야 하나요?

A: [Getting Started](Getting_Started.md) 가이드를 참고하세요.

### Q2: 개발 환경을 어떻게 설정하나요?

A: [Development Guide](Development_Guide.md)의 "개발 환경 설정" 섹션을 참고하세요.

### Q3: 테스트는 어떻게 작성하나요?

A: [Development Guide](Development_Guide.md)의 "테스트" 섹션을 참고하세요.

### Q4: 프로덕션 배포는 어떻게 하나요?

A: [Development Guide](Development_Guide.md)의 "배포" 섹션을 참고하세요.

### Q5: 추가 도움을 어디서 받을 수 있나요?

**연락처**:
- GitHub Issues: https://github.com/hyunsuki5329/AIOSS/issues
- 팀 리더: [팀 리더 이메일]
- Slack: #aioss-help 채널

---

## 문제 보고

버그나 문제를 발견하면 다음 정보와 함께 GitHub Issues에 보고해주세요:

- 운영 체제 (OS)
- Node.js 버전
- 재현 단계 (Steps to reproduce)
- 예상 동작 vs 실제 동작
- 오류 메시지 및 스택 트레이스

**마지막 업데이트**: 2026년 4월 28일

## 관련 문서

- [Getting Started](Getting_Started.md) - 프로젝트 시작 가이드
- [Development Guide](Development_Guide.md) - 개발 방법 상세 가이드
