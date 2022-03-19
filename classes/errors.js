/* This will define the custom error classes to use throughout the project
*/

class EmailDeliveryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmailDeliveryError';
    }
}


class EmailConfigurationReadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmailConfigurationReadError';
    }
}
      
class PipelineInitialisationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PipelineInitialisationError';
    }
}

class MissingTemplateError extends PipelineInitialisationError {
    constructor(message) {
        super(message);
        this.name = 'MissingTemplateError';
    }
}

class PipelineExecutionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PipelineExecutionError';
    }
}

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
    constructor(message, code) {
        super(message);
        this.name = 'QueryExecutionError';
        this.code = code;
    }
}

class ForeignKeyError extends QueryExecutionError {
    constructor(message) {
        super(message);
        this.name = 'ForeignKeyError';
    }
}

class UniqueConstraintError extends QueryExecutionError {
    constructor(message) {
        super(message);
        this.name = 'UniqueConstraintError';
    }
}

class FailedUploadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FailedUploadError';
    }
}

module.exports = {
    EmailConfigurationReadError,
    PipelineInitialisationError,
    MissingTemplateError,
    PipelineExecutionError,
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
    ForeignKeyError,
    UniqueConstraintError,
    FailedUploadError,
    // ...
};
