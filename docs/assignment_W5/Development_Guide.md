# Development Guide

프로젝트 개발을 위한 상세한 가이드입니다.

## 목차

- [개발 환경 설정](#개발-환경-설정)
- [프로젝트 구조](#프로젝트-구조)
- [코드 작성 규칙](#코드-작성-규칙)
- [테스트](#테스트)
- [배포](#배포)
- [유용한 명령어](#유용한-명령어)

## 개발 환경 설정

### Node.js 설정

프로젝트는 Node.js v14 이상을 지원합니다. nvm을 사용하여 버전을 관리하는 것을 권장합니다.

```bash
nvm use
npm install
```

### IDE 설정

VS Code를 사용하는 경우 다음 확장 프로그램을 설치하세요:

- ESLint
- Prettier
- Docker

## 프로젝트 구조

```
AIOSS_VSCODE/
├── dashboard/          # 대시보드 UI
├── docs/              # 문서
├── grafana/           # Grafana 설정
├── prometheus/        # Prometheus 설정
├── scripts/           # 유틸리티 스크립트
├── tests/             # 테스트 파일
└── package.json       # 프로젝트 메타데이터
```

## 코드 작성 규칙

### JavaScript/Node.js

- ESLint 규칙을 따르세요
- 모든 함수에 JSDoc 주석을 작성하세요
- 화살표 함수 보다는 정규 함수를 선호합니다

```javascript
/**
 * 사용자 정보를 조회합니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 사용자 정보
 */
async function getUser(userId) {
  // 구현...
}
```

### 마크다운

- 제목은 h1(#)부터 시작하세요
- 코드 블록에는 언어를 명시하세요
- 내부 링크를 적극 활용하세요

## 테스트

### 단위 테스트 실행

```bash
npm run test
```

### 커버리지 확인

```bash
npm run test:coverage
```

### E2E 테스트

```bash
npm run test:e2e
```

테스트 작성 가이드:
- 각 함수당 최소 3개의 테스트 케이스를 작성하세요
- 긍정 사례, 부정 사례, 엣지 케이스를 포함하세요

## 배포

### 준비 환경 배포

```bash
npm run deploy:staging
```

### 프로덕션 배포

```bash
npm run deploy:production
```

배포 전 체크리스트:
- [ ] 모든 테스트가 통과했는가?
- [ ] 코드 리뷰가 완료되었는가?
- [ ] 버전 번호가 업데이트되었는가?

## 유용한 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 모드 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | 코드 스타일 검사 |
| `npm run format` | 코드 자동 포맷팅 |
| `docker-compose up` | 전체 스택 시작 |

---

## 관련 문서

- [Getting Started](Getting_Started.md) - 프로젝트 시작 가이드
- [Troubleshooting](Troubleshooting.md) - 일반적인 문제 및 해결 방법

**마지막 업데이트**: 2026년 4월 28일
