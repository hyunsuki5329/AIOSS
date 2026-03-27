# 과제 2: Matrix 빌드

## PRACTICE

## MISSION 02
### Test Across Environments

하나의 설정으로 여러 환경을 동시에 테스트합니다.
Matrix 전략을 사용하여 다양한 Node.js 버전 및 운영체제 호환성을 검증하는
파이프라인을 구축하세요.

## 과제 정보
- 소요 시간: 25 Mins
- 난이도: Medium
- 진행 형태: Individual

## 수행 단계

### 1) Node 버전 매트릭스
테스트할 Node.js 버전을 배열로 정의합니다.
`node-version: [16, 18, 20]`을 사용하여 여러 버전에서 동시에 테스트가 실행되도록 설정합니다.

### 2) OS 매트릭스 확장
실행 환경(Runner)을 Ubuntu, Windows, macOS 등으로 확장합니다.
`os: [ubuntu-latest, windows-latest]`를 추가하여 크로스 플랫폼을 검증하세요.

### 3) 전략(Strategy) 구성
Job 레벨에서 `strategy` 키워드를 사용하여 매트릭스 변수를 정의하고,
`steps`에서 `${{ matrix.node-version }}` 형태로 참조합니다.

### 4) 결과 비교 분석
Actions 탭에서 조합(N x M)만큼 생성된 하위 작업들이 병렬로 실행되는 것을 확인하고,
특정 환경에서의 성공 여부를 비교 분석합니다.

## 제출 템플릿

### A. 사용한 매트릭스 설정
- Node 버전:
- OS 조합:
- 총 조합 수(계산):

### B. 핵심 워크플로우 스니펫
```yaml
name: CI Matrix

on:
  push:

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        node-version: [16, 18, 20]
        os: [ubuntu-latest, windows-latest]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
```

### C. 실행 결과 기록
- 성공한 조합:
- 실패한 조합:
- 실패 원인(있다면):
- 개선/후속 조치:

## 검증 체크리스트
- `strategy.matrix`가 Job에 정의되어 있다
- `node-version`과 `os`가 모두 매트릭스 변수로 설정되어 있다
- `${{ matrix.<변수명> }}` 참조가 올바르게 사용되었다
- Actions 탭에서 다중 조합 작업이 병렬 실행된다
- 환경별 실행 결과를 비교 분석했다

## 에이전트 프롬프트

아래 프롬프트를 에이전트에 그대로 입력해서 과제 2를 수행하세요.

```text
너는 GitHub Actions Matrix 빌드 실습을 진행하는 자동화 엔지니어다.

[목표]
- 단일 워크플로우에서 다중 Node 버전과 다중 OS를 병렬 테스트한다.
- matrix 전략을 정확하게 구성하고 결과 비교가 가능하게 만든다.

[필수 요구사항]
- node-version: [16, 18, 20]
- os: [ubuntu-latest, windows-latest]
- steps에서 matrix 변수 참조: ${{ matrix.node-version }}, ${{ matrix.os }}

[작업 지시]
1) 기존 .github/workflows/ci.yml이 있으면 확장, 없으면 새로 생성한다.
2) jobs.test.strategy.matrix에 node-version, os를 정의한다.
3) runs-on은 ${{ matrix.os }}를 사용한다.
4) actions/setup-node에서 node-version에 ${{ matrix.node-version }}를 연결한다.
5) 설치/테스트 단계는 프로젝트 구조에 맞춰 안전하게 작성한다.
6) 병렬 조합 수 N x M을 계산해 설명한다.

[검증 지시]
- YAML 문법 검증
- 조합 수가 기대값과 일치하는지 검증
- 실패 가능성이 있는 명령(예: npm ci 조건 불충족) 방어 로직 점검

[출력 형식]
- 수정 파일 목록
- 최종 워크플로우 YAML 전체
- 예상 실행 조합 표 (node-version x os)
- 환경별 성공/실패 비교 기록 템플릿

[완료 기준]
- matrix 기반 하위 작업이 다중 생성되는 구성
- 초심자가 복붙 후 즉시 실행 가능한 수준
- 불필요한 변경 없이 CI 파일 중심으로 작업
```
