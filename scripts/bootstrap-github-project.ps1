param(
  [string]$Repo = $env:GITHUB_REPOSITORY,
  [string]$ProjectTitle = "AIOSS Sprint Board",
  [string]$Token = $env:GITHUB_TOKEN
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Token)) {
  throw "GITHUB_TOKEN is required. Use a classic PAT with repo + project scopes or fine-grained token with Issues/Projects permissions."
}

if ([string]::IsNullOrWhiteSpace($Repo) -or -not $Repo.Contains('/')) {
  throw "Repo must be in owner/repo format. Example: hyunsuki5329/AIOSS"
}

$parts = $Repo.Split('/')
$owner = $parts[0]
$repoName = $parts[1]
$apiBase = "https://api.github.com"

$headers = @{
  Authorization = "Bearer $Token"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
  "User-Agent" = "AIOSS-Project-Bootstrap"
}

function Invoke-GitHubRestGet([string]$Path) {
  Invoke-RestMethod -Method Get -Uri "$apiBase$Path" -Headers $headers
}

function Invoke-GitHubRestPost([string]$Path, $Body) {
  $json = $Body | ConvertTo-Json -Depth 20
  Invoke-RestMethod -Method Post -Uri "$apiBase$Path" -Headers $headers -Body $json
}

function Invoke-GitHubGraphQL([string]$Query, $Variables) {
  $body = @{
    query = $Query
    variables = $Variables
  } | ConvertTo-Json -Depth 30

  $response = Invoke-RestMethod -Method Post -Uri "$apiBase/graphql" -Headers $headers -Body $body
  if ($response.errors) {
    $err = ($response.errors | ConvertTo-Json -Depth 10)
    throw "GraphQL error: $err"
  }
  return $response.data
}

Write-Host "[1/6] repository metadata 확인"
$repo = Invoke-GitHubRestGet "/repos/$owner/$repoName"
$ownerType = $repo.owner.type

$labels = @(
  @{ name = "type/bug"; color = "d73a4a"; description = "버그 수정" },
  @{ name = "type/feature"; color = "0e8a16"; description = "기능 개발" },
  @{ name = "type/chore"; color = "cfd3d7"; description = "유지보수/정리" },
  @{ name = "status/backlog"; color = "ededed"; description = "백로그" },
  @{ name = "status/todo"; color = "fbca04"; description = "착수 대기" },
  @{ name = "status/in-progress"; color = "1d76db"; description = "진행 중" },
  @{ name = "status/review"; color = "5319e7"; description = "리뷰 중" },
  @{ name = "status/done"; color = "0e8a16"; description = "완료" },
  @{ name = "priority/p0"; color = "b60205"; description = "최우선" },
  @{ name = "priority/p1"; color = "d93f0b"; description = "높음" },
  @{ name = "priority/p2"; color = "fbca04"; description = "보통" },
  @{ name = "priority/p3"; color = "0e8a16"; description = "낮음" },
  @{ name = "size/xs"; color = "c2e0c6"; description = "1 point" },
  @{ name = "size/s"; color = "7fdb7f"; description = "2 points" },
  @{ name = "size/m"; color = "3fb950"; description = "3 points" },
  @{ name = "size/l"; color = "238636"; description = "5 points" },
  @{ name = "area/monitoring"; color = "0052cc"; description = "Prometheus/Grafana" },
  @{ name = "area/rag"; color = "0366d6"; description = "RAG/검색" },
  @{ name = "area/data"; color = "bfd4f2"; description = "데이터 파이프라인" },
  @{ name = "area/devops"; color = "5319e7"; description = "CI/CD/운영" }
)

Write-Host "[2/6] labels 생성/동기화"
$existingLabels = @{}
(Invoke-GitHubRestGet "/repos/$owner/$repoName/labels?per_page=100") | ForEach-Object {
  $existingLabels[$_.name] = $_
}

foreach ($l in $labels) {
  if ($existingLabels.ContainsKey($l.name)) {
    continue
  }
  Invoke-GitHubRestPost "/repos/$owner/$repoName/labels" $l | Out-Null
  Write-Host "  + label: $($l.name)"
}

$milestones = @(
  @{ title = "Sprint 1 (2026-03-20 ~ 2026-04-02)"; description = "모니터링/품질 기반 정비"; due_on = "2026-04-02T15:00:00Z" },
  @{ title = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; description = "검색/응답 품질 및 배포 안정화"; due_on = "2026-04-16T15:00:00Z" }
)

Write-Host "[3/6] milestones 생성/확인"
$allMilestones = Invoke-GitHubRestGet "/repos/$owner/$repoName/milestones?state=all&per_page=100"
$milestoneMap = @{}
$allMilestones | ForEach-Object { $milestoneMap[$_.title] = $_ }

foreach ($m in $milestones) {
  if (-not $milestoneMap.ContainsKey($m.title)) {
    $created = Invoke-GitHubRestPost "/repos/$owner/$repoName/milestones" $m
    $milestoneMap[$created.title] = $created
    Write-Host "  + milestone: $($created.title)"
  }
}

$issuesSeed = @(
  @{ title = "[Sprint1] Grafana 대시보드 패널 오류 수정"; body = "## 배경`n패널에서 일부 지표가 누락됩니다.`n`n## 완료조건`n- [ ] 누락 패널 정상 렌더링`n- [ ] 대시보드 JSON 업데이트"; labels = @("type/bug","priority/p1","size/s","area/monitoring"); milestone = "Sprint 1 (2026-03-20 ~ 2026-04-02)"; status = "To Do" },
  @{ title = "[Sprint1] Prometheus scrape 실패 알림 룰 추가"; body = "scrape 실패를 조기 감지할 수 있도록 알림 룰을 추가합니다."; labels = @("type/feature","priority/p1","size/m","area/monitoring"); milestone = "Sprint 1 (2026-03-20 ~ 2026-04-02)"; status = "Backlog" },
  @{ title = "[Sprint1] dora-metrics.mjs 예외 처리 강화"; body = "API 실패 시 재시도 및 오류 메시지 정제를 적용합니다."; labels = @("type/feature","priority/p2","size/s","area/devops"); milestone = "Sprint 1 (2026-03-20 ~ 2026-04-02)"; status = "In Progress" },
  @{ title = "[Sprint1] 배포 실패 원인 자동 분류 스크립트 개선"; body = "failure 상태를 원인별 태깅 규칙으로 분류합니다."; labels = @("type/chore","priority/p2","size/m","area/devops"); milestone = "Sprint 1 (2026-03-20 ~ 2026-04-02)"; status = "Review" },
  @{ title = "[Sprint1] 민원 구조화 샘플 데이터 검증 케이스 추가"; body = "NER/구조화 결과의 회귀를 막기 위한 테스트 샘플을 보강합니다."; labels = @("type/feature","priority/p2","size/m","area/data"); milestone = "Sprint 1 (2026-03-20 ~ 2026-04-02)"; status = "To Do" },
  @{ title = "[Sprint2] 유사 민원 검색 Recall@5 리포트 자동화"; body = "주간 Recall@5 산출 및 아티팩트 업로드를 자동화합니다."; labels = @("type/feature","priority/p1","size/m","area/rag"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "Backlog" },
  @{ title = "[Sprint2] RAG 응답 출처 하이라이트 품질 개선"; body = "source chunk 표시 누락 케이스를 해결합니다."; labels = @("type/bug","priority/p1","size/s","area/rag"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "Backlog" },
  @{ title = "[Sprint2] ChromaDB 메타데이터 필터 성능 튜닝"; body = "기간/지역 필터 질의 성능을 개선합니다."; labels = @("type/feature","priority/p2","size/l","area/rag"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "Backlog" },
  @{ title = "[Sprint2] API 응답 지연시간 p95 대시보드 추가"; body = "p95 latency 시계열을 Grafana에 추가합니다."; labels = @("type/feature","priority/p2","size/s","area/monitoring"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "To Do" },
  @{ title = "[Sprint2] CI 워크플로 병렬화로 빌드 시간 단축"; body = "테스트/분석 잡을 병렬화해 PR 피드백 시간을 줄입니다."; labels = @("type/chore","priority/p2","size/m","area/devops"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "Backlog" },
  @{ title = "[Sprint2] 오프라인 데모 시나리오 체크리스트 정비"; body = "폐쇄망 데모 리허설 절차를 문서화합니다."; labels = @("type/chore","priority/p3","size/xs","area/data"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "Backlog" },
  @{ title = "[Sprint2] 배포 실패 시 자동 롤백 runbook 작성"; body = "MTTR 단축을 위해 롤백 절차를 표준화합니다."; labels = @("type/feature","priority/p1","size/s","area/devops"); milestone = "Sprint 2 (2026-04-03 ~ 2026-04-16)"; status = "Backlog" }
)

Write-Host "[4/6] 이슈 백로그(12개) 생성/확인"
$existingIssues = Invoke-GitHubRestGet "/repos/$owner/$repoName/issues?state=all&per_page=100"
$issueMap = @{}
$existingIssues | Where-Object { -not $_.pull_request } | ForEach-Object { $issueMap[$_.title] = $_ }

$createdIssues = @()
foreach ($i in $issuesSeed) {
  if ($issueMap.ContainsKey($i.title)) {
    $createdIssues += [PSCustomObject]@{ issue = $issueMap[$i.title]; status = $i.status }
    continue
  }

  $newIssue = Invoke-GitHubRestPost "/repos/$owner/$repoName/issues" @{
    title = $i.title
    body = $i.body
    labels = $i.labels
    milestone = $milestoneMap[$i.milestone].number
  }

  Write-Host "  + issue #$($newIssue.number): $($newIssue.title)"
  $createdIssues += [PSCustomObject]@{ issue = $newIssue; status = $i.status }
}

Write-Host "[5/6] Project(V2) 생성/조회 및 Status 옵션 설정"

$queryOwner = @'
query($login:String!) {
  user(login:$login) { id login projectsV2(first:50) { nodes { id title url number } } }
  organization(login:$login) { id login projectsV2(first:50) { nodes { id title url number } } }
}
'@
$ownerData = Invoke-GitHubGraphQL $queryOwner @{ login = $owner }

$ownerNode = $null
if ($ownerType -eq "Organization" -and $ownerData.organization) {
  $ownerNode = $ownerData.organization
} elseif ($ownerData.user) {
  $ownerNode = $ownerData.user
}

if (-not $ownerNode) {
  throw "Cannot resolve owner node for GraphQL project creation."
}

$project = $ownerNode.projectsV2.nodes | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1

if (-not $project) {
  $createProjectMutation = @'
mutation($ownerId:ID!, $title:String!) {
  createProjectV2(input:{ownerId:$ownerId, title:$title}) {
    projectV2 { id title url number }
  }
}
'@
  $createdProject = Invoke-GitHubGraphQL $createProjectMutation @{ ownerId = $ownerNode.id; title = $ProjectTitle }
  $project = $createdProject.createProjectV2.projectV2
  Write-Host "  + project: $($project.title) ($($project.url))"
}

$getFieldsQuery = @'
query($projectId:ID!) {
  node(id:$projectId) {
    ... on ProjectV2 {
      id
      title
      fields(first:50) {
        nodes {
          ... on ProjectV2Field { id name }
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name color }
          }
        }
      }
    }
  }
}
'@
$projectFields = Invoke-GitHubGraphQL $getFieldsQuery @{ projectId = $project.id }
$statusField = $projectFields.node.fields.nodes | Where-Object { $_.name -eq "Status" } | Select-Object -First 1
if (-not $statusField) {
  throw "Status field not found in project."
}

$statusOptions = @(
  @{ name = "Backlog"; color = "GRAY"; description = "아이디어/대기" },
  @{ name = "To Do"; color = "YELLOW"; description = "이번 스프린트 계획" },
  @{ name = "In Progress"; color = "BLUE"; description = "개발 진행 중" },
  @{ name = "Review"; color = "PURPLE"; description = "코드/QA 리뷰" },
  @{ name = "Done"; color = "GREEN"; description = "완료" }
)

$updateStatusMutation = @'
mutation($projectId:ID!, $fieldId:ID!, $name:String!, $options:[ProjectV2SingleSelectFieldOptionInput!]!) {
  updateProjectV2Field(input:{projectId:$projectId, fieldId:$fieldId, name:$name, singleSelectOptions:$options}) {
    projectV2Field {
      ... on ProjectV2SingleSelectField {
        id
        name
        options { id name }
      }
    }
  }
}
'@
$updatedFieldData = Invoke-GitHubGraphQL $updateStatusMutation @{ projectId = $project.id; fieldId = $statusField.id; name = "Status"; options = $statusOptions }
$updatedOptions = $updatedFieldData.updateProjectV2Field.projectV2Field.options
$statusMap = @{}
$updatedOptions | ForEach-Object { $statusMap[$_.name] = $_.id }

Write-Host "[6/6] 이슈를 Project에 추가하고 Status 지정"
$addItemMutation = @'
mutation($projectId:ID!, $contentId:ID!) {
  addProjectV2ItemById(input:{projectId:$projectId, contentId:$contentId}) { item { id } }
}
'@

$setStatusMutation = @'
mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $optionId:String!) {
  updateProjectV2ItemFieldValue(
    input:{
      projectId:$projectId,
      itemId:$itemId,
      fieldId:$fieldId,
      value:{ singleSelectOptionId:$optionId }
    }
  ) {
    projectV2Item { id }
  }
}
'@

foreach ($row in $createdIssues) {
  $issue = $row.issue
  $targetStatus = $row.status
  if (-not $statusMap.ContainsKey($targetStatus)) {
    $targetStatus = "Backlog"
  }

  try {
    $addResult = Invoke-GitHubGraphQL $addItemMutation @{ projectId = $project.id; contentId = $issue.node_id }
    $itemId = $addResult.addProjectV2ItemById.item.id
    Invoke-GitHubGraphQL $setStatusMutation @{ projectId = $project.id; itemId = $itemId; fieldId = $statusField.id; optionId = $statusMap[$targetStatus] } | Out-Null
  } catch {
    # 이미 추가된 경우를 허용: 기존 item 찾기
    $itemsQuery = @'
query($projectId:ID!) {
  node(id:$projectId) {
    ... on ProjectV2 {
      items(first:200) {
        nodes {
          id
          content {
            ... on Issue { id number }
          }
        }
      }
    }
  }
}
'@
    $itemsData = Invoke-GitHubGraphQL $itemsQuery @{ projectId = $project.id }
    $existingItem = $itemsData.node.items.nodes | Where-Object { $_.content -and $_.content.id -eq $issue.node_id } | Select-Object -First 1
    if ($existingItem) {
      Invoke-GitHubGraphQL $setStatusMutation @{ projectId = $project.id; itemId = $existingItem.id; fieldId = $statusField.id; optionId = $statusMap[$targetStatus] } | Out-Null
    }
  }
}

Write-Host "완료"
Write-Host "- Project: $($project.url)"
Write-Host "- Issues seeded: $($issuesSeed.Count)"
Write-Host "- Milestones: $($milestones.Count)"
Write-Host "- Labels defined: $($labels.Count)"
