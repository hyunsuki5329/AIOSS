# 온디바이스 AI 기반 민원 데이터 심층 분석 및 검색 시스템 (AI-Civil-Affairs-Systems)
인터넷 연결이 차단된 로컬 폐쇄망 환경에서도 공공 민원 데이터를 안전하게 보호하며, 비정형 텍스트를 구조화하고 과거 유사 사례 검색부터 근거 기반 답변 초안 생성까지 일관 처리하는 보안 특화 On-Device AI 조력자 시스템입니다.

## 🎯 Features
- 텍스트 구조화 및 엔티티 추출 (Structuring & NER) // 복잡한 민원 원문에서 4요소(Observation, Result, Request, Context)와 주요 정보(장소, 시간, 시설물 등)를 분리 및 JSON 구조화하여 지식 자산화
- 의미 기반 유사 민원 검색 (Semantic Search) // 단순 키워드 매칭을 넘어 BGE-m3 임베딩과 벡터 DB(ChromaDB/FAISS)를 통한 하이브리드 검색 및 메타데이터 필터(기간/지역)를 통해 정확한 과거 유사 참조 사례 도출 (Recall@5 0.85 이상)
- 근거 기반 답변 생성 (RAG) // Ollama 및 로컬 sLLM 기반으로 근거 문구 및 출처 청크 ID를 하이라이팅하여 환각을 방지하고 설명 가능성(XAI) 부여
- 사용자 친화적 데모 UI // Streamlit을 통해 민원 업로드 및 구조화 결과 확인, 질의응답 챗 인터페이스, 관리자용 통계 대시보드를 시각적으로 제공

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Docker & Docker Compose (선택)
- Ollama (로컬 LLM 구동용)
- 권장 하드웨어: VRAM 6GB 이상 또는 RAM 16GB 이상 (4-bit 양자화 기준)

### Installation
```bash
git clone https://github.com/hyunsuki5329/AIOSS.git
cd AIOSS
pip install -r requirements.txt
```

### Usage
```bash
# 1. 로컬 LLM 서빙 엔진 실행 (백그라운드)
ollama serve

# 2. 필수 모델 풀 (예: qwen2.5:7b-instruct)
ollama pull qwen2.5:7b-instruct

# 3. 백엔드 API 서버 실행 (FastAPI)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. 프론트엔드 UI 실행 (Streamlit)
streamlit run frontend/app.py
```

## 🧪 Testing
```bash
# 오프라인 평가: 구조화 필드 F1 Score, 검색 Recall@5, 질의 지연시간 검증
pytest tests/
```

## 📝 License
MIT License