# 10주차 산출물 보고서

## 완료 범위

- GitHub Pages 자동 배포 워크플로우를 추가했습니다.
- Pull Request 미리보기 경로와 PR 댓글 URL 안내를 구성했습니다.
- Fly.io 기반 컨테이너 배포 설정과 워크플로우를 추가했습니다.
- GitHub Pages, Fly.io, 로컬 Docker Compose를 묶는 헬스체크 워크플로우를 추가했습니다.
- Docker 기반 배포 전략 문서를 추가했습니다.
- 로컬 모니터링 스택의 헬스체크를 Docker Compose 기준으로 명시했습니다.

## 주요 파일

- [Dockerfile.web](../Dockerfile.web)
- [fly.toml](../fly.toml)
- [.github/workflows/pages-deploy.yml](../.github/workflows/pages-deploy.yml)
- [.github/workflows/fly-deploy.yml](../.github/workflows/fly-deploy.yml)
- [.github/workflows/health-check.yml](../.github/workflows/health-check.yml)
- [docs/deployment-guide.md](../docs/deployment-guide.md)
- [docker-compose.yml](../docker-compose.yml)

## 검증 결과

- `git diff --check`로 공백/형식 문제를 확인할 예정입니다.
- GitHub Actions 워크플로우는 실제 배포 실행 전에 문법상 구조를 맞추는 방식으로 작성했습니다.

## 참고 사항

- GitHub Pages와 Fly.io는 저장소 외부 설정이 추가로 필요합니다.
- Fly.io 배포를 실제로 실행하려면 `FLY_API_TOKEN`이 필요합니다.
