/* This will define the custom error classes to use throughout the project
*/

class TemplateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TemplateError';
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class AbsentArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'AbsentArgumentError';
    }
}

class UnprocessableArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'UnprocessableArgumentError';
    }
}

class InvalidArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'InvalidArgumentError';
    }
}

class DirtyArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'DirtyArgumentError';
    }
}

module.exports = {
    TemplateError,
    ValidationError,
    AbsentArgumentError,
    UnprocessableArgumentError,
    InvalidArgumentError,
    DirtyArgumentError,
};
