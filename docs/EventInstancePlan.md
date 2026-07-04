
## 1. EventRepository (이벤트 저장소)
EventCaller들을 태그에 맞게 저장하고 바인드합니다.
* 성질
    * htmlElement에 직접적으로 접근하며 리스너를 작동시킵니다.
* 하위 속성
    * ResolverMap: 직접적으로 리스너에 접근하는 함수들입니다.
    * EventCallerMap: Callor들을 모아둔 맵입니다. Resolver에서 호출합니다.
    * EventInstanceMap: Instance들을 모아둔 맵입니다.
    * binded: 등록 여부
* 메서드
    * bind(): resolver들을 리스너에 bind 시킵니다
    * unbind(): resolver와 리스너의 bind을 끊습니다.
    * renew(): EventCaller에 매칭하여 없는 resolver들을 만들고 등록합니다.
    * push(): EventInstance을 푸시합니다. EventInstance에도 본인의 참조를 만듭니다.
    * remove(): EventInstance를 제거합니다.

------------------------------

## 2. EventCaller (이벤트 호출자)
각기 조건에 따른 EventInstance의 호출을 관리합니다.
* 성질
    * 스스로를 활성화하거나 비활성화할 수 있는 권한을 가진 호출 객체입니다.
* 하위 속성
    * repository: bind할 저장소
    * eventName: 이벤트 종류 (예: click)
    * target: 이벤트 대상
    * binded: 등록 여부
* 메서드
    * bind(): 인스턴스를 repository에 등록하여 활성화합니다.
    * unbind(): 실행 엔진에서 제외하여 이벤트를 중지합니다.

------------------------------
## 3. EventInstance (이벤트 인스턴스)
실제 실행을 담당하는 독립적인 이벤트 제어 단위입니다.

* 성질
    * 주요 로직에 따라 분기하며 작동이 가능한 핵심 객체입니다.
* 하위 속성
    * repository: bind할 저장소
    * callers: 호출자들
    * actions: 실제 비즈니스 로직을 실행하는 함수들입니다.
    * resolve: action들을 호출하며 분기하는 함수입니다.
* 메서드
    * bind(): 인스턴스를 repository에 등록하여 EventCaller들을 활성화합니다.
    * unbind(): 실행 엔진에서 제외하여 EventCaller들을 중지합니다.

------------------------------
## 4. Action (액션)
이벤트 발생 시 수행되는 비즈니스 로직의 최소 단위입니다.

* 성질
    * 독립적인 클래스로 존재하며 내부적인 작동 구조를 가지고 있습니다.
* 하위 속성
    * callor: action을 호출합니다. 필요한 초기화 과정을 실행합니다.
    * action: 메인 구문입니다.
    * id: 액션을 구분하는 고유 식별자입니다.
* 메서드
    * run(context): 실행 시 필요한 데이터를 받아 처리합니다.

------------------------------

