# Getting Started

프로젝트 시작 가이드입니다. 이 문서는 프로젝트를 처음 접하는 사용자를 위해 작성되었습니다.

## 목차

- [개요](#개요)
- [사전 요구사항](#사전-요구사항)
- [설치](#설치)
- [첫 번째 실행](#첫-번째-실행)
- [다음 단계](#다음-단계)

## 개요

이 프로젝트는 AIOSS 실습 과제를 위한 프로젝트입니다. 스프린트 메트릭스 대시보드 및 모니터링 도구를 포함합니다.

## 사전 요구사항

- Node.js (v14 이상)
- Docker & Docker Compose
- Git
- PowerShell (Windows의 경우)

## 설치

### 1. 저장소 복제

```bash
git clone <repository-url>
cd AIOSS_VSCODE
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Docker 컨테이너 시작

```bash
docker-compose up -d
```

### 4. 환경 설정

필요한 환경 변수를 설정합니다.

```bash
cp .env.example .env
```

## 첫 번째 실행

프로젝트를 처음 실행하려면:

```bash
npm run start
```

또는 개발 모드에서 실행:

```bash
npm run dev
```

대시보드는 `http://localhost:3000`에서 접근할 수 있습니다.

## 다음 단계

- [Development Guide](Development_Guide.md) - 개발 방법을 자세히 알아봅시다.
- [Troubleshooting](Troubleshooting.md) - 문제가 발생하면 여기서 해결책을 찾아봅시다.

---

**마지막 업데이트**: 2026년 4월 28일
