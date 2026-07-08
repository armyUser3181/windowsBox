# CodeBox 프로젝트 문서 개선 방향

## 1. 현재 문서 구조 분석

### 1.1 기존 문서 목록
- `README.md`: 프로젝트 개요, 아키텍처, 진행 상태
- `docs/PROJECT_OVERVIEW.md`: 프로젝트 개요 (README와 중복)
- `docs/진행상황_요약.md`: 진행 상태 요약
- `docs/COMPREHENSIVE_PROJECT_DOCUMENTATION.md`: 종합 프로젝트 문서 (새로 생성)
- `docs/EventSystem_구조_쟁점_보고서.md`: Event 시스템 핵심 설계 쟁점
- `docs/archive/`: 보관된 예전 문서들
  - Event 시스템 설계 문서 6건
  - 프로젝트 분석 보고서 3건
  - Window 시스템 분석 보고서 1건
  - 보관 문서 요약 1건

### 1.2 문제점 분석

#### 중복성 문제
- `README.md`와 `docs/PROJECT_OVERVIEW.md`에 내용 중복
- `docs/진행상황_요약.md`와 `COMPREHENSIVE_PROJECT_DOCUMENTATION.md`에 진행 상태 중복
- 여러 문서에서 Event 시스템 설계 내용 반복

#### 구조적 문제
- 문서 간의 계층 구조가 명확하지 않음
- 어떤 문서를 먼저 읽어야 하는지 안내 부족
- 설계 문서와 현재 상태 문서가 혼재

#### 유지보수 문제
- Event 시스템 설계 문서가 6건으로 분산되어 있음
- 버전 관리가 어려움 (v1, v2, v3 형태의 분석 보고서)
- 문서 간의 참조 관계가 명확하지 않아 수정 시 영향 범위 파악 어려움

#### 최신성 문제
- 일부 문서가 실제 코드 상태와 불일치
- 예전 분석 보고서가 현재 상태를 반영하지 못함
- 설계 문서와 실제 구현 간의 갭이 문서에 명시되지 않음

## 2. 개선 방향 제안

### 2.1 문서 계층 구조화

#### 제안하는 계층 구조
```
docs/
├── README.md (최상위 개요)
├── COMPREHENSIVE_PROJECT_DOCUMENTATION.md (종합 문서)
├── ARCHITECTURE/
│   ├── EVENT_SYSTEM.md (Event 시스템 아키텍처)
│   ├── WINDOW_SYSTEM.md (Window 시스템 아키텍처)
│   └── DEBUGGER_SYSTEM.md (Debugger 시스템 아키텍처)
├── DESIGN/
│   ├── EVENT_DESIGN_DECISIONS.md (Event 시스템 설계 결정 사항)
│   └── WINDOW_DESIGN_DECISIONS.md (Window 시스템 설계 결정 사항)
├── STATUS/
│   ├── CURRENT_STATUS.md (현재 구현 상태)
│   └── ROADMAP.md (로드맵)
└── archive/
    └── ARCHIVED_DOCUMENTS_SUMMARY.md (보관 문서 요약)
```

#### 각 계층의 역할
- **최상위 개요**: 프로젝트를 빠르게 이해하기 위한 요약
- **종합 문서**: 프로젝트의 전체적인 상세 내용
- **아키텍처**: 각 시스템의 구조와 관계
- **설계**: 설계 결정 사항과 이유
- **상태**: 현재 구현 상태와 진행 상황
- **보관**: 역사적 참고용 문서

### 2.2 중복 제거

#### 중복 제거 전략
1. **README.md**를 최상위 개요로 단순화
   - 프로젝트 소개
   - 빠른 시작 가이드
   - 핵심 링크 (상세 문서로 연결)

2. **PROJECT_OVERVIEW.md** 삭제
   - 내용을 COMPREHENSIVE_PROJECT_DOCUMENTATION.md에 통합
   - README.md에서 COMPREHENSIVE_PROJECT_DOCUMENTATION.md로 연결

3. **진행상황_요약.md**를 STATUS/CURRENT_STATUS.md로 이동 및 개선
   - 현재 구현 상태에만 집중
   - 아키텍처 내용은 ARCHITECTURE 폴더로 이동

4. **Event 시스템 설계 문서 통합**
   - 6건의 설계 문서를 하나의 EVENT_DESIGN_DECISIONS.md로 통합
   - 시간 순서대로 설계 진화 과정 정리
   - 최종 결정 사항을 명확히 표시

### 2.3 버전 관리 개선

#### 설계 문서 버전 관리
- 단일 문서 내에서 시간 순서대로 설계 진화 과정 정리
- 각 버전의 주요 변경 사항 명시
- 최종 채택안을 명확히 표시
- 미해결 쟁점을 별도 섹션으로 정리

#### 예시 구조 (EVENT_DESIGN_DECISIONS.md)
```markdown
# Event 시스템 설계 결정 사항

## 최종 채택안
[현재 채택된 설계 요약]

## 설계 진화 과정
### v1 (초기안)
[내용]

### v2 (개선안)
[내용 및 변경 사항]

### v3 (쟁점 해결안)
[내용 및 변경 사항]

## 미해결 쟁점
[아직 해결되지 않은 문제점]
```

### 2.4 참조 관계 명확화

#### 문서 간 참조 규칙
1. **README.md** → COMPREHENSIVE_PROJECT_DOCUMENTATION.md
2. **COMPREHENSIVE_PROJECT_DOCUMENTATION.md** → ARCHITECTURE/*, DESIGN/*, STATUS/*
3. **ARCHITECTURE/* → DESIGN/* (설계 결정 사항 참조)
4. **STATUS/* → ARCHITECTURE/* (아키텍처 참조)

#### 참조 형식 표준화
- 상대 경로 사용: `[상세 내용](./COMPREHENSIVE_PROJECT_DOCUMENTATION.md)`
- 섹션 직접 링크: `[Event 시스템](./ARCHITECTURE/EVENT_SYSTEM.md#event-시스템)`
- 외부 링크는 절대 경로 또는 GitHub 링크

### 2.5 현재 상태와 설계 분리

#### 분리 원칙
- **아키텍처 문서**: 설계된 구조와 관계 (현재 구현 여부와 무관)
- **설계 문서**: 설계 결정 사항과 이유 (현재 구현 여부와 무관)
- **상태 문서**: 현재 실제 구현 상태 (아키텍처와 비교하여 갭 명시)

#### 상태 문서 구조 (STATUS/CURRENT_STATUS.md)
```markdown
# 현재 구현 상태

## Event 시스템
### 설계 상태
[아키텍처 문서 참조]

### 구현 상태
- 스켈레톤 단계
- 구현된 부분: [목록]
- 미구현된 부분: [목록]

### 갭 분석
[설계와 구현 간의 차이점]
```

## 3. 구체적인 개선 방법

### 3.1 단계별 개선 계획

#### 1단계: 문서 재구성 (즉시 실행)
1. `docs/ARCHITECTURE/` 폴더 생성
2. `docs/DESIGN/` 폴더 생성
3. `docs/STATUS/` 폴더 생성
4. 기존 문서를 적절한 폴더로 이동/재작성

#### 2단계: 중복 제거 (단기)
1. `PROJECT_OVERVIEW.md` 삭제
2. `진행상황_요약.md`를 `STATUS/CURRENT_STATUS.md`로 이동 및 개선
3. Event 시스템 설계 문서 6건을 통합

#### 3단계: 참조 관계 정리 (중기)
1. 모든 문서의 참조 링크 업데이트
2. README.md 단순화
3. 문서 간의 일관성 검사

#### 4단계: 유지보수 프로세스 수립 (장기)
1. 문서 업데이트 가이드라인 작성
2. 코드 변경 시 문서 업데이트 체크리스트
3. 정기적인 문서 검토 프로세스

### 3.2 문서 작성 가이드라인

#### 공통 가이드라인
- 모든 문서는 마크다운 형식
- 문서 상단에 목차 (TOC) 포함
- 코드 블록에는 언어 지정
- 이미지는 `docs/images/` 폴더에 저장
- 용어는 일관되게 사용 (용어 사전 참조)

#### 아키텍처 문서
- 다이어그램 (Mermaid 또는 이미지) 포함
- 컴포넌트 간 관계 명시
- 데이터 흐름 설명
- 기술 스택 명시

#### 설계 문서
- 결정 사항과 이유 명시
- 대안 비교 포함
- 장단점 분석
- 최종 결정 명시

#### 상태 문서
- 현재 구현 상태 정확히 명시
- 설계와의 갭 분석
- 다음 단계 명시
- 우선순위 포함

### 3.3 용어 사전

#### 통일 용어
- **Event 시스템**: EventCaller, EventInstance, EventRepository, EventAction, EventHandler
- **Window 시스템**: cwindow, Windowbar, WindowMenubar, WindowButtonElement
- **상태 용어**: 스켈레톤 (클래스 구조만 있음), 껍데기 (클래스 껍데기), 완전 구현

## 4. 우선순위

### 높은 우선순위 (즉시 실행)
1. 문서 폴더 구조 재구성
2. README.md 단순화 및 참조 링크 추가
3. PROJECT_OVERVIEW.md 삭제
4. 진행상황_요약.md를 STATUS/CURRENT_STATUS.md로 이동

### 중간 우선순위 (단기)
1. Event 시스템 설계 문서 통합
2. ARCHITECTURE 폴더에 아키텍처 문서 작성
3. DESIGN 폴더에 설계 결정 사항 문서 작성
4. 참조 관계 정리

### 낮은 우선순위 (중장기)
1. 문서 작성 가이드라인 수립
2. 용어 사전 작성
3. 정기적인 문서 검토 프로세스 수립
4. 문서 자동화 도구 도입 검토

## 5. 기대 효과

### 문서 품질 향상
- 중복 제거로 일관성 향상
- 계층 구조로 가독성 향상
- 참조 관계 명확화로 탐색 용이성 향상

### 유지보수 효율 향상
- 문서 수정 시 영향 범위 명확
- 버전 관리 체계화
- 코드와 문서의 동기화 용이

### 온보딩 효율 향상
- 새로운 참여자의 프로젝트 이해 속도 향상
- 명확한 문서 계층으로 필요한 정보 빠르게 찾기
- 설계 결정 사항의 이유 파악 용이

## 6. 결론

현재 CodeBox 프로젝트의 문서는 상세한 설계 문서와 분석 보고서가 풍부하지만, 문서 간의 중복과 구조적 문제로 인해 유지보수와 탐색이 어려운 상태입니다.

제안된 개선 방향은 문서 계층 구조화, 중복 제거, 버전 관리 개선, 참조 관계 명확화, 현재 상태와 설계 분리를 통해 문서의 품질과 유지보수 효율을 향상시키는 것입니다.

이 개선은 단계적으로 진행되어야 하며, 높은 우선순위 항목부터 시작하여 점진적으로 문서 구조를 개선해 나가는 것을 권장합니다.
