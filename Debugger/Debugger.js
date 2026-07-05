
export default class cdebugger {

    constructor() {
        this.debuggingMode = false;
    }

    debuggingModeOn() {
        this.debuggingMode = true;
    }

    debuggingModeOff() {
        this.debuggingMode = false;
    }

    #print(message) {
        const time = new Date().toLocaleTimeString();
        if( typeof message === 'string') {
            console.log(`[${time}]: ${message}`);
        }
        else {
            console.log(time, message);
        }
        
    }

    log(message) {
        if (!this.debuggingMode) return;
        const time = new Date().toLocaleTimeString();
        this.#print(`[${time}]: ${message}`)
    }

    error(message) {
        if (!this.debuggingMode) return;
        const time = new Date().toLocaleTimeString();
        this.#print(`[${time}]: ${message}`)
    }

    printMemoryUsage() {
        if (!this.debuggingMode) return;

        // performance.memory API 지원 여부 확인 (크롬, 엣지 등 지원)
        if (performance && performance.memory) {
            const memory = performance.memory;
            
            // Byte 단위를 MB로 변환 (반올림)
            const totalJSHeapSize = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
            const usedJSHeapSize = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
            const jsHeapSizeLimit = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

            this.log(`Memory: Used: ${usedJSHeapSize}MB, Total: ${totalJSHeapSize}MB, Limit: ${jsHeapSizeLimit}MB`);
            return memory;
        } else {
            this.log('Memory API를 지원하지 않는 브라우저입니다.');
            return null;
        }
    }

    measure(fn, label = 'Operation') {
        if (!this.debuggingMode) return fn();
        const start = Date.now();
        const result = fn();
        const end = Date.now();
        const duration = end - start;
        this.log(`${label} took ${duration}ms`);
        return result;
    }

}