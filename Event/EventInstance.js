
/**
 * @typedef { (param0 : {event: Event, caller: EventCaller, action: EventAction, eventInstance: EventInstance}) => void } handlerInEventInstance
 */

import EventAction from "./EventAction.js";
import EventCaller from "./EventCaller.js";
import EventRepository from "./EventRepository.js";


/**
 * EventInstance
 * - 실제 실행을 담당하는 독립적인 이벤트 제어 단위입니다.
 * @property {string} id - EventInstance의 고유 식별자입니다.
 * @property {EventRepository} repository - EventInstance가 속한 EventRepository입니다.
 * @property {Map<string, EventAction>} actions - EventInstance에 연결된 EventAction들의 배열입니다.
 * @property {handlerInEventInstance} handler - 이벤트 발생 시 호출되는 handler 함수입니다.
 */
export default class EventInstance {
    /** @param {Object} param0 @param {string} [param0.id] @param {EventRepository} param0.repository @param {Array<EventAction>} [param0.actions] @param {handlerInEventInstance} [param0.handler] @param {boolean} [param0.enabled] */
    constructor({ id = "", repository, actions = [], handler, enabled = true }) {
        this.id = id;
        this.repository = repository;
        this.actions = new Map(actions.map(action => [action.id, action]));
        this.handler = handler;
        this.enabled = enabled;
        this.bound = false;
    }

    bind() {
        this.bound = true;
    }

    unbind() {
        
        this.bound = false;
    }

    /** 이벤트를 실행합니다. */
    run({event, caller}) {
        if( this.enabled && this.handler && event instanceof Event && caller instanceof EventCaller ) {
            this.handler({ event, caller, actions: this.actions, eventInstance: this });
        }
    }

}
