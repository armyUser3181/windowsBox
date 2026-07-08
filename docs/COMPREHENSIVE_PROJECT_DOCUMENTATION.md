# CodeBox 프로젝트 종합 문서

## 1. 프로젝트 개요

CodeBox는 이벤트 기반 아키텍처를 사용하는 웹 UI 프레임워크 프로젝트로, 브라우저 상에서 데스크톱과 유사한 창(Window) 시스템을 구현하는 것을 목표로 합니다.

### 1.1 기술 스택
- **언어**: JavaScript (ES6+)
- **스타일링**: CSS
- **모듈 시스템**: ES Modules
- **아키텍처**: 이벤트 기반, 모듈형

### 1.2 프로젝트 구조
```
codebox/
├── CSS/                    # 스타일시트
│   ├── index.css          # 메인 스타일시트
│   └── window.css         # 윈도우 컴포넌트 스타일
├── Debugger/              # 디버깅 도구
│   └── Debugger.js        # 로깅, 메모리 모니터링, 성능 측정
├── Event/                 # 이벤트 시스템
│   ├── EventAction.js     # 비즈니스 로직 단위
│   ├── EventCaller.js     # DOM 이벤트 감지
│   ├── EventHandler.js    # 이벤트 실행 관리자 (현재 비어있음)
│   ├── EventInstance.js   # 이벤트 실행 제어
│   └── EventRepository.js # 이벤트 저장소 & 관리
├── Map/                   # 데이터 구조
│   └── SuperMap.js        # Map 클래스 확장
├── Taster/                # 테스터 클래스
│   ├── SuperTaster.js     # 기본 테스터
│   ├── Taster.js          # SuperTaster 확장
│   ├── DebuggerTaster.js  # 디버거 통합 테스터
│   └── EventTaster.js     # 이벤트 테스터
├── Window/                # 윈도우 UI 컴포넌트
│   ├── Window.js          # 메인 윈도우 클래스
│   ├── Windowbar.js       # 윈도우 상단 바
│   ├── WindowMenubar.js   # 메뉴 바
│   ├── WindowButtonElement.js  # 버튼 기본 클래스
│   ├── WindowButtonEvent.js    # 버튼 이벤트 기본 클래스
│   ├── WindowClosebar.js       # 닫기 버튼
│   ├── WindowCloseEvent.js     # 닫기 이벤트
│   ├── WindowMaxizebar.js      # 최대화 버튼
│   ├── WindowMaxizeEvent.js    # 최대화 이벤트
│   ├── WindowMinizebar.js      # 최소화 버튼
│   ├── WindowMinizeEvent.js    # 최소화 이벤트
│   └── WindowResizeEvent.js    # 크기 조절 이벤트
├── docs/                  # 프로젝트 문서
├── index.html             # 메인 HTML
├── index.js               # 진입점
└── main.js                # (비어있음)
```

## 2. 핵심 모듈 상세

### 2.1 Event 시스템

이벤트 기반 아키텍처의 핵심 컴포넌트들로, 현재 스켈레톤 단계입니다.

#### EventRepository (이벤트 저장소)
- **역할**: EventCaller, EventInstance, resolver를 관리하는 중앙 저장소
- **주요 속성**:
  - `resolverMap`: 이벤트 유형과 리스너를 연결하는 함수 맵
  - `eventCallerMap`: EventCaller 객체를 모아두는 맵
  - `eventInstanceMap`: EventInstance 객체를 저장하는 맵
  - `bound`: 현재 바인딩 상태
- **주요 메서드** (TODO 상태):
  - `bind()`: resolver들을 실제 DOM 리스너에 등록
  - `unbind()`: resolver와 DOM 리스너 간의 연결 해제
  - `renew()`: 등록된 EventCaller에 맞는 resolver 생성/갱신
  - `push(eventInstance)`: EventInstance를 저장소에 추가
  - `remove(eventInstance)`: EventInstance를 저장소에서 제거

#### EventCaller (이벤트 호출자)
- **역할**: DOM 이벤트를 감지하고 EventInstance를 호출
- **주요 속성**:
  - `repository`: 바인딩할 EventRepository
  - `eventName`: 이벤트 이름 (click, keydown 등)
  - `target`: 이벤트 대상 요소
  - `bound`: 현재 repository에 등록된 상태
- **주요 메서드** (TODO 상태):
  - `bind()`: repository에 자신을 등록하고 이벤트 수신 활성화
  - `unbind()`: repository에서 자신을 제거하여 이벤트 처리 중지
  - `call()`: 이벤트 발생 시 처리

#### EventInstance (이벤트 인스턴스)
- **역할**: 실제 실행을 담당하는 독립적인 이벤트 제어 단위
- **주요 속성**:
  - `repository`: 자신을 등록한 EventRepository
  - `callers`: EventCaller 객체들의 집합
  - `actions`: 실행할 비즈니스 로직 함수들의 목록
  - `resolve`: action들을 호출하고 흐름을 제어하는 함수
  - `enabled`: 작동 여부 속성
  - `bound`: 바인드 여부 속성
- **주요 메서드**:
  - `bind()`: EventRepository에 등록하여 관련 EventCaller 활성화
  - `unbind()`: repository에서 자신을 제거하여 실행 엔진에서 제외
  - `run({ event, caller, action })`: 이벤트 실행 (타입 가드 포함)
  - `isEnabled()`: 작동 여부 확인 (`enabled && bound`)
  - `activate()`: 작동 활성화
  - `deactivate()`: 작동 비활성화

#### EventAction (액션)
- **역할**: 이벤트 발생 시 수행되는 비즈니스 로직의 최소 단위
- **주요 속성**:
  - `caller`: 액션을 호출하는 초기화 콜백 함수
  - `action`: 실제 실행될 함수
  - `id`: 액션을 구분하는 고유 식별자
- **주요 메서드**:
  - `run({ event })`: 실행 시 필요한 데이터를 받아 처리

#### EventHandler (이벤트 핸들러)
- **역할**: 이벤트 실행 관리자 (현재 비어있음)
- **계획된 역할**:
  - 이벤트 라우팅: EventCaller에서 발생한 이벤트를 적절한 EventInstance로 전달
  - 실행 컨텍스트 관리: 실행 중인 caller, event 정보 추적
  - 실행 순서 제어: 여러 인스턴스가 실행될 때의 순서 및 우선순위 관리
  - 재진입 방지: 순환 호출 방지 및 실행 상태 추적

### 2.2 Window 시스템

윈도우 UI 컴포넌트 계층 구조로, 현재 클래스 껍데기 단계입니다.

#### cwindow (메인 윈도우)
- **역할**: 최상위 윈도우 객체
- **의존성**: Windowbar, WindowSizebar
- **현재 상태**: 생성자만 존재, DOM 연결 없음

#### Windowbar (윈도우 상단 바)
- **역할**: 윈도우 상단 바 컴포넌트
- **의존성**: WindowMenubar
- **현재 상태**: 기본 구조만 존재

#### WindowMenubar (메뉴 바)
- **역할**: 메뉴 바 (닫기, 최대화, 최소화 버튼 포함)
- **의존성**: WindowClosebar, WindowMaxizebar, WindowMinizebar
- **현재 상태**: 기본 구조만 존재

#### 버튼 클래스 계층
- **WindowButtonElement**: 버튼 요소 기본 클래스 (현재 비어있음)
- **WindowButtonEvent**: 버튼 이벤트 기본 클래스 (현재 비어있음)
- **WindowClosebar/Event**: 닫기 버튼 및 이벤트
- **WindowMaxizebar/Event**: 최대화 버튼 및 이벤트
- **WindowMinizebar/Event**: 최소화 버튼 및 이벤트

#### WindowResizeEvent
- **역할**: 윈도우 크기 조절 이벤트
- **현재 상태**: 기본 클래스만 존재

### 2.3 Debugger 시스템

디버깅 및 성능 측정 도구로, 프로젝트에서 유일하게 완전히 구현된 모듈입니다.

#### cdebugger
- **역할**: 로깅, 메모리 사용량 모니터링, 성능 측정
- **주요 메서드**:
  - `log(message)`: 타임스탬프付き 로그 출력
  - `error(message)`: 에러 로그 출력
  - `printMemoryUsage()`: 힙 메모리 사용량 출력 (MB 단위)
  - `measure(fn)`: 함수 실행 시간 측정
  - `debuggingModeOn()`: 디버깅 모드 활성화
  - `debuggingModeOff()`: 디버깅 모드 비활성화
- **현재 상태**: 완전히 구현됨, 단 기본적으로 디버깅 모드는 꺼져있음

### 2.4 Taster 시스템

테스트 및 실험용 클래스 계층입니다.

#### SuperTaster
- **역할**: 기본 테스터 클래스
- **현재 상태**: 기본 구조만 존재

#### Taster
- **역할**: SuperTaster 확장
- **현재 상태**: 기본 구조만 존재

#### DebuggerTaster
- **역할**: 디버거 기능이 통합된 테스터
- **기능**: 배열 연산 테스트 포함
- **현재 상태**: 기본 기능 구현됨

#### EventTaster
- **역할**: 이벤트 시스템 테스터
- **현재 상태**: 기본 구조만 존재

### 2.5 Map 시스템

#### SuperMap
- **역할**: Map 클래스의 단순 확장
- **현재 상태**: 기본 구조만 존재

### 2.6 CSS 시스템

#### index.css
- **역할**: 메인 스타일시트
- **내용**: window.css import

#### window.css
- **역할**: 윈도우 컴포넌트 스타일
- **주요 스타일**:
  - 기본 윈도우: 800x640px, azure 배경
  - 윈도우바: 20px 높이, aquamarine 배경
  - 사이즈바: 우측 하단 크기 조절 핸들

## 3. 진입점 및 실행 흐름

### 3.1 현재 진입점
```javascript
index.js → DebuggerTaster → 디버거 테스트 실행
```

### 3.2 계획된 실행 흐름
```
index.js → cwindow 생성 → DOM 마운트 → Event 시스템 초기화 → 이벤트 바인딩 → 사용자 인터랙션
```

### 3.3 이벤트 흐름 (설계상)
```
EventCaller (DOM 이벤트 감지) 
  → EventHandler (이벤트 라우팅) 
  → EventRepository (연결 정보 조회) 
  → EventInstance (실행 제어) 
  → EventAction (비즈니스 로직) 
  → resolve (이벤트 처리 완료)
```

## 4. 현재 구현 상태

### 4.1 완료된 부분 ✅
- 기본 프로젝트 폴더 구조
- Event 시스템 기본 클래스 구조 (스켈레톤)
- Window 시스템 클래스 계층 (스켈레톤)
- Debugger 기능 완전 구현
- Taster 기본 기능
- CSS 스타일링

### 4.2 진행 중인 부분 🔄
- Event 시스템 bind/unbind/call 메서드 구현
- WindowResizeEvent: 윈도우 드래그 시 모서리 감지 로직
- Window element 드래그 핸들링
- DOM 연결 로직

### 4.3 미구현 부분 🔴
- Event 시스템 실제 실행 로직
- Window 시스템 DOM 연결
- WindowSizebar 파일 (누락됨)
- EventHandler 구현
- index.js에서의 실제 시스템 기동

### 4.4 설계 문서 상태
- Event 시스템: 3차례 개정된 상세 설계 문서 존재
- Window 시스템: 초기 구조 보고서만 존재
- 통합 설계: Event-Window 결합 지점 미문서화

## 5. 주요 설계 결정 사항

### 5.1 Event 시스템 설계 철학
1. **책임 분리**: EventCaller는 이벤트 수신만, EventInstance는 실행만 담당
2. **중앙 관리**: 연결 관계는 EventRepository가 중앙에서 관리
3. **컨텍스트 전달**: caller가 명시적으로 컨텍스트(callerId, eventName, target)를 전달
4. **참조 최소화**: caller와 instance 간 강한 상호 참조 금지
5. **생명주기 관리**: 레지스트리가 등록/해제 담당

### 5.2 구현 전 결정 필요 사항
1. Map 키를 `id`(문자열)로 할지 `symbol`로 할지 통일 필요
2. EventAction의 `caller` 필드명 변경으로 용어 혼동 제거 필요
3. EventAction.run()의 `||` 폴백 로직 의도 재확인 필요
4. eventCallerMap용 push/remove 메서드 추가 필요
5. EventHandler의 정확한 역할 정의 필요

## 6. 알려진 이슈 및 제한 사항

### 6.1 치명적 이슈
- WindowSizebar.js 파일 누락으로 런타임 에러 위험
- index.js가 cwindow를 import조차 하지 않음
- Window 시스템과 DOM이 완전히 분리됨

### 6.2 설계 이슈
- Event 시스템에서 Symbol 키와 문자열 키 혼용
- EventAction에서 caller 용어 혼동 (콜백 함수 vs EventCaller 객체)
- WeakMap 언급과 문자열 키 방식 간 모순
- 재진입 방지 구체적 메커니즘 미정

### 6.3 구현 이슈
- Event 시스템 전체가 TODO 스텁 상태
- Window 시스템에 DOM 연결 로직 부재
- EventHandler가 비어있음
- main.js가 비어있음

## 7. 다음 단계 우선순위

### 7.1 즉시 실행 (이번 작업 블록)
1. WindowSizebar.js 파일 생성
2. index.js에 cwindow 인스턴스 생성 + DOM 마운트 로직 추가
3. Map 키 타입 통일 (id vs symbol)

### 7.2 단기 목표
1. Event 시스템 구현 (3차 설계안 기준)
2. 재진입 방지 로직 구체화
3. Debugger log/error 구분 개선
4. Window 시스템 DOM 연결 구현

### 7.3 중기 목표
1. Window 시스템 설계 문서 작성
2. Event-Window 결합 지점 문서화
3. 정적 HTML → 동적 DOM 생성 전환
4. 멀티 윈도우 지원 고려

### 7.4 장기 목표
1. Event 인스턴스 고도화
2. Window 인스턴스 고도화
3. Code 해석 인스턴스 개발
4. 중앙 상태 스토어 도입 검토

## 8. 개발 철학

### 8.1 설계 중심 접근
- 코드보다 설계를 먼저 정리하는 접근 채택
- Event 시스템은 3차례 설계 개정을 거침
- 구현 전에 결정해야 할 갈림길 명시

### 8.2 모듈형 아키텍처
- 명확한 책임 분리
- 상속을 통한 코드 재사용
- 독립적인 테스트 가능성

### 8.3 점진적 구현
- 스켈레톤 → 구현 순서
- 테스트 주도 개발 고려
- 눈에 보이는 결과 우선

이 문서는 CodeBox 프로젝트의 현재 상태를 종합적으로 정리한 것으로, 프로젝트의 구조, 현재 구현 상태, 설계 결정 사항, 알려진 이슈, 그리고 다음 단계 방향을 포함하고 있습니다.
