# 12주차 산출물 보고서

## 완료 범위

- 단위 테스트를 확장해 DORA 핵심 기능 5개를 검증했습니다.
- 커버리지 기준 80% 이상을 CI에서 자동 게이트로 실행하도록 구성했습니다.
- TDD(Red-Green-Refactor) 사이클을 기능 단위로 기록했습니다.

## 핵심 기능 5개

- `calculateLeadTimeHours`
- `calculateDeploymentFrequency`
- `calculateChangeFailureRate`
- `calculateMttrHours`
- `buildDoraSnapshot`

관련 코드:

- [src/dora-core.js](../src/dora-core.js)
- [tests/dora-core.test.js](../tests/dora-core.test.js)

## CI 자동화

- 테스트: 기존 `npm test`
- 커버리지 게이트: `npm run test:coverage`
- 기준: line/function/branch 각각 80 이상

관련 파일:

- [package.json](../package.json)
- [.github/workflows/ci.yml](../.github/workflows/ci.yml)

## TDD 진행 로그 (Red-Green-Refactor)

1. Lead Time 계산
- Red: 역순 타임라인에서 예외 케이스 테스트 추가
- Green: 날짜 파싱 및 시간 차 계산 구현
- Refactor: 공통 `toTimestamp` 유틸로 중복 제거

2. Deployment Frequency 계산
- Red: `windowDays <= 0` 실패 테스트 추가
- Green: `deployments.length / windowDays` 구현
- Refactor: 입력 검증 메시지 일원화

3. Change Failure Rate 계산
- Red: 실패 배포 수가 전체 배포 수보다 큰 케이스 테스트 추가
- Green: 비율 계산 및 0 분모 처리 구현
- Refactor: 정수/범위 검증 로직 정리

4. MTTR 계산
- Red: 복구 시각이 시작 시각보다 빠른 예외 테스트 추가
- Green: 시간 차 계산 구현
- Refactor: `toTimestamp` 재사용으로 코드 단순화

5. Snapshot 조립 기능
- Red: KPI 누락/오조합 테스트 추가
- Green: 4개 KPI를 묶는 `buildDoraSnapshot` 구현
- Refactor: 구조 분해 할당으로 입력 처리 가독성 개선
