

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

    bindOnResolver(caller) {
        const key = caller.id;
        const target = caller.target;
        const eventType = caller.eventName;
        if (!this.targetEventMap.has(target)) {
            this.targetEventMap.set(target, new Map());
        }
        if (!this.targetEventMap.get(target).has(eventType)) {
            const callers = new Map();
            callers.set(key, caller);
            const resolver = (event) => {
                callers.forEach((caller) => {
                    caller.call(event);
                });
            };
            this.targetEventMap.get(target).set(eventType, { resolver: resolver, callers: callers });
        } else {
            this.targetEventMap.get(target).get(eventType).callers.set(key, caller);
        }
        return this;
    }

    unbindOnResolver(caller) {
        const key = caller.id;
        const target = caller.target;
        const eventType = caller.eventName;
        if( !this.targetEventMap.has(target) ) return this;
        if( !this.targetEventMap.get(target).has(eventType) ) return this;
        const pair = this.targetEventMap.get(target).get(eventType);
        pair.callers.delete(key);
        if(pair.callers.size == 0) {
            target.removeEventListener(eventType, pair.resolver);
            this.targetEventMap.get(target).delete(eventType);
        }
        return this;
    }

    push(value) {
        if (!value || !value.id) return this;
        if (value && value.id && value instanceof EventInstance) {
            this.eventInstanceMap.set(value.id, value);
        }
        if (value instanceof EventCaller) {
            this.eventCallerMap.set(value.id, value);
        }
        return this;
    }

    remove(value) {
        if (!value || !value.id) return this;
        if (value instanceof EventInstance) {
            this.eventInstanceMap.delete(value.id);
        }
        if (value instanceof EventCaller) {
            this.eventCallerMap.delete(value.id);
        }
        return this;
    }
}
