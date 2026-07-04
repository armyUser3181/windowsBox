# Event System Design

## 1. EventRepository (이벤트 저장소)
EventCaller들을 태그에 맞게 저장하고 바인딩합니다.

- 성질
  - HTML 요소(`HTMLElement`)에 직접 접근해 리스너를 작동시킵니다.
- 하위 속성
  - `resolverMap`: 이벤트 유형과 리스너를 연결하는 함수 맵입니다.
  - `eventCallerMap`: EventCaller 객체를 모아두는 맵입니다.
  - `eventInstanceMap`: EventInstance 객체를 저장하는 맵입니다.
  - `bound`: 현재 바인딩 상태를 나타냅니다.
- 메서드
  - `bind()`: resolver들을 실제 DOM 리스너에 등록합니다.
  - `unbind()`: resolver와 DOM 리스너 간의 연결을 해제합니다.
  - `renew()`: 등록된 EventCaller에 맞는 resolver를 새로 생성하거나 갱신합니다.
  - `push(eventInstance)`: EventInstance를 저장소에 추가하고, EventInstance가 자신을 참조하도록 합니다.
  - `remove(eventInstance)`: EventInstance를 저장소에서 제거합니다.

### 관계
- `EventRepository`는 `EventCaller`와 `EventInstance`를 관리하는 중앙 저장소입니다.
- `EventCaller`가 바인딩되면 repository에 등록되어 DOM 이벤트를 수신합니다.

---

## 2. EventCaller (이벤트 호출자)
조건에 따라 EventInstance를 호출하고 활성화 여부를 관리합니다.

- 성질
  - 자체 활성화/비활성화를 제어할 수 있는 호출 객체입니다.
- 하위 속성
  - `repository`: 바인딩할 EventRepository입니다.
  - `eventName`: 이벤트 이름(`click`, `mousedown` 등)입니다.
  - `target`: 이벤트 대상 요소 또는 선택자입니다.
  - `bound`: 현재 repository에 등록된 상태를 나타냅니다.
- 메서드
  - `bind()`: repository에 자신을 등록하고 이벤트 수신을 활성화합니다.
  - `unbind()`: repository에서 자신을 제거하여 이벤트 처리를 중지합니다.

### 관계
- `EventCaller`는 `EventInstance`를 호출하는 계단 역할을 합니다.
- `EventRepository`가 `EventCaller`를 통해 DOM 이벤트를 실제로 연결합니다.

---

## 3. EventInstance (이벤트 인스턴스)
실제 실행을 담당하는 독립적인 이벤트 제어 단위입니다.

- 성질
  - 주요 로직에 따라 분기하며 동작하는 핵심 객체입니다.
- 하위 속성
  - `repository`: 자신을 등록한 EventRepository입니다.
  - `callers`: EventCaller 객체들의 집합입니다.
  - `actions`: 실행할 비즈니스 로직 함수들의 목록입니다.
  - `resolve`: action들을 호출하고 흐름을 제어하는 함수입니다.
- 메서드
  - `bind()`: EventRepository에 등록하여 관련 EventCaller들을 활성화합니다.
  - `unbind()`: repository에서 자신을 제거하여 실행 엔진에서 제외합니다.

### 관계
- `EventInstance`는 `EventCaller`를 통해 특정 이벤트가 발생했을 때 실행됩니다.
- `EventCaller`는 자신과 연관된 `EventInstance`를 호출합니다.

---

## 4. Action (액션)
이벤트 발생 시 수행되는 비즈니스 로직의 최소 단위입니다.

- 성질
  - 독립적인 클래스 또는 객체로 존재하며 자체 실행 구조를 가집니다.
- 하위 속성
  - `caller`: 액션을 호출하는 주체 또는 초기화 정보입니다.
  - `action`: 실제 실행될 함수 또는 메서드입니다.
  - `id`: 액션을 구분하는 고유 식별자입니다.
- 메서드
  - `run(context)`: 실행 시 필요한 데이터를 받아 처리합니다.

### 관계
- `EventInstance`는 여러 `Action`을 조합해 실제 동작을 수행합니다.
- `Action`은 `EventInstance`의 실행 단위로서 비즈니스 로직을 분리합니다.

---

## 설계 요약

- `EventRepository`는 이벤트 등록/해제와 객체 관리를 담당하는 중앙 엔진입니다.
- `EventCaller`는 DOM 이벤트를 받아서 적절한 `EventInstance`로 전달하는 호출자입니다.
- `EventInstance`는 이벤트 발생 시 처리 로직을 실행하는 실행 단위입니다.
- `Action`은 구체적인 비즈니스 동작을 캡슐화한 작은 실행 단위입니다.

> 용어 정리: `bound`는 바인딩 상태를, `repository`는 이벤트 객체 저장소를 뜻합니다.