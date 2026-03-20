# GitHub Sprint Project 설정 가이드

이 문서는 GitHub Project V2 칸반 보드를 자동으로 구성하고, 스프린트 기반 어질리 운영을 위한 지표 분석 방법을 설명합니다.

## 📋 과제 요구사항 충족 현황

### ✅ 필수 과제

| 항목 | 구현 현황 | 파일/상세 |
|------|---------|---------|
| **칸반 Project** | ✅ 완료 | `.github/workflows/setup-sprint-project.yml` → Step 5 (GraphQL) |
| **Status 컬럼** | ✅ 5단계 | Backlog / To Do / In Progress / Review / Done |
| **이슈 템플릿** | ✅ 2종류 | `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml` |
| **라벨 체계** | ✅ 20개 | 8가지 분류 (type, status, priority, size, area, ...) |
| **마일스톤** | ✅ 2개 | Sprint 1 (2026-03-20~04-02), Sprint 2 (2026-04-03~04-16) |
| **백로그** | ✅ 12개 이슈 | `scripts/bootstrap-github-project.ps1` 자동 생성 |

### ✅ 선택 과제 (분석)

| 지표 | 구현 현황 | 계산식 |
|------|---------|-------|
| **Cycle Time** | ✅ 완료 | (closed_at - created_at) / 일수 |
| **Velocity** | ✅ 완료 | 완료 story point / 커밋된 story point × 100 |
| **Burndown** | ✅ 완료 | 스프린트별 일일 남은 포인트 추적 |

---

## 🚀 실행 방법

### 방법 1: GitHub Actions 워크플로 (권장)

GitHub 저장소에 푸시해서 직접 GitHub에서 실행:

1. **코드 푸시**
   ```bash
   git add .
   git commit -m "feat: GitHub Sprint Project 자동화 추가"
   git push origin main
   ```

2. **워크플로 실행** (GitHub UI)
   - 저장소 → Actions 탭
   - "Setup GitHub Project & Sprint Metrics" 선택
   - "Run workflow" 클릭
   - Action 선택: `setup-project` (필수) 또는 `generate-metrics` (선택)

   **필수 과제 (약 2분)**:
   ```
   setup-project
   → Project V2 생성
   → 20개 라벨 및 2개 마일스톤 생성
   → 12개 이슈 생성 및 배치
   → Status 지정 (Backlog/To Do/In Progress/Review/Done)
   ```

   **선택 과제 (약 1분)**:
   ```
   generate-metrics
   → artifacts/sprint-metrics.json 생성
   → artifacts/sprint-metrics-report.md 생성
   → Cycle Time / Velocity / Burndown 계산
   ```

---

### 방법 2: 로컬 PowerShell (필수 과제만)

GitHub Token이 있을 경우:

```powershell
# 1. 환경 변수 설정
$env:GITHUB_TOKEN = "ghp_YOUR_PERSONAL_ACCESS_TOKEN"
$env:GITHUB_REPOSITORY = "owner/repo"  # 예: hyunsuki5329/AIOSS

# 2. 스크립트 실행
cd .\AIOSS\scripts
.\bootstrap-github-project.ps1 -Repo "owner/repo" -Token $env:GITHUB_TOKEN
```

**결과**:
```
[1/6] repository metadata 확인
[2/6] labels 생성/동기화 (20개)
[3/6] milestones 생성/확인 (2개)
[4/6] 이슈 백로그(12개) 생성/확인
[5/6] Project(V2) 생성/조회 및 Status 옵션 설정
[6/6] 이슈를 Project에 추가하고 Status 지정
완료
- Project: https://github.com/owner/repo/projects/N
- Issues seeded: 12
- Milestones: 2
```

---

### 방법 3: 로컬 분석 (선택 과제, Node.js 필요)

```bash
# Node.js 20+ 필요
node .\scripts\sprint-metrics.mjs
```

**출력**:
- `artifacts/sprint-metrics.json` - 구조화된 지표 데이터
- `artifacts/sprint-metrics-report.md` - 마크다운 리포트

**Mock 모드** (GitHub Token 없을 때):
```bash
# Token 없으면 자동으로 샘플 데이터로 분석
node .\scripts\sprint-metrics.mjs
```

---

## 📊 분석 지표

### 1. Cycle Time (주기)
- **정의**: 이슈 생성부터 완료까지 소요 일수
- **계산**: (완료일 - 생성일) / 일수
- **해석**: 낮을수록 빠른 피드백

### 2. Velocity (속도)
- **정의**: 스프린트별 완료한 스토리 포인트
- **계산**: 완료 포인트 / 커밋 포인트 × 100
- **해석**: 스프린트 예측 정확도 및 생산성

### 3. Burndown (소진)
- **정의**: 스프린트 진행에 따른 남은 포인트
- **계산**: 일일 (전체 포인트 - 완료 포인트)
- **해석**: 계획대로 진행 중인지 확인

---

## 🏷️ 라벨 체계

### Type (유형)
| 라벨 | 색상 | 설명 |
|------|------|------|
| `type/bug` | 🔴 빨강 | 버그 수정 |
| `type/feature` | 🟢 초록 | 기능 개발 |
| `type/chore` | ⚙️ 회색 | 유지보수 |

### Priority (우선순위)
| 라벨 | 색상 | 의미 |
|------|------|------|
| `priority/p0` | 🔴 매우 높음 | 즉시 처리 필요 |
| `priority/p1` | 🟠 높음 | 이번 스프린트 필수 |
| `priority/p2` | 🟡 보통 | 예정된 계획 |
| `priority/p3` | 🟢 낮음 | 백로그 |

### Size (스토리 포인트)
| 라벨 | 포인트 | 설명 |
|------|--------|------|
| `size/xs` | 1 | 매우 작음 (< 2시간) |
| `size/s` | 2 | 작음 (2-4시간) |
| `size/m` | 3 | 중간 (0.5-1일) |
| `size/l` | 5 | 큼 (1-2일) |

### Area (영역)
- `area/monitoring`: Prometheus/Grafana
- `area/rag`: 검색/응답 시스템
- `area/data`: 데이터 파이프라인
- `area/devops`: CI/CD/배포

### Status (상태)
- `status/backlog`: 아직 검토 안 함
- `status/todo`: 이번 스프린트 계획
- `status/in-progress`: 현재 진행 중
- `status/review`: 코드/QA 검토 중
- `status/done`: 완료

---

## 📝 이슈 템플릿

### Bug Report
```markdown
## 버그 요약
무엇이 잘못되었는지 한 줄로 설명

## 재현 절차
1. docker compose up -d 실행
2. ...

## 기대 동작
어떻게 되어야 하나?

## 실제 동작
실제로는 어떻게 되는가?

## 심각도
- [ ] severity/critical
- [ ] severity/high
- [ ] severity/medium
```

### Feature Request
```markdown
## 해결하려는 문제
현재 어떤 불편/비효율이 있나?

## 제안하는 해결책
구현 아이디어를 구체적으로

## 완료 기준(AC)
- [ ] 체크 가능한 수용 조건

## 우선순위 & 예상 크기
- priority/p0 ~ p3
- size/xs ~ l
```

---

## 📈 GitHub Project 칸반 보드

화면 예시:

```
Backlog              To Do              In Progress         Review             Done
┌─────────────┐    ┌──────────────┐    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│ Future idea │    │ [Sprint1] PR │    │ [Sprint1]    │     │ [Sprint1]    │    │ [Sprint1] ✅ │
│ needs study │    │ review       │    │ Grafana fix  │     │ Scrape alarm │    │ Alarm rule   │
└─────────────┘    │ P1, size/m   │    │ P1, size/s   │     │ P1, size/m   │    └──────────────┘
                   │              │    │              │     │              │
┌─────────────┐    └──────────────┘    └──────────────┘     │              │
│ [Sprint2]   │                                              │              │
│ Search      │    ┌──────────────┐    ┌──────────────┐     │              │
│ improvement │    │ [Sprint2]    │    │ [Sprint2]    │     │              │
│ P2, size/m  │    │ Burndown add │    │ API timeout  │     └──────────────┘
└─────────────┘    │ P2, size/s   │    │ fix          │
                   │              │    │ P1, size/s   │
                   └──────────────┘    └──────────────┘
```

---

## 🔑 GitHub Token 생성 방법

1. GitHub 개인 설정 → Developer settings → Personal access tokens
2. **Classic 토큰** (권장):
   - `repo` 권한 (Issues 포함)
   - `project` 권한 (Projects V2 포함)
3. **Fine-grained 토큰**:
   - Repository: `Contents` (Read)
   - Repository: `Issues` (Read & Write)
   - Repository: `Projects` (Admin)

---

## 🔍 결과 확인

### GitHub UI에서
1. 저장소 → Projects 탭
2. "AIOSS Sprint Board" 프로젝트 확인
3. Issues 탭에서 12개 이슈 확인
4. Milestones에서 Sprint 1, 2 확인

### 로컬 파일에서
```pwsh
ls artifacts/
# sprint-metrics.json (지표 원본)
# sprint-metrics-report.md (분석 리포트)
```

---

## 🛠️ 트러블슈팅

### "GITHUB_TOKEN is required" 오류
- PowerShell: `$env:GITHUB_TOKEN` 설정 확인
- GitHub Actions: workflow에 이미 `secrets.GITHUB_TOKEN` 포함됨

### "Project not found" 오류
- 권한 확인: 토큰에 `project` 범위 포함 필요
- GraphQL 쿼리 권한: `projectsV2` 접근 권한 필요

### Node.js 없음
- `node .\scripts\sprint-metrics.mjs`는 mock 데이터로 자동 실행됨
- GitHub Actions에서는 Node.js 20 자동 설정됨

---

## 📚 고급: 커스터마이징

### 이슈 템플릿 수정
`.github/ISSUE_TEMPLATE/bug_report.yml` 에서 필드 추가/삭제

### 라벨 추가
`scripts/bootstrap-github-project.ps1` 의 `$labels` 배열 수정 후 재실행

### Project 필드 커스터마이징
GraphQL mutation 수정 (`updateProjectV2Field`)

---

## 📞 참고 링크

- [GitHub Projects V2 REST API](https://docs.github.com/en/rest/projects/v2)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [Agile Metrics Guide](https://www.atlassian.com/agile/metrics)

