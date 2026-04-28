# Workflow Optimization Report

리포지토리: https://github.com/hyunsuki5329/AIOSS

이번 작업에서는 GitHub Actions 실행 최적화를 위해 공통 Node 초기화/설치 로직을 composite action으로 분리하고, 검증 워크플로우를 reusable workflow로 재구성했다. 또한 배포는 브랜치 조건과 변경 파일 감지를 함께 사용하도록 분리했다.

## 변경 링크

- CI workflow: https://github.com/hyunsuki5329/AIOSS/blob/main/.github/workflows/ci.yml
- Reusable validation workflow: https://github.com/hyunsuki5329/AIOSS/blob/main/.github/workflows/node-validate.yml
- Composite action: https://github.com/hyunsuki5329/AIOSS/blob/main/.github/actions/node-setup/action.yml
- Optimization report: https://github.com/hyunsuki5329/AIOSS/blob/main/reports/workflow-optimization-report.md

## 캐시 전후 측정값

측정 방식: 임시 디렉토리에서 동일한 npm 설치 절차를 두 번 실행해, 첫 실행을 기준값으로 두고 두 번째 실행을 캐시 적용 후 값으로 기록했다.

| 구분 | 실행 시간 |
| --- | ---: |
| 캐시 전 | 1386 ms |
| 캐시 후 | 1165 ms |
| 절감 시간 | 221 ms |
| 개선률 | 15.95% |

개선률 계산식: $\frac{1386 - 1165}{1386} \times 100 = 15.95\%$

## 최적화 요약

- 공통 Node 설정과 설치를 composite action으로 통합해 build/test 간 중복을 제거했다.
- matrix 테스트는 Ubuntu와 Windows, Node 18/20/22 조합으로 확장했다.
- deploy는 `main` 브랜치 push에서만 실행되며, 변경 파일이 배포 대상일 때만 동작한다.
- pull request에서는 preview deploy만 수행해 불필요한 배포 비용을 줄였다.

## 비교 관점

### 최적화 전

- 각 워크플로우가 Node 설정과 설치를 개별적으로 처리했다.
- 배포 조건이 분리되어 있지 않아 불필요한 실행 위험이 있었다.

### 최적화 후

- reusable workflow와 composite action으로 공통 절차를 재사용한다.
- npm 캐시가 활성화되어 반복 실행 시간이 줄어든다.
- 브랜치/PR 조건과 paths-filter 기반 변경 감지로 선택적 배포가 가능하다.

## 실행 후 확인 포인트

- Actions 탭에서 matrix 하위 작업이 병렬로 생성되는지 확인한다.
- `deploy-preview`는 pull request에서만 실행되는지 확인한다.
- `deploy`는 `main` 브랜치 push이면서 deployable 파일이 변경됐을 때만 실행되는지 확인한다.