# 9주차 산출물 보고서

## 완료 범위

- GitHub Packages 배포를 위한 npm 패키지 메타데이터를 설정했습니다.
- 버전을 1.0.0에서 1.0.1로 올렸습니다.
- GHCR용 Docker 이미지 빌드/푸시 워크플로우를 추가했습니다.
- npm과 GitHub Actions 업데이트를 위한 Dependabot 정책을 추가했습니다.
- 주간 npm audit 워크플로우를 추가해 이슈 생성/갱신과 아티팩트 업로드를 자동화했습니다.
- 안전한 의존성 업데이트를 위한 Dependabot 자동 머지 워크플로우를 추가했습니다.

## 주요 파일

- [package.json](../package.json)
- [package-lock.json](../package-lock.json)
- [.github/dependabot.yml](../.github/dependabot.yml)
- [.github/workflows/publish-npm.yml](../.github/workflows/publish-npm.yml)
- [.github/workflows/docker-build.yml](../.github/workflows/docker-build.yml)
- [.github/workflows/security-audit.yml](../.github/workflows/security-audit.yml)
- [.github/workflows/dependabot-automerge.yml](../.github/workflows/dependabot-automerge.yml)

## 검증 결과

- 사용 가능한 `node.exe`로 Node.js 스크립트 구문 검사를 통과했습니다.
- `node --test`를 성공적으로 통과했습니다.
- `git diff --check` 결과 이상이 없었습니다.

## 참고 사항

- 작업 환경에서 로컬 `npm`을 사용할 수 없어 `npm ci`와 `npm publish`는 실행하지 못했습니다.
- 배포 워크플로우는 `https://npm.pkg.github.com`와 `GITHUB_TOKEN`을 사용하도록 설정했습니다.