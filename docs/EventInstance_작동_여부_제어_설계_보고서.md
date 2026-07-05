# EventInstance 작동 여부 제어 설계 보고서

## 1. 배경

현재 `EventInstance`는 단순히 `bound` 속성 하나로 바인드 여부를 관리합니다.

```javascript
this.bound = false;
```

하지만 이 방식에는 다음 한계가 있습니다.

- 바인드 여부와 실제 작동 여부가 혼재됨
- 연결은 유지하되 일시적으로 비활성화하는 기능이 없음
- 복잡한 활성화 조건을 표현하기 어려움

따라서 더 유연한 작동 여부 제어 방식이 필요합니다.

---

## 2. 목표

작동 여부 제어 개선의 목표는 다음 세 가지입니다.

- 바인드 여부와 작동 여부를 분리한다.
- 일시적 비활성화 기능을 제공한다.
- 향후 복잡한 활성화 조건을 추가하기 쉽게 만든다.

---

## 3. 제안하는 설계

### 3.1 핵심 아이디어

`enabled` 속성과 `isEnabled()` 함수를 추가하여 작동 여부를 유연하게 제어합니다.

```javascript
class EventInstance {
    enabled = true;  // 작동 여부 속성
    bound = false;   // 바인드 여부 속성
    
    isEnabled() {
        return this.enabled && this.bound;
    }
    
    activate() {
        this.enabled = true;
    }
    
    deactivate() {
        this.enabled = false;
    }
}
```

### 3.2 속성 의미

- `bound`: repository에 등록되어 있는지 여부
  - `true`: repository에 연결 정보가 있음
  - `false`: repository에서 연결이 끊어짐
  
- `enabled`: 실제로 작동할지 여부
  - `true`: 이벤트 발생 시 실행함
  - `false`: 이벤트 발생 시 실행하지 않음 (연결은 유지)

### 3.3 작동 조건

`EventInstance`가 작동하려면 두 조건이 모두 충족되어야 합니다.

```javascript
isEnabled() {
    return this.enabled && this.bound;
}
```

---

## 4. 구현 예시

### 4.1 클래스 구조

```javascript
export default class EventInstance {
    constructor({ id = "", repository, callers = [], actions = [], resolve, enabled = true }) {
        this.id = id;
        this.repository = repository;
        this.callers = callers;
        this.actions = actions;
        this.resolve = resolve;
        this.bound = false;
        this.enabled = enabled;  // 작동 여부 속성 추가
    }

    /** repository에 등록하여 EventCaller를 활성화합니다. */
    bind() {
        this.repository.registerInstance(this);
        this.bound = true;
    }

    /** repository에서 제거하여 실행 엔진에서 제외합니다. */
    unbind() {
        this.repository.unregisterInstance(this.id);
        this.bound = false;
    }

    /** 작동 여부를 확인합니다. */
    isEnabled() {
        return this.enabled && this.bound;
    }

    /** 작동을 활성화합니다. */
    activate() {
        this.enabled = true;
    }

    /** 작동을 비활성화합니다. */
    deactivate() {
        this.enabled = false;
    }

    /** 이벤트를 실행합니다. */
    run({ event, caller, action }) {
        if (!this.isEnabled()) return;  // 작동 여부 체크
        
        if (event instanceof Event && caller instanceof EventCaller && action instanceof EventAction) {
            this.resolve && this.resolve({ event, caller, action, eventInstance: this });
        }
    }
}
```

### 4.2 사용 예시

```javascript
// 기본 사용
const instance = new EventInstance({ id: "instance1", repository, actions });
instance.bind();  // repository에 등록

// 일시적 비활성화
instance.deactivate();  // 연결은 유지하되 작동 중지
// 이벤트 발생 시 실행되지 않음

// 재활성화
instance.activate();   // 다시 작동 시작
// 이벤트 발생 시 실행됨

// 완전 제거
instance.unbind();   // repository에서 연결 끊기
```

---

## 5. 장점

### 5.1 책임 분리가 명확함

- `bound`: repository와의 연결 상태
- `enabled`: 작동 의사/상태

두 가지 개념이 명확히 분리됩니다.

### 5.2 일시적 비활성화가 쉬움

연결을 끊지 않고도 일시적으로 비활성화할 수 있습니다.

- `deactivate()`: 연결 유지, 작동 중지
- `activate()`: 즉시 작동 재개

### 5.3 확장성이 높음

`isEnabled()` 함수 안에 복잡한 조건 로직을 추가할 수 있습니다.

```javascript
isEnabled() {
    // 기본 조건
    if (!this.enabled || !this.bound) return false;
    
    // 시간 기반 활성화
    if (this.activeFrom && Date.now() < this.activeFrom) return false;
    if (this.activeUntil && Date.now() > this.activeUntil) return false;
    
    // 조건 기반 활성화
    if (this.condition && !this.condition()) return false;
    
    return true;
}
```

### 5.4 테스트가 쉬움

작동 여부 제어 로직이 `isEnabled()` 함수에 집중되어 있어 테스트하기 쉽습니다.

---

## 6. 단점과 주의점

### 6.1 상태가 하나 늘어남

- `bound` 외에 `enabled` 속성이 추가됨
- 상태 관리가 조금 더 복잡해짐

하지만 이는 유연성 이점으로 상쇄됩니다.

### 6.2 동기화 주의 필요

repository에서 연결이 끊겼는데 `enabled=true`인 상태가 가능합니다.

```javascript
instance.unbind();  // bound = false
instance.enable();  // enabled = true
// 이 상태에서 isEnabled()는 false를 반환함
```

`isEnabled()`가 두 속성을 모두 체크하므로 문제 없습니다.

### 6.3 초기화 파라미터가 늘어남

constructor에 `enabled` 파라미터가 추가됩니다.

```javascript
constructor({ ..., enabled = true })
```

기본값을 `true`로 두면 기존 코드와 호환됩니다.

---

## 7. 대안 비교

### 7.1 옵션 A: 단순 boolean 속성

```javascript
this.enabled = true;

run() {
    if (!this.enabled) return;
}
```

장점:
- 구현이 가장 간단

단점:
- `bound`와의 관계가 명확하지 않음
- 확장성이 제한됨

### 7.2 옵션 B: 연결 정보 유지 (거부됨)

```javascript
this.callerIds = ["caller1", "caller2"];

unbind() {
    // 연결 끊지만 callerIds는 유지
}

bind() {
    // callerIds로 다시 연결
}
```

장점:
- 재바인딩이 쉬움

단점:
- 연결 정보 중복 (repository에도 있음)
- 동기화 문제
- 결합도가 높아짐

### 7.3 옵션 C: enabled + isEnabled() (권장)

```javascript
this.enabled = true;

isEnabled() {
    return this.enabled && this.bound;
}
```

장점:
- 책임 분리가 명확함
- 확장성이 높음
- 구현이 간단함

단점:
- 상태가 하나 늘어남 (사소한 단점)

---

## 8. 권장안

현재 프로젝트 규모와 목표에 가장 적합한 방식은 **옵션 C**입니다.

```javascript
class EventInstance {
    enabled = true;
    bound = false;
    
    isEnabled() {
        return this.enabled && this.bound;
    }
    
    activate() {
        this.enabled = true;
    }
    
    deactivate() {
        this.enabled = false;
    }
}
```

이 방식은 다음 이유로 추천됩니다.

1. 구현이 간단하면서도 유연함
2. 바인드와 작동 여부를 명확히 분리
3. 향후 확장성이 높음
4. 연결 정보 중복 문제가 없음

---

## 9. 결론

`enabled` 속성과 `isEnabled()` 함수를 추가하는 방식은 다음 이유로 적절합니다.

- **책임 분리**: 바인드 상태와 작동 상태를 명확히 분리
- **유연성**: 일시적 비활성화 기능 제공
- **확장성**: 복잡한 활성화 조건 추가 가능
- **간결성**: 구현이 복잡하지 않음

가장 현실적인 설계는 다음과 같습니다.

> `EventInstance`는 `bound`와 `enabled` 두 속성을 가지고,
> `isEnabled()` 함수로 작동 여부를 판단하는 구조

이 방식은 현재 프로젝트의 규모와 목표에 가장 잘 맞는 균형안입니다.
