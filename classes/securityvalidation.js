const jwt = require("jsonwebtoken");
const fs = require("fs");
const securitySchemaDefinitions = require("../schemas/security-schemas.js");
const {AlreadyAuthenticatedError, UnauthenticatedUserError, UnauthorizedUserError, InvalidCredentialsError,
    InvalidTokenError, TamperedTokenError, ExpiredTokenError, NotBeforeTokenError, ServerException} = require("./errors");


// There are two parts to the securityValidation

// 1. We start by authenticating the user (i.e. is the token valid, legal etc)
// 2. We end by checking whether the user should be able to access the said resource

// NOTES:
// Certain resources do not require authentication - If the user provides a invalid token (regardless of not requiring auth, we reject)

// Scenarios (Authentication):
// 0. Malformed token provided by user
// 1. Non-authenticated resource with non-authenticated user (Good)
// 2. Non-authenticated resource with invalidly authenticated user (Bad)
// 3. Non-authenticated resource with correctly authenticated user (Good)

// 4. Authenticated resource with non-authenitcated user (Reject)
// 5. Authenticated resource with validly authenticated user (Pending on authorization)
// 6. Authenticated resource with invalidly authenticated user (Pending on authorization)

// Scenarios (Authorization) - At the point where this is called, the JWT token must be verified succesfully
// 7. Authenticated resource with validly authenticated user (ext 5.) (Accept)
// 8. Authenticated resource with invalidly authenticated user (ext 6.) (Reject)

// Scenarios (Token-Creation Request)
// 1. Non-authenticated users

// Scenarios (Token-Update Request)
// 2. Authenticated Users ()


// NOTE: https://stackoverflow.com/questions/27715275/whats-the-difference-between-returning-value-or-promise-resolve-from-then
// TODO: Consider splitting InvalidTokenError to more specific errors maybe -- they are raised in different situations/scenarios
// TODO: Update the Exceptions to be more descriptive

function SecurityValidate(resourceName, query, token){
    return new Promise((resolve, reject) => {

        let decodedToken, validToken, category;
        // Checking the format of the token and verifying whether it is a valid token
        validToken = null;
        if (token !== null){
            // TODO: After creating the token signing module, add the neccessary verify() arguments (e.g. maybe audience, issuers, jwtid, etc.)
            // NOTE: The asynchronous version is essentially the same as synchrnous (except for a wrapper) (Doesnt return a promise)
            decodedToken = jwt.verify(token, secret);
            switch (err.name){
                case "JsonWebTokenError":
                    switch (err.message){
                        case "invalid signature":
                            throw new TamperedTokenError();
                        default:
                            throw new InvalidTokenError();
                    }
                case "TokenExpiredError":
                    throw new ExpiredTokenError();
                case "NotBeforeError":
                    // NOTE: We are not implementing NBE so this error should never be raise -- Make sure to add it to tests though
                    throw new  NotBeforeTokenError();
                default:
                    decodedToken = decoded;
                }

            // Token here should be successfully verified
            // TODO: Getting identifiable and important information from valid token and the query (url query + body args)
            validToken = True;
            console.log(decodedToken);
        }

        category = securitySchemaDefinitions.resource;
        // categories are as follows:
        // NoAuth = "NA", TokenCreation = "TC", TokenRegeneration = "TR", Authorize+Authenticate (Token Only) = "AA_TO", "Authorize + Authenticate (Token And Password)"

        if (category === "NA"){
            return [true, null];

        } else if (category === "TC"){
            if (validToken) {
                throw new AlreadyAuthenticatedError();
            } else if (!isUserCredentialsValid(userID, password)) {
                throw new InvalidCredentialsError();
            } else {
                return [true, createNewToken(resourceName, token)]; // At this point, there should be no current token, and the user has valid creds
            }

        } else if (category === "TR"){
            if (validToken === null){
                throw new InvalidTokenError();
            } else {
                return [true, regenerateToken(token)];
            }

        } else if (category === "AA_TO"){
            if (!validToken){
                throw new UnauthenticatedUserError();
            } else if (!isUserAuthorized(resource, userID)){
                throw new UnauthorizedUserError();
            } else {
                return [true, null];
            }

        } else if (cateogry === "AA_TAP"){
            if (!validToken){
                throw new UnauthenticatedUserError();
            } else if (!isUserCredentialsValid(userID, password)){
                throw new InvalidCredentialsError();
            } else if (!isUserAuthorized(resource, query, userID)){
                throw new UnauthorizedUserError();
            } else {
                return [true, null];
            }
        }
         else {
            throw new ServerException();
        }

    });
}


// These are boilerplate functions, who's arguments and return types will be subject to change:

function regenerateToken(decodedToken){
    let privateKey = fs.readFileSync("private.key");
    let token = jwt.sign({"userID": `${decodedToken.userID}`}, privateKey, {algorithm: "HS256", expiresIn: "20m"});
    return token;
}

function createNewToken(userID){
    let privateKey = fs.readFileSync("private.key");
    // TODO: There may be more information we want to add in the future
    let token = jwt.sign({"userID": `${userID}`}, privateKey, {algorithm: "HS256", expiresIn: "20m"});
    return token;
}

function isUserCredentialsValid(userID, password){
    // TODO: Interact with db object
    // 1. Check whether the userID and the hashed (maybe salted and peppered?) password is used
    
}

function isUserAuthorized(resource, query, userID){
    // TODO: Interact with the db object
    // 1. First we check whether the user is an "owner"/"contributer" of the resource"
    // 2. We then check whether the user has any sanctions

}
