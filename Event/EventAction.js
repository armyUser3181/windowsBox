/**
 * Action
 * - 이벤트 발생 시 실행되는 비즈니스 로직의 최소 단위입니다.
 */
export default class EventAction {
    constructor({ id = "", caller = null, action = null } = {}) {
        this.id = id;
        this.caller = caller;
        this.action = action;
    }

    run({event: event}) {
        return this.caller && this.caller({event: event}) || this.action && this.action({event: event});
    }

}
