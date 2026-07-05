/**
 * EventStore
 * - EventRepository 역할을 하는 저장소 클래스입니다.
 * - EventCaller, EventInstance, resolver를 관리합니다.
 */
export default class EventRepository {
    constructor() {
        /** @type {Map<Symbol, Function>} */
        this.resolverMap = new Map();
        /** @type {Map<Symbol, import("./EventCaller.js").default>} */
        this.eventCallerMap = new Map();
        /** @type {Map<Symbol, import("./EventInstance.js").default>} */
        this.eventInstanceMap = new Map();
        this.bound = false;
    }

    /** DOM 이벤트 리스너를 모두 등록합니다. */
    bind() {
        // TODO: resolverMap을 이용해 이벤트 리스너를 바인딩합니다.
        this.bound = true;
    }

    /** 등록된 DOM 이벤트 리스너를 해제합니다. */
    unbind() {
        // TODO: 등록된 resolver를 해제합니다.
        this.bound = false;
    }

    /** EventCaller에 필요한 resolver를 생성하거나 갱신합니다. */
    renew() {
        // TODO: caller 정보를 바탕으로 resolver를 구성합니다.
    }

    /** EventInstance를 저장소에 추가합니다. */
    push(eventInstance) {
        if (!eventInstance || !eventInstance.id) return;
        this.eventInstanceMap.set(eventInstance.id, eventInstance);
    }

    /** EventInstance를 저장소에서 제거합니다. */
    remove(eventInstance) {
        if (!eventInstance || !eventInstance.id) return;
        this.eventInstanceMap.delete(eventInstance.id);
    }
}
