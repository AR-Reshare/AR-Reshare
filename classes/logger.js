class Logger {
    constructor() {
        this.tetst = 'h';
    }

    log(...args) {
        console.log(...args);
    }

    error(...args) {
        console.error(...args);
    }

    warn(...args) {
        console.warn(...args);
    }
}

module.exports = Logger;
