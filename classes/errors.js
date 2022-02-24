/* This will define the custom error classes to use throughout the project
*/



class PrivateKeyReadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PrivateKeyReadError';
    }
}


class AlreadyAuthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AlreadyAuthenticatedError';
    }
}

class UnauthenticatedUserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthenticatedUserError';
    }
}

class UnauthorizedUserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedUserError';
    }
}

class InvalidCredentialsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidCredentialsError';
    }
}

class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidTokenError';
    }
}

class TamperedTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TamperedTokenError';
    }
}

class ExpiredTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExpiredTokenError';
    }
}

class NotBeforeTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotBeforeTokenError';
    }
}

class ServerException extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServerException';
    }
}

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

class QueryError extends Error {
    // Represents an error in constructing or executing a query
    constructor(message) {
        super(message);
        this.name = 'QueryError';
    }
}

class DatabaseConnectionError extends Error {
    // Represents an error in establishing connection to the database
    constructor(message) {
        super(message);
        this.name = 'DatabaseConnectionError';
    }
}

class DBClientNotAvailableError extends Error {
    // Represents an error in accessing a postgres client
    constructor(message) {
        super(message);
        this.name = 'DBClientNotAvailableError';
    }
}

class QueryTemplateError extends QueryError {
    // Represents an error in constructing a query caused by the template
    // rather than by the input values, DB response, etc
    constructor(message) {
        super(message);
        this.name = 'QueryTemplateError';
    }
}

class EmptyQueryError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'EmptyQueryError';
    }
}

class EmptyResponseError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'EmptyResponseError';
    }
}

class QueryConstructionError extends QueryError {
    // Represents an error in constructing a query
    // i.e. Node-side
    constructor(message) {
        super(message);
        this.name = 'QueryConstructionError';
    }
}

class BackreferenceError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'BackreferenceError';
    }
}

class QueryExecutionError extends QueryError {
    // Represents an error in executing a query
    // i.e. PostgreSQL-side
    constructor(message) {
        super(message);
        this.name = 'QueryExecutionError';
    }
}

module.exports = {
    PrivateKeyReadError,
    AlreadyAuthenticatedError,
    UnauthenticatedUserError,
    UnauthorizedUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    TamperedTokenError,
    ExpiredTokenError,
    NotBeforeTokenError,
    ServerException,
    TemplateError,
    ValidationError,
    AbsentArgumentError,
    UnprocessableArgumentError,
    InvalidArgumentError,
    DirtyArgumentError,
    QueryError,
    DatabaseConnectionError,
    DBClientNotAvailableError,
    QueryTemplateError,
    EmptyQueryError,
    EmptyResponseError,
    QueryConstructionError,
    BackreferenceError,
    QueryExecutionError,
    // ...
};
