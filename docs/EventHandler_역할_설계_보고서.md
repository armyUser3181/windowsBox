# EventHandler 역할 설계 보고서

## 1. 배경

현재 EventRepository가 너무 많은 책임을 맡고 있습니다.

- 연결 정보 저장
- 이벤트 리스너 바인딩
- 이벤트 라우팅
- 실행 흐름 제어

이로 인해 다음 문제가 발생할 수 있습니다.

- 코드가 복잡해짐
- 단일 책임 원칙 위반
- 확장 시 수정 범위가 넓어짐

따라서 `EventHandler`를 도입하여 실행 관리 책임을 분리합니다.

---

## 2. 목표

`EventHandler` 도입의 목표는 다음 세 가지입니다.

- `EventRepository`는 저장소 역할에만 집중한다.
- `EventHandler`는 실행 흐름 제어를 담당한다.
- 두 객체의 책임을 명확히 분리한다.

---

## 3. EventHandler의 역할

### 3.1 핵심 책임

`EventHandler`는 다음 역할만 담당합니다.

- 이벤트 라우팅: `EventCaller`에서 발생한 이벤트를 적절한 `EventInstance`로 전달
- 실행 컨텍스트 관리: 실행 중인 caller, event 정보 추적
- 실행 순서 제어: 여러 인스턴스가 실행될 때의 순서 및 우선순위 관리
- 재진입 방지: 순환 호출 방지 및 실행 상태 추적

즉, `EventHandler`는 "이벤트 실행 관리자" 역할을 합니다.

### 3.2 하지 않는 것

`EventHandler`는 다음 역할을 하지 않습니다.

- 연결 정보 저장 (이건 `EventRepository`의 역할)
- DOM 이벤트 리스너 직접 등록 (이건 `EventRepository.bind()`의 역할 - resolver 등록)
- 비즈니스 로직 실행 (이건 `EventInstance`의 역할)

---

## 4. EventRepository와의 분리

### 4.1 EventRepository의 역할 (분리 후)

분리 후 `EventRepository`는 다음 역할만 담당합니다.

- `EventCaller` 등록/해제
- `EventInstance` 등록/해제
- 연결 정보 저장 (`callerId -> instanceId` 맵)
- 연결 정보 조회 API 제공

### 4.2 EventHandler의 역할 (분리 후)

`EventHandler`는 다음 역할을 담당합니다.

- `EventRepository`에서 연결 정보 조회
- 이벤트 발생 시 적절한 `EventInstance` 찾기
- `EventInstance.run()` 호출
- 실행 컨텍스트 전달 (`callerId`, `eventName`, `target` 등)
- 실행 상태 추적 및 재진입 방지

### 4.3 협력 방식

```text
EventCaller → EventHandler → EventRepository → EventInstance
```

구체적인 흐름:

1. `EventCaller`가 이벤트를 감지
2. `EventCaller`가 `EventHandler.handleEvent()` 호출
3. `EventHandler`가 `EventRepository`에서 연결된 `EventInstance` 조회
4. `EventHandler`가 `EventInstance.run()` 호출 (컨텍스트 포함)
5. `EventInstance`가 실행 로직 수행

---

## 5. 구조 예시

### 5.1 클래스 구조

```javascript
class EventRepository {
    constructor() {
        this.eventCallerMap = new Map();      // callerId -> EventCaller
        this.eventInstanceMap = new Map();    // instanceId -> EventInstance
        this.connectionMap = new Map();        // callerId -> instanceId[]
    }

    registerCaller(caller) { }
    unregisterCaller(callerId) { }
    registerInstance(instance) { }
    unregisterInstance(instanceId) { }
    getInstancesByCaller(callerId) { }
}

class EventHandler {
    constructor(repository) {
        this.repository = repository;
        this.executingInstances = new Set();   // 실행 중인 인스턴스 추적
    }

    handleEvent({ callerId, event, target }) {
        // 재진입 방지 체크
        // repository에서 연결된 인스턴스 조회
        // EventInstance.run() 호출
    }

    isExecuting(instanceId) { }
}
```

### 5.2 사용 예시

```javascript
const repository = new EventRepository();
const handler = new EventHandler(repository);

// 등록
repository.registerCaller(caller);
repository.registerInstance(instance);
repository.connect(caller.id, instance.id);

// 실행
caller.onEvent = (event) => {
    handler.handleEvent({
        callerId: caller.id,
        event: event,
        target: caller.target
    });
};
```

---

## 6. 장점

### 6.1 책임 분리가 명확함

- `EventRepository`: 데이터 저장 및 조회
- `EventHandler`: 실행 흐름 제어

단일 책임 원칙을 준수하게 됩니다.

### 6.2 테스트가 쉬워짐

- `EventRepository`는 저장 로직만 테스트
- `EventHandler`는 실행 로직만 테스트
- 모의 객체 사용이 용이해짐

### 6.3 확장성이 높아짐

나중에 다음 기능 추가하기 쉬움:

- 이벤트 우선순위 큐
- 비동기 실행 관리
- 이벤트 필터링/인터셉터
- 실행 로깅 및 모니터링

### 6.4 레지스트리 과부하 방지

`EventRepository`가 너무 많은 책임을 맡는 것을 방지합니다.

---

## 7. 단점과 주의점

### 7.1 초기 설정이 조금 늘어남

- `EventRepository` 외에 `EventHandler`도 생성해야 함
- 두 객체의 연결 설정이 필요함

하지만 이 비용은 장기적인 유지보수성에 비하면 작습니다.

### 7.2 계층이 하나 늘어남

- `EventCaller` → `EventHandler` → `EventInstance`
- 간접 참조가 하나 늘어남

하지만 이는 책임 분리의 이점으로 상쇄됩니다.

### 7.3 인터페이스 설계가 중요함

- `EventHandler`와 `EventRepository` 사이의 인터페이스를 잘 설계해야 함
- 너무 많은 정보를 전달하면 결합도가 올라감

---

## 8. API 설계 제안

### 8.1 EventHandler API

```javascript
class EventHandler {
    constructor(repository);

    // 이벤트 처리
    handleEvent({ callerId, event, target, eventName });

    // 실행 상태 관리
    isExecuting(instanceId);
    getExecutingCount();

    // 실행 제어
    pause();
    resume();
    clear();
}
```

### 8.2 EventRepository API (수정)

```javascript
class EventRepository {
    // 기존 기능 유지
    registerCaller(caller);
    unregisterCaller(callerId);
    registerInstance(instance);
    unregisterInstance(instanceId);

    // 연결 관리 추가
    connect(callerId, instanceId);
    disconnect(callerId, instanceId);
    getInstancesByCaller(callerId);
    getCallersByInstance(instanceId);
}
```

---

## 9. 실행 흐름 상세

### 9.1 정상 실행 흐름

```
1. EventCaller가 DOM 이벤트 감지
2. EventCaller.call(event) 호출
3. EventHandler.handleEvent({ callerId, event, target }) 호출
4. EventHandler가 EventRepository.getInstancesByCaller(callerId) 호출
5. EventRepository가 연결된 EventInstance[] 반환
6. EventHandler가 각 EventInstance.run({ event, callerContext }) 호출
7. EventInstance가 resolve() 실행
```

### 9.2 재진입 방지 흐름

```
1. EventHandler.handleEvent() 시작
2. executingInstances Set에 현재 instanceId 추가
3. EventInstance.run() 실행
4. 실행 중 같은 instanceId로 다시 handleEvent() 호출 시도
5. executingInstances에 이미 있으므로 무시 또는 큐에 대기
6. 실행 완료 후 executingInstances에서 제거
```

---

## 10. 결론

`EventHandler` 도입은 다음 이유로 추천됩니다.

1. **책임 분리**: 저장소와 실행 관리를 명확히 분리
2. **확장성**: 나중에 실행 관련 기능 추가하기 쉬움
3. **테스트 용이성**: 각 계층을 독립적으로 테스트 가능
4. **유지보수성**: 코드가 더 읽기 쉽고 수정 범위가 명확해짐

가장 현실적인 설계는 다음과 같습니다.

> `EventRepository`는 연결 정보 저장만 담당하고,
> `EventHandler`는 실행 흐름 제어를 담당하는 구조

이 방식은 현재 프로젝트의 규모와 목표에 가장 잘 맞는 균형안입니다.
