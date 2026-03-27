# 과제 4: 복합 워크플로우

## PRACTICE

## MISSION 04
### Complex Workflow

실제 배포 환경과 유사한 파이프라인을 구축합니다.
Job 간의 의존성을 설정하여 순차적으로 실행되게 하고,
조건에 따라 배포가 결정되는 로직을 구현해봅니다.


## 수행 단계

### 1) 3단계 파이프라인 구성
워크플로우 내에 build, test, deploy 라는 3개의 별도 Job을 정의합니다.

### 2) Job 의존성 설정
needs 키워드를 사용하여 build가 성공해야 test가 돌고,
test가 성공해야 deploy가 실행되도록 연결합니다.

### 3) 조건부 배포 설정
deploy Job에 if 조건을 추가하여,
main 브랜치일 때만 배포가 실행되도록 제한합니다.

### 4) 아티팩트 전달
빌드 결과물을 upload-artifact로 저장하고,
배포 단계에서 download-artifact로 가져와 사용합니다.

## 제출 템플릿

### A. 파이프라인 설계
- Job 목록:
- 의존성 흐름:
- 배포 조건:
- 전달 아티팩트 이름:

### B. 핵심 워크플로우 스니펫
아래 예시를 참고해 저장소 구조에 맞게 수정하세요.

name: Complex CI/CD

on:
  push:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi
      - name: Build
        run: |
          mkdir -p dist
          echo "build-output" > dist/build.txt
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-dist
          path: dist/

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi
      - name: Test
        run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build-dist
          path: dist/
      - name: Deploy
        run: echo "Deploying from dist..."

### C. 실행 결과 기록
- build 성공 여부:
- test 성공 여부:
- deploy 실행 여부:
- main 외 브랜치에서 deploy 차단 확인:
- 아티팩트 업로드/다운로드 확인:

## 검증 체크리스트
- build, test, deploy 3개 Job이 분리되어 있다
- needs 의존성이 올바르게 설정되어 있다
- deploy Job에 브랜치 조건이 적용되어 있다
- upload-artifact와 download-artifact가 연동되어 있다
- 실행 결과에서 순차 흐름과 조건부 배포가 확인된다

## 에이전트 프롬프트

아래 프롬프트를 에이전트에 그대로 입력해서 과제 4를 수행하세요.

너는 GitHub Actions 기반 복합 워크플로우를 설계하고 구현하는 DevOps 엔지니어다.

[목표]
- build, test, deploy 3단계 파이프라인을 구성한다.
- Job 의존성과 조건부 배포를 정확히 구현한다.
- 빌드 산출물을 아티팩트로 전달한다.

[필수 요구사항]
- 3개 Job: build, test, deploy
- 의존성: test needs build, deploy needs test
- 배포 조건: main 브랜치에서만 deploy 실행
- 아티팩트: build에서 업로드, deploy에서 다운로드

[작업 지시]
1) 기존 .github/workflows/ci.yml이 있으면 확장, 없으면 새로 생성한다.
2) build Job에 의존성 설치, 빌드, upload-artifact를 구현한다.
3) test Job에서 테스트를 수행하고 build 성공 이후만 실행되게 한다.
4) deploy Job은 test 성공 이후 + main 브랜치 조건일 때만 실행되게 한다.
5) 아티팩트 전달이 실제로 동작하도록 경로와 이름을 일치시킨다.

[검증 지시]
- YAML 문법 검증
- Job 실행 순서 검증
- main 브랜치 조건 검증
- 아티팩트 업로드/다운로드 성공 검증

[출력 형식]
- 수정 파일 목록
- 최종 워크플로우 YAML 전체
- Job 의존성 다이어그램(텍스트)
- 검증 체크리스트 O/X

## 실행용 에이전트 프롬프트 (복사용)

```text
너는 이 저장소의 GitHub Actions 파이프라인을 고도화하는 DevOps 엔지니어다.

[미션]
과제 4(복합 워크플로우)를 실제 코드로 해결하라.

[반드시 할 일]
1) .github/workflows/ci.yml을 build, test, deploy 3개 Job 구조로 확장한다.
2) 의존성은 test needs build, deploy needs test로 설정한다.
3) deploy는 if: github.ref == 'refs/heads/main' 조건에서만 실행되게 한다.
4) build 산출물을 upload-artifact로 올리고, deploy에서 download-artifact로 받아 사용한다.
5) 기존 테스트 흐름이 깨지지 않게 lint/test 동작을 유지한다.

[구현 가이드]
- build: 의존성 설치 + 빌드 산출물 생성 + 아티팩트 업로드
- test: 테스트 실행
- deploy: 아티팩트 다운로드 후 배포 스텁 실행
- 필요 시 fail-fast와 실행 환경(runs-on)을 명확히 정의

[검증]
- YAML 문법 검증
- Job 실행 순서 검증(build -> test -> deploy)
- main 외 브랜치에서 deploy 차단 검증
- 아티팩트 업로드/다운로드 성공 검증

[결과 보고 형식]
- 변경 파일 목록
- 최종 ci.yml 전체
- Job 의존성 텍스트 다이어그램
- 체크리스트 O/X
```
