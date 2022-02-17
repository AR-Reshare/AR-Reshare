/* This will define the custom error classes to use throughout the project
*/

class PipelineInitialisationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PipelineInitialisationError';
    }
}

class PipelineExecutionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PipelineExecutionError';
    }
}

module.exports = {
    PipelineInitialisationError,
    PipelineExecutionError,
}
