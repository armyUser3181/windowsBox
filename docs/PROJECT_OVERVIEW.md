# CodeBox 프로젝트 개요

## 프로젝트 소개
CodeBox는 이벤트 기반 아키텍처를 사용하는 웹 UI 프레임워크 프로젝트입니다. 윈도우 시스템과 이벤트 핸들링, 디버깅 도구를 포함한 모듈형 구조로 설계되었습니다.

## 프로젝트 구조
```
codebox/
├── CSS/                    # 스타일시트
├── Debugger/              # 디버깅 도구
├── Event/                 # 이벤트 시스템
├── Map/                   # 데이터 구조
├── Taster/                # 테스터 클래스
├── Window/                # 윈도우 UI 컴포넌트
├── docs/                  # 프로젝트 문서
├── index.html             # 메인 HTML
├── index.js               # 진입점
└── main.js                # (비어있음)
```

## 핵심 모듈 상세

### 1. Event 시스템
이벤트 기반 아키텍처의 핵심 컴포넌트들입니다.

- **EventAction**: 이벤트 발생 시 실행되는 비즈니스 로직의 최소 단위
- **EventCaller**: DOM 이벤트를 감지하고 EventInstance를 호출
- **EventInstance**: 실제 실행을 담당하는 독립적인 이벤트 제어 단위
- **EventRepository**: EventCaller, EventInstance, resolver를 관리하는 저장소
- **EventHandler**: (프레임워크용, 현재 비어있음)

**이벤트 흐름**: EventCaller → EventInstance → EventAction → resolve

### 2. Window 시스템
윈도우 UI 컴포넌트 계층 구조입니다.

- **cwindow**: 메인 윈도우 클래스
- **Windowbar**: 윈도우 상단 바
- **WindowMenubar**: 메뉴 바 (닫기, 최대화, 최소화 버튼)
- **WindowButtonElement**: 버튼 요소 기본 클래스
- **WindowButtonEvent**: 버튼 이벤트 기본 클래스
- **WindowClosebar/Event**: 닫기 버튼 및 이벤트
- **WindowMaxizebar/Event**: 최대화 버튼 및 이벤트
- **WindowMinizebar/Event**: 최소화 버튼 및 이벤트
- **WindowResizeEvent**: 크기 조절 이벤트
- **WindowSizebar**: 크기 조절 바

### 3. Debugger
디버깅 및 성능 측정 도구입니다.

- **cdebugger**: 로깅, 메모리 사용량 모니터링, 성능 측정 기능 제공
  - `log()`: 타임스탬프付き 로그
  - `error()`: 에러 로그
  - `printMemoryUsage()`: 힙 메모리 사용량 (MB 단위)
  - `measure()`: 함수 실행 시간 측정

### 4. Taster 시스템
테스트 및 실험용 클래스 계층입니다.

- **SuperTaster**: 기본 테스터 클래스
- **Taster**: SuperTaster 확장
- **DebuggerTaster**: 디버거 기능이 통합된 테스터 (배열 연산 테스트 포함)

### 5. Map
- **SuperMap**: Map 클래스의 단순 확장

### 6. CSS
- **index.css**: 메인 스타일시트 (window.css import)
- **window.css**: 윈도우 컴포넌트 스타일
  - 기본 윈도우: 800x640px, azure 배경
  - 윈도우바: 20px 높이, aquamarine 배경
  - 사이즈바: 우측 하단 크기 조절 핸들

## 진입점
`index.js` → `DebuggerTaster` 인스턴스 생성 → 디버거 테스트 실행

## 기술 스택
- **언어**: JavaScript (ES6+)
- **아키텍처**: 이벤트 기반, 모듈형
- **스타일링**: CSS
- **모듈 시스템**: ES Modules

## 현재 상태
- 이벤트 시스템: 기본 구조 완료 (bind/unbind/call 메서드는 TODO 상태)
- 윈도우 시스템: 클래스 계층 구조 완료
- 디버거: 완전히 구현됨
- 테스터: 기본 기능 구현됨

## 개발 노트
- 이벤트 시스템의 bind/unbind/call 메서드 구현이 필요
- WindowSizebar 클래스가 참조되지만 파일이 누락됨
- main.js 파일이 비어있음
