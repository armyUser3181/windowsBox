
/**
 * @typedef { (param0 : {event: Event, caller: EventCaller, action: EventAction, eventInstance: EventInstance}) => void } resolveInEventInstance
 */

import EventAction from "./EventAction.js";
import EventCaller from "./EventCaller.js";
import EventRepository from "./EventRepository.js";


/**
 * EventInstance
 * - 실제 실행을 담당하는 독립적인 이벤트 제어 단위입니다.
 * @property {string} id - EventInstance의 고유 식별자입니다.
 * @property {EventRepository} repository - EventInstance가 속한 EventRepository입니다.
 * @property {Array<EventCaller>} callers - EventInstance에 연결된 EventCaller들의 배열입니다.
 * @property {Array<EventAction>} actions - EventInstance에 연결된 EventAction들의 배열입니다.
 * @property {resolveInEventInstance} resolve - 이벤트 발생 시 호출되는 resolve 함수입니다.
 */
export default class EventInstance {
    /** @param {Object} param0 @param {string} [param0.id] @param {EventRepository} param0.repository @param {Array<EventCaller>} param0.callers @param {Array<EventAction>} [param0.actions] @param {resolveInEventInstance} [param0.resolve] */
    constructor({ id = "", repository, callers = [], actions = [], resolve}) {
        this.id = id;
        this.symbol = Symbol(id);
        this.repository = repository;
        this.callers = callers;
        this.actions = actions;
        this.resolve = resolve;
        this.bound = false;
    }

    /** repository에 등록하여 EventCaller를 활성화합니다. */
    bind() {
        // TODO: repository에 자신을 등록하고 EventCaller들과 연결합니다.
        this.bound = true;
    }

    /** repository에서 제거하여 실행 엔진에서 제외합니다. */
    unbind() {
        // TODO: repository에서 자신을 제거합니다.
        this.bound = false;
    }

    run({ event, caller, action}) {
        if( event instanceof Event && caller instanceof EventCaller && action instanceof EventAction ) {
            // Process the event with the provided caller and action
            this.resolve && this.resolve({ event, caller, action, eventInstance: this });
        }
    }

}
