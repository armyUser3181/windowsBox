/**
 * Action
 * - 이벤트 발생 시 실행되는 비즈니스 로직의 최소 단위입니다.
 * - setup: 이벤트 발생 시 실행되는 함수입니다.
 * - action: setup 함수의 결과를 받아 이벤트 발생 시 실행되는 함수입니다.
 * 
 */
export default class EventAction {
    /** @param {{id: string, setup: () => any, action: (args: any) => any}} param0 */
    constructor({ id = "", setup = null, action = null } = {}) {
        this.id = id;
        this.setup = setup;
        this.action = action;
    }

    /** @param {{event: any}} param0 */
    run({event: event}) {
        if( !this.setup && !this.action ) {
            return;
        } else if( this.setup && !this.action ) {
            return this.setup({event: event, action: ({}) => {}});
        } else if( !this.setup && this.action ) {
            return this.action({event: event, args: {}});
        } else {
            return this.setup({ event: event, action: this.getResolved({event: event}) });
        }
    }

    getResolved({event: event}) {
        return args => this.action({event: event, args: args});
    }

}
