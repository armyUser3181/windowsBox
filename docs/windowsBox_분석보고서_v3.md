# windowsBox(CodeBox) 분석 보고서 v3

**전제 확인**: 말씀하신 대로, 지금은 "구현 단계"가 아니라 **구상/스켈레톤 단계**로 보고 다시 정리했습니다. 아래 내용은 "왜 안 됐냐"가 아니라 **"지금 짜둔 스켈레톤이 나중에 실제로 구현할 때 어떤 결정을 내려야 하는지"**에 초점을 맞췄습니다.

---

## 1. 지금 상태를 한 문장으로

Event 시스템 5개 파일(`EventAction`, `EventCaller`, `EventHandler`, `EventInstance`, `EventRepository`) 모두 **클래스 구조 + 타입 주석(JSDoc) + TODO 스텁**만 있고, 실제 로직은 없습니다. 즉 3차례 개정된 설계 문서(Plan → Improved → 쟁점 보고서)의 내용을 **그대로 클래스 뼈대와 JSDoc으로 옮겨 적어둔 상태**입니다. 이건 정상적인 순서고, 오히려 코드보다 설계가 먼저 정리된 프로젝트에서는 바람직한 흐름입니다.

다만 스켈레톤 단계에서도 **나중에 구현할 때 반드시 결정해야 할 갈림길 몇 개**가 이미 코드에 드러나 있어서, 그걸 정리해드리는 게 지금 시점에 가장 도움이 될 것 같습니다.

---

## 2. 스켈레톤에서 발견된, 구현 전에 결정해야 할 지점들

### 2.1 `resolve`는 잘 맞는데, `run()`이 사실은 아직 "실행"이 아니라 "가드"만 함
`EventInstance.run()`:
```js
run({ event, caller, action}) {
    if( event instanceof Event && caller instanceof EventCaller && action instanceof EventAction ) {
        this.resolve && this.resolve({ event, caller, action, eventInstance: this });
    }
}
```
타입 가드는 깔끔합니다. 다만 이 함수를 **누가, 언제 호출하는지**가 아직 어디에도 없습니다 (`EventCaller.call()`이 TODO). 나중에 구현 순서를 정할 때 "`EventRepository`가 DOM 이벤트를 받아서 → 어떤 `EventCaller`인지 찾고 → 그 caller와 연결된 `EventInstance.run()`을 호출"하는 한 줄짜리 흐름을 먼저 손으로 그려보고 코드를 짜는 걸 추천합니다. 지금 세 파일(Repository/Caller/Instance)의 TODO가 서로 "누가 먼저 채워져야 다음 게 채워지는지" 순환 참조처럼 얽혀 있어서, 자칫하면 어디부터 손대야 할지 헷갈리기 쉽습니다.

**제안하는 구현 순서**: `EventRepository.renew()` (resolver 생성) → `EventCaller.bind()` (repository에 등록) → `EventRepository.bind()` (실제 DOM에 리스너 부착) → `EventCaller.call()` (실행 시 EventInstance 찾기) → `EventInstance.run()` (이미 완성됨).

### 2.2 키 타입이 스켈레톤 안에서 이미 엇갈려 있음
`EventRepository`의 JSDoc:
```js
/** @type {Map<Symbol, Function>} */
this.resolverMap = new Map();
/** @type {Map<Symbol, import("./EventInstance.js").default>} */
this.eventInstanceMap = new Map();
```
→ **Symbol을 키로 쓰겠다**고 명시.

그런데 실제 메서드는:
```js
push(eventInstance) {
    if (!eventInstance || !eventInstance.id) return;
    this.eventInstanceMap.set(eventInstance.id, eventInstance);
}
```
→ **`.id`(문자열)를 키로 사용**.

그리고 `EventInstance` 쪽을 보면:
```js
this.id = id;
this.symbol = Symbol(id);
```
`id`(문자열)와 `symbol`(Symbol) 둘 다 갖고 있는데, `symbol`은 지금 아무 데서도 안 쓰입니다. **아마 "Map의 키를 Symbol로 바꾸려던 흔적"인데, `push()`를 구현할 때 깜빡하고 예전 방식(`.id`)으로 적어둔 것**으로 보입니다.

이건 사소해 보이지만 실제로 결정하고 넘어가야 하는 지점이에요:
- **문자열 `id` 키 방식**: 디버깅할 때 로그에 "instance-close-button" 같은 이름이 그대로 찍혀서 읽기 편함. 다만 이름이 겹치면 덮어써짐.
- **`Symbol` 키 방식**: 절대 충돌 안 함(고유성 보장). 다만 콘솔에 찍었을 때 `Symbol(close)`처럼 나와서 로그 가독성이 떨어지고, 이전 대화에서 나온 "WeakMap 적용"도 이 경우엔 가능해집니다(Symbol/객체는 WeakMap 키가 될 수 있으니, 이전 설계 문서의 WeakMap 언급과 앞뒤가 맞으려면 오히려 이 Symbol 방향이 정답에 가깝습니다).

**제안**: `id`는 사람이 읽는 이름(로깅/디버깅용)으로, `symbol`은 실제 Map 키로 용도를 나눠서 통일하세요. 지금처럼 두 개를 만들어놓고 하나만 쓰는 상태로 두면, 나중에 `push`/`remove`/`renew`를 다 구현한 뒤에 "어? symbol은 왜 있지?" 하고 다시 고민하게 됩니다.

### 2.3 `EventAction`의 `caller`라는 이름이 두 가지 다른 의미로 쓰이고 있음
```js
constructor({ id = "", caller = null, action = null } = {}) {
    this.caller = caller;   // 여기서 caller는 그냥 "콜백 함수"
    this.action = action;
}
run({event: event}) {
    return this.caller && this.caller({event: event}) || this.action && this.action({event: event});
}
```
이 파일에서 `caller`는 **콜백 함수**를 가리킵니다. 그런데 프로젝트 전체 설계(`EventInstancePlan.md` 등)에서 `caller`는 줄곧 **`EventCaller` 클래스의 인스턴스**를 가리키는 용어로 쓰였습니다. 같은 단어가 파일마다 다른 걸 가리키는 상태라, 나중에 두 시스템을 연결할 때 "이 `caller`가 그 `EventCaller` 객체야, 아니면 그냥 함수야?"를 매번 문맥으로 판단해야 합니다. `action`의 하위 속성 이름을 `caller` 대신 `initializer`나 `onInit` 같은 걸로 바꾸는 걸 추천합니다(설계 문서에도 "callor: action을 호출합니다, 필요한 초기화 과정을 실행합니다"라고 되어 있어서, 이름 자체가 "초기화 콜백"에 가깝습니다).

추가로 `run()`의 로직도 짚어드릴게요:
```js
return this.caller && this.caller({event}) || this.action && this.action({event});
```
`this.caller({event})`가 falsy(`0`, `""`, `false`, `undefined` 등)를 반환하면 `||` 때문에 **`this.action({event})`도 이어서 실행**됩니다. 지금은 둘 다 없어서(둘 다 `null`) 문제가 안 보이지만, 나중에 실제로 `caller`와 `action`을 둘 다 채워 넣는 순간 "caller가 실패하면 action으로 대체 실행"이라는, 아마 의도하지 않았을 이중 실행이 발생할 수 있습니다. `if (this.caller) return this.caller({event}); if (this.action) return this.action({event});` 형태로 명확히 나누는 걸 추천합니다.

### 2.4 `EventCaller.js`에 남은 정리 대상
파일 끝에:
```js
export const debugCode = args => {
    
}
```
빈 함수가 export되어 있습니다. 디버깅용으로 남겨둔 스캐폴딩 같은데, 지금은 아무 데서도 import되지 않는 죽은 export입니다. 나중에 실제 디버깅 훅으로 쓸 계획이면 목적을 주석으로 한 줄 남겨두시고, 아니라면 정리 대상입니다.

또한 `import EventRepository from "./EventRepository.js"`를 하고 있는데 실제로는 JSDoc 타입 주석에서만 쓰이고 코드 로직에서는 안 쓰입니다. 지금은 문제없지만, **`EventRepository`가 나중에 `EventCaller`를 import하게 되면(리스너 등록 로직 구현 시 거의 확실히 그렇게 됨) 순환 import**가 생깁니다. ES 모듈은 순환 import를 허용은 하지만 초기화 순서 버그의 흔한 원인이라, `bind()`를 구현하는 시점에 "누가 누구를 import하는가"를 한 번 더 점검하시길 권합니다 — 이건 이전 설계 문서(`EventSystem_구조_쟁점_보고서.md`)에서 이미 우려했던 지점과 정확히 같은 문제입니다.

### 2.5 `EventHandler.js`는 여전히 빈 껍데기
이름만 보면 `EventCaller`(감지) / `EventInstance`(실행) / `EventAction`(로직)과 뭐가 다른 역할인지 코드나 문서 어디에도 설명이 없습니다. PROJECT_OVERVIEW.md에서도 "(프레임워크용, 현재 비어있음)"이라고만 되어 있어서, **이 클래스가 정확히 뭘 하려는 건지 먼저 한 문단으로 정의**해두시는 게, 나중에 "어, 이거 EventInstance랑 겹치는데?" 하는 상황을 막아줄 것 같습니다.

---

## 3. `eventCallerMap`이 설계와 다르게 방치되어 있음
`EventRepository`는 `eventCallerMap`을 필드로 선언은 했지만, `push`/`remove`는 `eventInstanceMap`에 대해서만 존재하고 **caller를 등록/해제하는 메서드가 없습니다.** 설계 문서(Improved)에서는 "`eventCallerMap`: EventCaller 객체를 모아두는 맵"이라고 되어 있어서, `EventInstance`처럼 `pushCaller`/`removeCaller` 같은 대칭 메서드가 필요할 것으로 보입니다. 지금 상태로는 caller 쪽 등록 경로가 아예 설계도에서만 존재하고 스켈레톤에는 반영이 안 된 상태예요.

---

## 4. 종합 — 지금 시점에서 정리하면 좋은 것 (구현 착수 전 체크리스트)

구현에 들어가기 전에, 아래 다섯 가지만 먼저 결정해두시면 이후 작업이 훨씬 매끄러울 것 같습니다.

1. **Map 키를 `id`(문자열)로 갈지 `symbol`로 갈지 하나로 통일** — 지금은 선언은 Symbol, 실제 코드는 id로 엇갈려 있음
2. **`EventAction`의 `caller` 필드명을 바꿔서 `EventCaller`와의 용어 혼동 제거**
3. **`EventAction.run()`의 `||` 폴백 로직을 의도한 동작인지 재확인** (아니면 명시적 if-분기로)
4. **`eventCallerMap`용 push/remove 메서드 추가** — 지금은 instance만 대칭적으로 관리되고 caller는 안 됨
5. **`EventHandler`의 정확한 역할 한 문단으로 정의** — 없으면 나중에 EventInstance와 책임이 겹칠 위험

이 다섯 개는 전부 "코드를 얼마나 쓰느냐"의 문제가 아니라 **"이름과 타입을 미리 통일해두는" 설계 마무리 작업**이라, 지금처럼 아직 로직을 채우기 전 단계에서 정리하는 게 나중에 다시 뜯어고치는 것보다 훨씬 쌉니다.

---

## 5. 참고 — 지난 보고서에서 계속 이어지는 이슈
- Window 시스템(`cwindow` 등)과 Event 시스템 사이의 연결 지점은 여전히 코드상 확인되지 않음(둘 다 스켈레톤 단계라 당연함)
- `index.js`가 아직 아무 시스템도 실제로 기동시키지 않는 것도 동일 — 다만 지금이 "구상 단계"라는 전제를 확인했으니, 이 부분은 문제라기보다는 **다음 단계에서 첫 통합 지점을 어디로 잡을지 결정할 대상**으로 다시 정리했습니다.
