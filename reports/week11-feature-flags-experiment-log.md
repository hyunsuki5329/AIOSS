# 11주차 실험 로그

## 실험 개요

- 실험 대상: DORA 대시보드
- 플래그 수: 3개
- A/B 실험 수: 1개
- 일관된 배정 방식: 사용자 ID 해시 기반 고정 배정

## 롤아웃 설정

- [dashboard/rollout-settings.json](../dashboard/rollout-settings.json)

## Feature Flag 코드

- [dashboard/feature-flags.js](../dashboard/feature-flags.js)
- [dashboard/index.html](../dashboard/index.html)

## 실험 로그 예시

| timestamp | event | detail |
|---|---|---|
| 2026-05-25T05:00:00Z | flag_bootstrap | userId, audience, flags, variant |
| 2026-05-25T05:00:01Z | dashboard_rendered | variant=control, flags=metricsV2/enhancedCharts/experimentalUI |
| 2026-05-25T05:00:02Z | variant_assigned | dashboardLayout=compact |

## 저장 방식

- 브라우저 `localStorage`에 이벤트 로그를 저장합니다.
- 최근 40개 이벤트를 유지합니다.
- 대시보드 오른쪽 패널에서 최근 이벤트를 확인할 수 있습니다.

## 확인 포인트

- `metricsV2`가 켜지면 요약 점수가 추가됩니다.
- `enhancedCharts`가 켜지면 차트 색상과 축 방향이 바뀝니다.
- `experimentalUI`가 켜지면 실험 배너가 표시됩니다.
- `dashboardLayout` 실험은 `control`과 `compact` 두 변형 중 하나로 일관되게 배정됩니다.
