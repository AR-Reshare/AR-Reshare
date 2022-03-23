/* This will define the custom error classes to use throughout the project
*/


/**
 * Represents a failure of the email handling component to send email requests
 */
class EmailDeliveryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmailDeliveryError';
    }
}

/**
 * Represents a failure of the email handling component to read configuration data
 */
class EmailConfigurationReadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EmailConfigurationReadError';
    }
}

/**
 * Represents a failure to initialise the pipeline, likely due to invalid/missing arguments
 */
class PipelineInitialisationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PipelineInitialisationError';
    }
}

/**
 * Represents a failure to locate a template or schema object for a particular resource
 */
class MissingTemplateError extends PipelineInitialisationError {
    constructor(message) {
        super(message);
        this.name = 'MissingTemplateError';
    }
}

/**
 * Represents a general failure in the execution of a pipeline
 */
class PipelineExecutionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PipelineExecutionError';
    }
}

/**
 * Represents a failure to read the server's private key for encryption purposes
 */
class PrivateKeyReadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PrivateKeyReadError';
    }
}

/**
 * Represents failure to log in a user due to them already being authenticated
 */
class AlreadyAuthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AlreadyAuthenticatedError';
    }
}

/**
 * Represents a failure to authorise a user due to them not being authenticated
 */
class UnauthenticatedUserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthenticatedUserError';
    }
}

/**
 * Represents a failure to authorise a user due to them having insufficient access rights
 */
class UnauthorizedUserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedUserError';
    }
}

/**
 * Represents a failure to log in a user due to them not providing valid credentials
 */
class InvalidCredentialsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidCredentialsError';
    }
}

/**
 * Represents a failure to authenticate a user due to them not providing a valid token
 */
class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidTokenError';
    }
}

/**
 * Represents a failure to authenticate a user due to them providing a token which has been tampered with
 */
class TamperedTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TamperedTokenError';
    }
}

/**
 * Represents a failure to authenticate a user due to their token being expired
 */
class ExpiredTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExpiredTokenError';
    }
}

/**
 * Represents a failure to authenticate a user due to them using their token to quickly
 */
class NotBeforeTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotBeforeTokenError';
    }
}

/**
 * Represents an error in configuring the server which was not detected until runtime
 */
class ServerException extends Error {
    constructor(message) {
        super(message);
        this.name = 'ServerException';
    }
}

/**
 * Represents an error in configuring a template or schema object
 */
class TemplateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TemplateError';
    }
}

/**
 * Represents any error in validating a request
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Represents a failure to validate a request due to a required parameter being missing
 */
class AbsentArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'AbsentArgumentError';
    }
}

/**
 * Represents a failure to validate a request due to a condition on a parameter being exceptional
 */
class UnprocessableArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'UnprocessableArgumentError';
    }
}

/**
 * Represents a failure to validate a request due to a condition on a parameter being false
 */
class InvalidArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'InvalidArgumentError';
    }
}

/**
 * Represents a failure to sanitise a request
 */
class DirtyArgumentError extends ValidationError {
    constructor(message) {
        super(message);
        this.name = 'DirtyArgumentError';
    }
}

/**
 * Represents any error in constructing or executing a database transaction
 */
class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'QueryError';
    }
}

/**
 * Represents a failure to establish a connection to the database
 */
class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseConnectionError';
    }
}

/**
 * Represents a failure to acquire a database client with which to perform a transaction
 */
class DBClientNotAvailableError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DBClientNotAvailableError';
    }
}

/**
 * Represents a failure to construct a transaction caused by the transaction's template
 */
class QueryTemplateError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'QueryTemplateError';
    }
}

/**
 * Represents a failure to perform a transaction due to it lacking any queries
 */
class EmptyQueryError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'EmptyQueryError';
    }
}

/**
 * Represents a failure to perform a transaction inferred from the response containing no rows
 */
class EmptyResponseError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'EmptyResponseError';
    }
}

/**
 * Represents a failure to construct a transaction, due to a lack of query parameters or similar
 */
class QueryConstructionError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'QueryConstructionError';
    }
}

/**
 * Represents a failure to perform a backreference to an earlier query
 */
class BackreferenceError extends QueryError {
    constructor(message) {
        super(message);
        this.name = 'BackreferenceError';
    }
}

/**
 * Represents an error in the postgres database
 */
class QueryExecutionError extends QueryError {
    constructor(message, code) {
        super(message);
        this.name = 'QueryExecutionError';
        this.code = code;
    }
}

/**
 * Represents an error in the postgres database caused by failure to abide by a foreign key constraint
 */
class ForeignKeyError extends QueryExecutionError {
    constructor(message) {
        super(message);
        this.name = 'ForeignKeyError';
    }
}

/**
 * Represents an error in the postgres database caused by failure to abide by a unique constraint
 */
class UniqueConstraintError extends QueryExecutionError {
    constructor(message) {
        super(message);
        this.name = 'UniqueConstraintError';
    }
}

/**
 * Represents a failure to upload media to the external media handling service
 */
class FailedUploadError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FailedUploadError';
    }
}

module.exports = {
    EmailDeliveryError,
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
