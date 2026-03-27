# 과제 3: Secrets 활용

## PRACTICE

## MISSION 03
### Secure Your Secrets

API 키나 비밀번호 같은 민감한 정보를 안전하게 관리하는 방법을 익힙니다.
코드로 노출하지 않고 환경 변수로 주입하는 실습입니다.


## 수행 단계

### 1) GitHub Secrets 설정
저장소의 Settings > Secrets and variables > Actions 메뉴로 이동하여
API_KEY 와 같은 이름으로 새 Secret을 등록합니다.

### 2) 워크플로우에서 호출
YAML 파일 내에서 ${{ secrets.API_KEY }} 형태 문법을 사용해
등록한 Secret 값을 불러오도록 작성합니다.

### 3) 환경 변수 매핑
env 키워드를 사용하여 Secret 값을 환경 변수로 매핑하거나,
Step의 입력값(with)으로 전달합니다.

### 4) 보안 확인
실행 로그에서 Secret 값이 직접 노출되지 않고
*** 형태로 마스킹되어 처리되는지 확인합니다.

## 제출 템플릿

### A. 등록한 Secret 정보
- Secret 이름:
- 사용 목적:
- 적용한 워크플로우 파일:

### B. 핵심 워크플로우 스니펫
아래 예시를 참고해 본인 저장소에 맞게 작성하세요.

name: Secret Check

on:
  workflow_dispatch:
  push:

jobs:
  secret-demo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use secret as environment variable
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          if [ -z "$API_KEY" ]; then
            echo "API_KEY is not set"
            exit 1
          fi
          echo "Secret loaded successfully"

### C. 실행 결과 기록
- 실행 시점:
- 성공 여부:
- 로그 마스킹 확인 여부:
- 문제 발생 시 원인 및 수정 내용:

## 검증 체크리스트
- Secrets 메뉴에 API_KEY 등 민감 정보가 등록되어 있다
- 워크플로우에서 secrets 컨텍스트를 통해 값을 참조한다
- env 또는 with를 통해 필요한 Step에만 최소 범위로 전달한다
- 로그에 원문 Secret이 노출되지 않는다
- 실행 결과를 문서로 기록했다

## 에이전트 프롬프트

아래 프롬프트를 에이전트에 그대로 입력해서 과제 3을 수행하세요.

너는 GitHub Actions 보안 설정 실습을 돕는 자동화 엔지니어다.

[목표]
- 민감 정보(API_KEY)를 코드에 하드코딩하지 않고 GitHub Secrets로 관리한다.
- 워크플로우에서 Secret을 안전하게 주입하고 마스킹을 확인한다.

[작업 지시]
1) 기존 워크플로우를 확인하고 Secret 데모용 Job 또는 Step을 추가한다.
2) secrets.API_KEY 를 env로 매핑해 사용한다.
3) 값 존재 여부만 검사하고 실제 값을 출력하지 않는다.
4) 실패 시 원인을 이해하기 쉬운 메시지로 남긴다.
5) 최소 권한과 최소 노출 원칙을 지킨다.

[검증 지시]
- YAML 문법 점검
- Secret 누락 시 실패 동작 확인
- 로그에 민감 값 평문 노출 여부 확인

[출력 형식]
- 수정 파일 목록
- 최종 워크플로우 내용
- Secret 설정 위치 안내
- 보안 체크리스트 O/X

## 실행용 에이전트 프롬프트 (복사용)

```text
너는 이 저장소의 GitHub Actions를 수정하는 DevSecOps 엔지니어다.

[미션]
과제 3(Secrets 활용)을 실제 코드로 해결하라.

[반드시 할 일]
1) .github/workflows/ci.yml에 secret-check Job(또는 동등한 Step)을 추가한다.
2) API_KEY는 반드시 ${{ secrets.API_KEY }}로만 참조한다.
3) Secret 값은 절대 출력하지 말고, 존재 여부만 검사한다.
4) Secret 미설정 시 명확한 에러 메시지와 함께 실패하도록 만든다.
5) 기존 CI 흐름(lint/test 및 matrix 동작)을 깨지 않도록 한다.

[구현 가이드]
- env로 API_KEY를 매핑한다.
- run 스크립트에서 길이/빈값 검사만 수행한다.
- 로그에는 "Secret loaded" 같은 상태 메시지만 출력한다.

[검증]
- YAML 문법 오류가 없어야 한다.
- 기존 lint/test가 통과해야 한다.
- Secret 미설정 시 실패 동작이 확인되어야 한다.

[결과 보고 형식]
- 변경 파일 목록
- 최종 ci.yml 전체
- Secret 설정 경로 안내: Settings > Secrets and variables > Actions
- 체크리스트 O/X
```
