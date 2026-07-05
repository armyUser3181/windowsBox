# windowsBox 프로젝트 분석 보고서

**저장소**: [armyUser3181/windowsBox](https://github.com/armyUser3181/windowsBox)
**분석일**: 2026-07-05
**작성자**: Claude

> ⚠️ 참고: 이 저장소는 커밋 히스토리(9 commits)와 파일 목록은 확인했지만, 개별 소스 파일(`index.js`, `main.js` 등)의 실제 내용은 GitHub 검색 API 제약으로 직접 열람하지 못했습니다. 아래 분석은 README에 저자가 직접 정리한 아키텍처 다이어그램, 모듈 구조, 진행도 체크리스트를 근거로 작성되었습니다. 실제 코드 레벨의 세부 이슈(네이밍, 캡슐화, 성능)는 파일을 직접 첨부해주시면 더 정확히 짚어드릴 수 있습니다.

---

## 1. 프로젝트 개요

**CodeBox**는 "이벤트 기반 웹 UI 프레임워크"로, 브라우저 상에서 데스크톱과 유사한 창(Window) 시스템을 이벤트 기반 아키텍처로 구현하는 모듈형 프로젝트입니다.

- **기술 스택**: JavaScript (ES6+), CSS, ES Modules — 별도 프레임워크(React 등) 의존성 없이 바닐라로 구현
- **언어 비중**: JS 89%, CSS 6.7%, HTML 4.3%
- **폴더 구조**: `Event`, `Window`, `Debugger`, `Taster`, `CSS`, `Map`, `docs`, `.vscode`
- **진입점**: `index.js → DebuggerTaster → 디버거 테스트 실행`

즉 지금은 "제품"이라기보다 **프레임워크의 코어 골격을 쌓는 단계**로 보입니다.

---

## 2. 현재 아키텍처

README에 명시된 구조를 3개 축으로 정리하면:

### 2.1 Event 시스템 (핵심 축)
| 컴포넌트 | 역할 |
|---|---|
| EventRepository | 이벤트 저장소 & 관리 |
| EventCaller | DOM 이벤트 감지 |
| EventInstance | 이벤트 실행 제어 |
| EventAction | 비즈니스 로직 단위 |
| resolve | 이벤트 처리 |

### 2.2 Window 시스템
`cwindow`(메인 윈도우) → `Windowbar`(상단바) → `WindowMenubar`(메뉴바) → `Closebar` / `Maxizebar` / `Minizebar` 순의 계층 구조. 버튼류는 `WindowButtonElement` / `WindowButtonEvent`라는 공통 기반 클래스를 통해 확장하는 방식이고, `WindowResizeEvent`가 리사이즈를 담당합니다.

### 2.3 Debugger / Taster 시스템
`cdebugger`가 로깅·메모리 모니터링·성능 측정을 담당하고, `SuperTaster` → `DebuggerTaster`로 이어지는 테스트 하네스가 이를 검증합니다. 흥미로운 점은 **진입점(index.js)이 곧바로 프로덕션 로직이 아니라 테스터를 실행**한다는 것 — 즉 지금은 배포용이 아니라 개발/검증 전용 진입점입니다.

### 아키텍처 성격 평가
- **장점**: Event / Window / Debugger가 명확히 분리되어 있고, Window 시스템은 상속(합성) 계층으로 버튼류를 재사용하도록 설계되어 있어 확장 의도가 뚜렷합니다.
- **리스크**: `EventRepository`가 "저장 + 관리"를 동시에 겸하고 있어, 프로젝트가 커지면 책임이 과중해질 潜재적 지점입니다. 또한 Window 시스템과 Event 시스템이 다이어그램상 완전히 분리된 subgraph로 그려져 있는데, 실제로는 버튼 클릭 → 이벤트 발생 → resolve 흐름으로 강하게 결합될 수밖에 없습니다. 이 결합 지점(누가 누구를 아는가)이 문서화되어 있지 않은 점이 향후 순환 의존성 위험입니다.

---

## 3. 현재 진도 평가

README 체크리스트 기준:

**완료 (✅)**
- 기본 프로젝트 구조, Event/Window 클래스 계층, Debugger 기능, Taster 기본 기능, CSS 스타일링

**진행 중 (🔄)** — *실질적으로 프레임워크의 심장부*
- Event 시스템의 `bind/unbind/call` 메서드 — 즉 지금은 **이벤트를 실제로 등록하고 실행하는 핵심 로직이 아직 없다**는 뜻입니다. 클래스 껍데기(구조)는 있지만 동작(behavior)은 미구현 상태로 추정됩니다.
- `WindowResizeEvent`의 모서리 감지 로직 — 창 리사이즈의 핵심 UX
- Window element 드래그 핸들링 개선

**예정 (📋)**
- Event/Window 인스턴스 고도화, "Code 해석 인스턴스" (아마도 스크립팅/매크로 실행 엔진으로 추정)

### 종합 판단
현재는 **"설계도는 그려졌고 골조는 세웠지만, 아직 이벤트가 흐르지 않는" 단계**입니다. 클래스/폴더 구조라는 스캐폴딩은 끝났고, 다음 관문은 `bind/unbind/call` 구현으로 Event 시스템이 실제로 동작하기 시작하는 것입니다. 이게 되어야 Window 시스템의 드래그/리사이즈도 연결되어 눈에 보이는 데모가 가능해집니다. 즉 **다음 마일스톤 하나(Event 실행 로직)가 프로젝트 전체의 병목**입니다.

커밋 수(9개)와 스타 0 / 컨트리뷰터 없음을 고려하면 개인 학습/사이드 프로젝트 초기 단계로 보이며, 이 시점에는 "기능을 더 넓히기"보다 "핵심 하나를 완전히 동작시키기"가 맞는 우선순위입니다.

---

## 4. 앞으로의 방향 제안

### 4.1 단기 (다음 스프린트)
1. **EventInstance.bind/unbind/call 구현을 최우선으로.** 여기가 뚫리기 전까지는 Window의 어떤 인터랙션도 실제 동작하지 않습니다.
2. **DebuggerTaster로 Event 시스템 단위 테스트 먼저 확보** — 이미 Taster 하네스가 있으니, `bind → call → resolve` 흐름에 대한 테스트 케이스를 먼저 작성한 뒤 구현하면(테스트 주도) 나중에 Window 시스템과 연결할 때 회귀를 잡기 쉽습니다.
3. **WindowResizeEvent의 모서리 감지**는 Event 시스템이 붙고 나서 착수 — 리사이즈도 결국 "이벤트 발생 → resolve" 흐름 위에 얹히는 기능이라, 순서를 바꾸면 이중 작업이 될 수 있습니다.

### 4.2 중기
4. **Event ↔ Window 결합 지점 문서화.** 어떤 Window 클래스가 어떤 EventAction을 호출하는지 다이어그램에 명시하면, 이후 "Code 해석 인스턴스"(예정 항목) 설계 시 순환 의존을 예방할 수 있습니다.
5. **Map 폴더의 역할이 README에 설명되어 있지 않습니다.** 창 배치/좌표 관리용으로 추정되나, 문서화가 필요합니다.

### 4.3 장기 (아키텍처 대안)
현재 구조(Repository-Caller-Instance-Action)는 사실상 **경량 Pub/Sub + Command 패턴**입니다. 이 자체는 나쁘지 않지만, 향후 창이 여러 개 동시에 뜨는 멀티 윈도우 데스크톱 환경을 목표로 한다면 아래를 검토해볼 만합니다:

- **중앙 상태 스토어 도입 검토**: 창 위치/크기/z-index 같은 상태가 각 cwindow 인스턴스에 분산되면, 나중에 "모든 창 최소화" 같은 전역 기능 추가 시 매번 EventRepository를 순회해야 합니다. Redux까진 아니어도, 얇은 WindowManager 싱글턴(현재 없음)을 두어 활성 창 목록·z-index 순서를 한 곳에서 관리하는 편이 확장에 유리합니다.
- **EventRepository 책임 분리**: "저장"과 "관리(조회/순회)"를 별도 클래스로 나누면(예: `EventStore` + `EventDispatcher`), 이후 이벤트 종류가 늘어날 때 테스트하기 쉬워집니다.
- **"Code 해석 인스턴스" 계획이 스크립팅 엔진이라면**, 지금 단계에서 미리 결정할 것: 자체 DSL을 만들지, 아니면 그냥 sandboxed JS(`new Function` 등 보안 고려)로 갈지. 이 결정은 Event 시스템의 API 형태(동기/비동기, 이벤트 이름 규칙)에 영향을 주므로 이르게 논의해두는 것이 좋습니다.

---

## 5. 요약 표

| 항목 | 상태 |
|---|---|
| 구조 설계 | ✅ 완료 — Event/Window/Debugger/Taster 계층 명확 |
| Event 실행 로직 (bind/unbind/call) | 🔴 미구현 — 전체 프로젝트의 병목 |
| Window 드래그/리사이즈 | 🔄 진행 중, Event 시스템 의존 |
| 테스트 하네스 | ✅ 존재 (Taster) — 활용도 확대 필요 |
| 문서화 | 🟡 README는 훌륭하나 Map 모듈, Event-Window 결합 지점 미문서화 |
| 협업/외부 기여 | ⚪ 없음 (개인 프로젝트, 스타 0) |

---

## 6. 추가로 확인하면 더 정확해지는 것들
다음 중 원하시는 걸 공유해주시면 아키텍처 리스크를 더 구체적으로 짚어드릴 수 있어요:
- `Event/` 폴더의 실제 클래스 파일들 (EventInstance, EventRepository 등)
- `Window/cwindow.js` 실제 구현
- 이 프로젝트의 최종 목표 — 학습용인지, 실제 배포할 프로덕트(웹 OS 데모 등)인지

