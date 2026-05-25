# 11주차 산출물 보고서

## 완료 범위

- 최소 3개의 Feature Flag를 대시보드에 도입했습니다.
- 사용자 해시 기반으로 일관되게 A/B variant를 배정했습니다.
- 로컬 저장소 기반 이벤트 추적 로직을 추가했습니다.
- 플래그 상태, 사용자 세그먼트, 실험 variant를 대시보드에서 바로 확인할 수 있게 했습니다.
- 실험 로그와 롤아웃 설정 문서를 추가했습니다.

## 주요 파일

- [dashboard/feature-flags.js](../dashboard/feature-flags.js)
- [dashboard/index.html](../dashboard/index.html)
- [dashboard/rollout-settings.json](../dashboard/rollout-settings.json)
- [reports/week11-feature-flags-experiment-log.md](../reports/week11-feature-flags-experiment-log.md)

## 검증 결과

- 플래그는 `metricsV2`, `enhancedCharts`, `experimentalUI` 3종을 적용했습니다.
- 실험 variant는 `control`과 `compact` 2개입니다.
- 이벤트 로그는 `flag_bootstrap`, `dashboard_rendered`, `overrides_saved`, `overrides_cleared` 등으로 기록됩니다.

## 제출용 링크

- 플래그 코드: [dashboard/feature-flags.js](../dashboard/feature-flags.js)
- 실험 로그: [reports/week11-feature-flags-experiment-log.md](../reports/week11-feature-flags-experiment-log.md)
- 롤아웃 설정: [dashboard/rollout-settings.json](../dashboard/rollout-settings.json)
