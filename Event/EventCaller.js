import EventRepository from "./EventRepository.js";

/**
 * EventCaller
 * - 특정 DOM 이벤트를 감지하고 EventInstance를 호출합니다.
 * @member {EventRepository} EventCaller.repository
 * @member {typeof Event} EventCaller.eventClass
 * @member {keyof HTMLElementEventMap} EventCaller.eventName
 * @member {HTMLElement} EventCaller.target
 * @member {boolean} EventCaller.bound
 */
export default class EventCaller {
    /**
     * @param {Object} param0 @param {EventRepository} param0.repository @param {typeof Event} param0.eventClass @param {keyof HTMLElementEventMap} param0.eventName @param {HTMLElement} param0.target
     */
    constructor({ repository, eventClass = Event, eventName, target } = {}) {
        this.repository = repository;
        this.eventClass = eventClass;
        this.eventName = eventName;
        this.target = target;
        this.bound = false;
    }

    /** repository에 자신을 등록하고 이벤트 수신을 시작합니다. */
    bind() {
        // TODO: repository에 등록하고, 필요한 resolver를 준비합니다.
        this.bound = true;
    }

    /** repository에서 자신을 제거하고 이벤트 수신을 중지합니다. */
    unbind() {
        // TODO: repository에서 바인딩을 해제합니다.
        this.bound = false;
    }

    /** 이벤트가 발생했을 때 호출됩니다. */
    call(event) {
        // TODO: 연결된 EventInstance를 찾아 resolve를 호출합니다.
    }
}

export const debugCode = args => {
    
}