

import EventCaller from "./EventCaller.js";
import EventInstance from "./EventInstance.js";

/**
 * EventStore
 * - EventRepository 역할을 하는 저장소 클래스입니다.
 * - EventCaller, EventInstance, targetMap을 관리합니다.
 */
export default class EventRepository {
    constructor() {
        /** @type {Map<HTMLElement, Map<keyof HTMLElementEventMap, {resolver: (event: Event) => void, callers: Map<string, EventCaller>}>>} */
        this.targetEventMap = new Map();
        /** @type {Map<string, EventCaller>} */
        this.eventCallerMap = new Map();
        /** @type {Map<string, EventInstance>} */
        this.eventInstanceMap = new Map();
        this.bound = false;
    }

    /** DOM 이벤트 리스너를 모두 등록합니다. */
    bind() {
        // TODO: targetMap을 이용해 이벤트 리스너를 바인딩합니다.
        this.resolverMap.forEach((eventMap, target) => {
            eventMap.forEach((resolver, eventType) => {
                target.addEventListener(eventType, resolver);
            });
        });
        this.bound = true;
    }

    /** 등록된 DOM 이벤트 리스너를 해제합니다. */
    unbind() {
        // TODO: targetMap을 이용해 등록된 이벤트 리스너를 해제합니다.
        this.resolverMap.forEach((eventMap, target) => {
            eventMap.forEach((resolver, eventType) => {
                target.removeEventListener(eventType, resolver);
            });
        });
        this.bound = false;
    }

    /** EventCaller에 필요한 resolver를 생성하거나 갱신합니다. */
    renew() {
        // TODO: caller 정보를 바탕으로 resolver를 구성합니다.
        this.eventCallerMap.forEach((caller, key) => {
            const target = caller.target;
            const eventType = caller.eventName;
            if (!this.targetEventMap.has(target)) {
                this.targetEventMap.set(target, new Map());
            }
            if (!this.targetEventMap.get(target).has(eventType)) {
                const callers = new Map();
                callers.set(key, caller);
                const resolver = (event) => {
                    // TODO: caller의 execute를 호출합니다.
                    callers.forEach((caller) => {
                        caller.call(event);
                    });
                };
                this.targetEventMap.get(target).set(eventType, { resolver: resolver, callers: callers });
                
            }
        });

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
