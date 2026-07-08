# windowsBox(CodeBox) 프로젝트 분석 보고서 v2

**분석일**: 2026-07-05
**근거**: 실제 소스 코드(Window.js, Debugger.js, window.css, index.html, index.js) + 프로젝트 내부 설계 문서 8건 직접 확인
**이전 보고서와의 차이**: 이전에는 README만 보고 추정했던 부분을, 이제 실제 코드로 검증/수정함

---

## 1. 가장 먼저 짚어야 할 것 — "지금 이 프로젝트는 아무것도 실행되지 않는다"

`index.js` 전체입니다:

```js
import DebuggerTaster from "./Taster/DebuggerTaster.js";
const taster = new DebuggerTaster;
```

`cwindow`를 import조차 하지 않습니다. 즉 **Window 시스템 코드는 지금 브라우저에서 단 한 번도 실행되지 않는 죽은 코드(dead code)**입니다. `index.html`에 떠 있는 `.c_default_window` DOM은 JS가 만든 게 아니라 **손으로 직접 써넣은 정적 HTML**이고, `window.css`도 그 정적 HTML에 맞춰 손으로 스타일링한 것입니다.

이건 이전 보고서에서 "Event 실행 로직이 미구현이라 병목"이라고 했던 것보다 한 단계 더 근본적인 문제예요. **병목은 Event가 아니라, "JS 클래스와 실제 DOM이 아예 연결되어 있지 않다"는 것**입니다. Event 시스템이 완성되어도, `cwindow`를 생성하고 DOM에 붙이는 코드가 없으면 여전히 화면엔 변화가 없습니다.

---

## 2. Window 시스템 실제 코드 검증

```js
export default class cwindow {
    constructor() {
        this.windowbar = new Windowbar;
        this.windowSizebar = new WindowSizebar;
    }
}
```

- **DOM 참조가 전혀 없습니다.** `document.querySelector`도, `render()`도, `mount()`도 없습니다. `cwindow`를 생성해도 이미 `index.html`에 박혀 있는 `.c_default_window`와는 아무 관계도 맺지 않습니다. 즉 지금은 "정적 HTML 목업"과 "JS 클래스 계층"이라는 **두 개의 서로 다른 세계**가 이름만 같고(`windowbar` class ↔ `defalut_windowbar` CSS 클래스) 실제로는 분리되어 있는 상태입니다.
- **`WindowSizebar` 파일이 실제로 없습니다.** import는 되어 있는데 업로드된 파일 목록에도 없고, 프로젝트 자체 문서(`초기_window_보고서.md`, `진행상황_요약.md`)에서도 이미 "파일 누락 가능성"으로 지적된 상태입니다. → **이 상태로는 `index.js`가 `cwindow`를 import하는 순간 즉시 런타임 에러가 납니다.**
- `WindowButtonElement`도 빈 클래스로 확인(문서 기준)되어, Closebar/Maxizebar/Minizebar가 상속은 하지만 실제 동작(클릭 핸들러 등)은 없는 상태입니다.

**결론**: Window 시스템은 "클래스 상속 계층을 그려본 것"이지, "동작하는 UI 컴포넌트"가 아직 아닙니다.

---

## 3. Debugger 시스템 — 유일하게 실제로 동작하는 부분

`Debugger.js`는 프로젝트에서 유일하게 **완결된 실제 구현**입니다.
- `log`, `error`, `printMemoryUsage`, `measure` 모두 실제로 동작합니다.
- `#print`를 private 메서드로 분리해 문자열/객체 포맷을 나눈 것도 깔끔합니다.

다만 사소한 지점 두 가지:
1. **`log()`와 `error()`가 완전히 동일한 로직**입니다 (`this.#print`에 넘기는 접두어도 동일). 지금은 콘솔에 찍히는 형태가 구분이 안 됩니다 — `error()`는 최소한 `console.error`를 쓰거나 `[ERROR]` 접두사를 붙이는 게 디버깅 시 유용합니다.
2. **`debuggingMode`가 기본 `false`**이고, `index.js`가 `debuggingModeOn()`을 호출하지 않으므로, 지금 이 프로젝트를 그냥 실행하면 **Debugger가 있어도 로그가 하나도 안 찍힙니다.** (DebuggerTaster 내부에서 켜고 있을 가능성은 있지만, 해당 파일은 이번에 확인 못 했습니다.)

---

## 4. Event 시스템 — "코드는 0줄, 설계는 세 번 개정"

이 부분이 이번 분석에서 가장 흥미로운 지점입니다. **Event 관련 실제 `.js` 파일은 이번 업로드에 하나도 없고**, 대신 설계 문서만 세 개(`EventInstancePlan.md` → `EventInstancePlanImproved.md` → `EventSystem_구조_쟁점_보고서.md` → `EventCaller_구조_중간안_보고서.md`) 존재합니다. 즉 **코드를 짜기 전에 설계를 상당히 진지하게 반복 검토한 상태**입니다 — 이건 나쁜 신호가 아니라 오히려 이 프로젝트에서 가장 성숙한 부분입니다.

### 설계의 진화 과정 요약
1. **1차안(Plan)**: `EventInstance`가 `EventCaller`를 직접 소유하는 단순 구조.
2. **2차안(Improved)**: `EventRepository`를 중앙 관리자로 두고, `Caller`와 `Instance`를 각각 등록만 하는 방식으로 분리.
3. **3차안(쟁점 보고서)**: 분리하고 나니 "누가 호출했는지 인스턴스가 어떻게 아는가", "메모리 생명주기는 누가 관리하는가" 라는 새 문제가 생겨서, 다음으로 수렴:
   - `EventCaller`가 이벤트 발생 시 `callerId`, `eventName`, `target`, `sourceContext`를 **명시적으로 EventInstance에 전달**(분기는 이 컨텍스트로 처리)
   - `Caller`/`Instance` 간 강한 상호 참조 금지, `currentCaller`만 실행 중 일시적으로 유지
   - 생명주기(등록/해제)는 레지스트리가 담당, 단 레지스트리는 "연결 정보 저장 + 해제 처리"에만 집중하고 비대해지지 않게 주의
4. **중간안(EventCaller 구조)**: `callerId -> instanceId` 단순 맵 방식(옵션 A)을 현재 프로젝트 규모에 맞는 현실적 선택으로 확정.

이 흐름 자체는 **아주 합리적인 설계 의사결정 과정**입니다. 다만 지적할 점:

- **재진입(re-entrancy) 방지가 설계 문서에는 언급되지만 구체적 메커니즘이 없습니다.** "재진입 방지 플래그를 둘 수 있다"는 정도로만 적혀 있어서, 실제 구현 시 `EventRepository`가 "현재 처리 중" 상태를 어떤 자료구조로 추적할지(Set? 카운터?) 다음 문서에서 구체화가 필요합니다.
- **`WeakMap` 언급은 있지만 실제 적용 대상이 불명확**합니다 — `callerId -> instanceId` 맵(옵션 A, 채택안)은 문자열 키 기반이라 애초에 `WeakMap`을 쓸 수 없습니다(WeakMap 키는 객체여야 함). 즉 "옵션 A(문자열 맵) 채택" + "WeakMap으로 약한 참조" 권고가 **문서 내에서 서로 살짝 모순**됩니다. 실제 구현 시 `callerId`를 키로 쓸지, `caller` 객체 자체를 키로 쓸지부터 결정해야 합니다.

---

## 5. 실제 코드 vs 설계 문서 간의 갭 정리

| 영역 | 설계 문서 상태 | 실제 코드 상태 |
|---|---|---|
| EventRepository/Caller/Instance | 3차 개정, 구조 확정 단계 | **파일 없음 (0줄)** |
| Window (cwindow, Windowbar 등) | 문서상 계층 구조 정리됨 | 생성자만 존재, DOM 연결 없음, WindowSizebar 파일 누락 |
| Debugger | 별도 설계 문서 없음 | **완전히 동작함** (유일하게) |
| index.js (통합 지점) | — | DebuggerTaster만 호출, cwindow 생성 안 함 |

이 표가 말해주는 것: **설계 역량과 구현 진도가 크게 어긋나 있습니다.** Event 시스템은 설계가 코드보다 훨씬 앞서 있고, Window 시스템은 반대로 코드(클래스 껍데기)만 있고 설계 문서가 상대적으로 얕습니다(초기 구조 보고서 하나뿐, 그것도 "추정"이라는 표현이 반복됨).

---

## 6. 앞으로의 방향 (수정된 우선순위)

이전 보고서에서는 "Event bind/unbind/call 구현이 최우선"이라고 했는데, 실제 코드를 보고 나니 **순서를 좀 더 세분화해야 합니다.**

### 즉시 (이번 작업 블록)
1. **`WindowSizebar.js` 파일부터 만들기.** 지금 상태로 `cwindow`를 import하면 바로 깨집니다. 최소한 빈 클래스라도 만들어서 런타임 에러부터 없애야 다음 단계 테스트가 가능합니다.
2. **`index.js`에 `cwindow` 인스턴스 생성 + DOM 마운트 로직 추가.** `cwindow` 생성자에 `document.querySelector('.c_default_window')` 같은 실제 요소 참조를 받는 파라미터를 추가하거나, `mount(el)` 메서드를 만들어서 최소한 "JS 객체와 화면의 DOM이 연결되어 있다"는 사실 하나는 확인 가능하게 만드세요. 지금은 이걸 확인할 방법이 아예 없습니다.

### 단기
3. **Event 시스템 구현은 3차 설계안(쟁점 보고서) 기준으로, 단 WeakMap 모순부터 해결하고 시작.** 제 제안: `callerId -> instanceId` 문자열 맵(빠른 구현)으로 먼저 동작시키고, 나중에 실제로 메모리 누수가 관측되면 그때 참조 구조를 객체 키 기반으로 바꾸는 게 낫습니다. 지금 단계에서 WeakMap까지 고민하는 건 최적화 조로 시기상조입니다 (YAGNI).
4. **재진입 방지 로직을 구체적인 자료구조로 명시.** 예: `EventRepository`에 `this.#executing = new Set()` 두고, `resolve` 시작 시 `instanceId`를 넣고 끝나면 빼는 방식. 이 정도만 정해도 "플래그를 둘 수 있다" 수준의 모호함이 해소됩니다.
5. **Debugger의 `log`/`error` 구분** — `console.error` 사용 또는 접두사 차별화로 5분 내 해결 가능한 개선.

### 중기
6. **Window 시스템도 Event 시스템만큼 설계 문서를 써보길 권합니다.** 지금 Window 쪽은 "정적 HTML을 보고 클래스 이름을 지었다" 수준이라, Event 시스템처럼 "이 버튼 클릭 시 어떤 EventInstance로 연결되는가"를 문서로 먼저 정리하면 두 시스템을 연결할 때 시행착오가 줄어듭니다.
7. **index.html의 정적 마크업을 유지할지, cwindow가 완전히 동적으로 생성하게 바꿀지 결정 필요.** 지금처럼 정적 HTML + 별도 JS 클래스 계층이 공존하면, 나중에 창을 여러 개 띄우는 기능(멀티 윈도우)을 넣을 때 `.c_default_window` 하나짜리 정적 마크업 구조가 발목을 잡습니다. 개인적으로는 **cwindow가 자기 DOM을 직접 생성하는 방식(템플릿 리터럴이나 `document.createElement`)으로 전환**하는 걸 추천합니다 — 그래야 창 인스턴스를 N개 만들 수 있습니다.

---

## 7. 요약

| 항목 | 이전 보고서(README 기반) 판단 | 실제 코드 확인 후 판단 |
|---|---|---|
| Event 시스템 | "구조는 있고 실행 로직만 없음" | **파일 자체가 없음. 대신 설계 문서 3회 개정이라는 예상 밖 성과 확인** |
| Window 시스템 | "계층 설계 완료" | 계층은 있으나 DOM과 완전히 분리, 참조 파일 누락으로 즉시 에러 위험 |
| 병목 지점 | "Event의 bind/unbind/call" | **"index.js가 cwindow를 호출조차 안 함" — 더 앞단의 통합 부재** |
| Debugger | 완성으로 추정 | **확인됨. 유일하게 실제로 잘 동작하는 모듈**, 단 기본 꺼짐 상태 |

**한 줄 총평**: 설계 문서 수준은 상당히 높은데(특히 Event 쟁점 보고서는 실무 수준의 고민), 그 설계를 코드로 옮기는 작업과 이미 있는 코드 조각들(cwindow, Debugger)을 서로 연결하는 "배선" 작업이 다음 단계에서 가장 시급합니다. 지금 우선순위는 새 기능 추가가 아니라 **"있는 것들끼리 일단 연결해서 눈에 보이는 결과 하나 만들기"**입니다.
