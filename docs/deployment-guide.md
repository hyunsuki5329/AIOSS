# 배포 가이드

## 1. GitHub Pages 자동 배포

이 저장소는 `dashboard/` 디렉터리를 GitHub Pages로 배포합니다.

- `main` 브랜치에 반영되면 루트 사이트가 자동 갱신됩니다.
- Pull Request가 열리면 `preview/pr-<번호>/` 경로에 미리보기가 게시됩니다.
- 미리보기 URL은 PR 댓글로 자동 남깁니다.

배포 워크플로우:

- [.github/workflows/pages-deploy.yml](../.github/workflows/pages-deploy.yml)

## 2. Docker 기반 배포 전략

대시보드는 정적 사이트이므로, Docker 이미지를 통해 별도의 외부 플랫폼으로도 배포할 수 있습니다.

- [Dockerfile.web](../Dockerfile.web)은 `dashboard/` 파일을 Nginx로 서빙합니다.
- [fly.toml](../fly.toml)은 Fly.io 배포 설정을 담고 있습니다.
- [Dockerfile](../Dockerfile)과 [Dockerfile.web](../Dockerfile.web)을 분리해 테스트용 이미지와 서비스용 이미지를 구분합니다.

권장 파이프라인:

1. `dashboard/` 변경 발생
2. Docker 서비스 이미지 빌드
3. Fly.io 또는 유사 외부 클라우드에 배포
4. HTTP 헬스체크로 응답 확인

관련 워크플로우:

- [.github/workflows/fly-deploy.yml](../.github/workflows/fly-deploy.yml)
- [.github/workflows/docker-build.yml](../.github/workflows/docker-build.yml)

## 3. 헬스체크와 모니터링

로컬 및 원격 배포의 상태 확인은 다음으로 자동화합니다.

- GitHub Pages 응답 확인: 루트 페이지와 `sample-dora-metrics.json`
- Fly.io 응답 확인: 서비스 루트 경로
- 로컬 Docker Compose 헬스체크: Prometheus `/-/ready`, Grafana `/api/health`

관련 파일:

- [.github/workflows/health-check.yml](../.github/workflows/health-check.yml)
- [docker-compose.yml](../docker-compose.yml)

## 4. 필요한 환경 변수

외부 클라우드 배포를 실제로 사용하려면 다음 값이 필요합니다.

- `FLY_API_TOKEN`

GitHub Pages 배포는 기본적으로 `GITHUB_TOKEN`만 사용합니다.
