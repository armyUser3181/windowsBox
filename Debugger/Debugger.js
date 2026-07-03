
export default class cdebugger {

    constructor() {

    }

    #print(message) {
        const time = new Date().toLocaleTimeString();
        if( typeof message === 'string') console.log(`[${time}]: ${message}`);
        else {
            console.log(time,);
        }
        
    }

    log(message) {
        const time = new Date().toLocaleTimeString();
        console.log(`[${time}]: ${message}`)
    }

    error(message) {
        const time = new Date().toLocaleTimeString();
        console.error(`[${time}]: ${message}`)
    }

    printMemoryUsage() {
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
        const start = Date.now();
        fn();
        const end = Date.now();
        const duration = end - start;
        this.log(`${label} took ${duration}ms`);
        return duration;
    }

}