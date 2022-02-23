/* This will define the custom error classes to use throughout the project
*/



class AlreadyAuthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.name = "AlreadyAuthenticatedError";
    }
}
class UnauthenticatedUserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthenticatedUserError";
    }
}
class UnauthorizedUserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UnauthorizedUserError";
    }
}

class InvalidCredentialsError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}
class InvalidTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidTokenError";
    }
}
class TamperedTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "TamperedTokenError";
    }
}
class ExpiredTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "ExpiredTokenError";
    }
}
class NotBeforeTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotBeforeTokenError";
    }
}

class ServerException extends Error {
    constructor(message) {
        super(message);
        this.name = "ServerException";
    }
}


module.exports = {
    AlreadyAuthenticatedError,
    UnauthenticatedUserError,
    UnauthorizedUserError,

    InvalidCredentialsError,
    InvalidTokenError,
    TamperedTokenError,
    ExpiredTokenError,
    NotBeforeTokenError,

    ServerException

}