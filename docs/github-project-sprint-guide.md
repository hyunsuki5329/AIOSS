# GitHub Project 기반 스프린트 운영 가이드

이 문서는 과제 요구사항을 충족하기 위한 산출물과 실행 절차를 설명합니다.

## 1) 포함된 구성

- 칸반 기반 GitHub Project(V2)
  - Status 컬럼: Backlog / To Do / In Progress / Review / Done
- 이슈 템플릿
  - `.github/ISSUE_TEMPLATE/bug_report.yml`
  - `.github/ISSUE_TEMPLATE/feature_request.yml`
- 라벨 체계
  - type/*, status/*, priority/*, size/*, area/*
- 마일스톤 2개
  - Sprint 1 (2026-03-20 ~ 2026-04-02)
  - Sprint 2 (2026-04-03 ~ 2026-04-16)
- 백로그 이슈 12개 자동 시드

## 2) 실행 준비

PowerShell에서 토큰과 저장소를 설정합니다.

```powershell
$env:GITHUB_TOKEN = "<your_token>"
$env:GITHUB_REPOSITORY = "hyunsuki5329/AIOSS"
```

필요 권한:
- repo (issues, milestones, labels 생성)
- project (Project V2 생성 및 필드 수정)

## 3) 프로젝트/백로그 생성 실행

```powershell
pwsh ./scripts/bootstrap-github-project.ps1 -Repo $env:GITHUB_REPOSITORY -ProjectTitle "AIOSS Sprint Board"
```

실행 결과:
- Project V2 생성 또는 기존 프로젝트 재사용
- Status 옵션 5개 강제 설정
- 라벨 20개 생성(없으면)
- 마일스톤 2개 생성(없으면)
- 이슈 12개 생성(동일 제목이 있으면 중복 방지)
- 생성 이슈를 Project에 등록하고 Status 지정

## 4) 선택과제 분석 실행

수동 실행:

```powershell
node ./scripts/sprint-metrics.mjs
```

산출물:
- `artifacts/sprint-metrics.json`
- `artifacts/sprint-metrics-report.md`

지표 정의:
- Cycle Time: 이슈 생성 시점부터 종료 시점까지의 일수 평균
- Velocity: 스프린트별 완료 포인트 / 커밋 포인트
- Burndown: 스프린트 기간 중 날짜별 잔여 포인트 추이

포인트 기준(label):
- size/xs=1, size/s=2, size/m=3, size/l=5

## 5) GitHub Actions 자동화

워크플로:
- `.github/workflows/sprint-metrics.yml`

동작:
- 매주 월요일 01:00 UTC 실행
- 수동 실행 지원
- 결과를 artifact로 업로드
- `reports/weekly-sprint-metrics-report.md` 갱신 커밋
