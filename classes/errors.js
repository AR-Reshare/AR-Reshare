/* This will define the custom error classes to use throughout the project
*/

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

class QueryConstructionError extends QueryError {
    // Represents an error in constructing a query
    // i.e. Node-side
    constructor(message) {
        super(message);
        this.name = 'QueryConstructionError';
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
    QueryError,
    DatabaseConnectionError,
    DBClientNotAvailableError,
    QueryTemplateError,
    QueryConstructionError,
    QueryExecutionError,
    // ...
}
