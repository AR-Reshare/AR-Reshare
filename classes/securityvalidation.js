const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const securitySchemaDefinitions = require('../schemas/security-schemas.js');
const {PrivateKeyReadError, AlreadyAuthenticatedError, UnauthenticatedUserError, UnauthorizedUserError, InvalidCredentialsError,
    InvalidTokenError, TamperedTokenError, ExpiredTokenError, NotBeforeTokenError, ServerException, QueryExecutionError} = require('./errors');

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
// TODO: Fix inconsistencies between userID and email
// TODO: Define the query object to fix access to request attributes.


class SecurityValidate{
    // These are boilerplate functions, who's arguments and return types will be subject to change:

    regenerateToken(decodedToken){
        return fs.readFile('private.key', (privateKey) => {
            let token = jwt.sign({'userID': `${decodedToken.userID}`}, privateKey, {algorithm: 'HS256', expiresIn: '20m'});
            return token;
        });
    }

    createNewToken(userID){
        return fs.readFile('private.key', (privateKey) => {
            // TODO: There may be more information we want to add in the future
            let token = jwt.sign({'userID': `${userID}`}, privateKey, {algorithm: 'HS256', expiresIn: '20m'});
            return token;
        });
    }

    isUserCredentialsValid(email, password){
        // TODO: Interact with db object
        // 1. Check whether the userID and the hashed (maybe salted and peppered?) password is used
        const getHash = 'SELECT userid, passhash FROM Account WHERE email = $1';
        // TODO you'll need to pass the Database object from the pipeline into this function somehow
        return db.simpleQuery(getHash, [email]).then(res => {
            if (res.length === 0) {
                throw new InvalidCredentialsError();
            } else if (res.length > 1) {
                throw new QueryExecutionError();
            } else {
                // salt = get_salt(res[0].passhash)
                // hash = hash(password, salt)
                // if (hash === res[0].passhash)
                // return userID
                // else throw error
                return true;
            }
        });
    }

    isUserPasswordValid(userID, password){
        // TODO: Check whether this sql query string is correct
        const getHash = 'SELECT passhash FROM Account WHERE userid = $1';
        
        return db.simpleQuery(getHash, [userID]).then(res => {
            if (res.length === 0) {
                throw new InvalidCredentialsError();
            } else if (res.length > 1) {
                throw new QueryExecutionError();
            } else {
                // salt = get_salt(res[0].passhash)
                // hash = hash(password, salt)
                // if (hash === res[0].passhash)
                // return userID
                // else throw error
                return true;
            }   
            
        });


    }

    // NOTE: For our project, I don't believe that request query arguments would modify the outcome of the below function
    // --> If an example is found, the query argument will be reintroduced into this function.
    isUserAuthorized(userID, resource){
        // TODO: Interact with the db object
        // 1. First we check whether the user is an 'owner'/'contributer' of the resource'
        // NOTE: THis has been dropped 2. We then check whether the user has any sanctions

        // Assuming that we don't check for sanctions, the resources that can be modified are:
        // 1. account - check if the owner (we already know they are authorized by the verified jwt token that is required to get to this stage)
        // 2. listing - check if the owner is contributor of listing
        // 3. conversation - check if the owner of a specific message of a given conversation
        // 4. admin - check if the owner (we already know they are admin by the already verified jwt token) -- (This is dropped anyways)
        
        // NOTE: There may be more checks which might require creating more postgres statement strings
        const getListingHash = 'SELECT listingid FROM Listing WHERE contributorid = $1';


        let splitPath = resource.split('/');
        if ('listing' in splitPath){
            return db.simpleQuery(getListingHash, [userID]).then(res => {
                if (res.length === 1) {
                    return true;
                } else if (res.length === 0){
                    return false;
                } else{
                    throw new QueryExecutionError();
                }

            });
        }
    }


    // NOTE: This is the main function that will be called
    async process(resourceName, query, token){
        let decodedToken, validToken, category, userID, privateKey;

        // Checking the format of the token and verifying whether it is a valid token
        validToken = null;
        if (token !== null){
            // TODO: After creating the token signing module, add the neccessary verify() arguments (e.g. maybe audience, issuers, jwtid, etc.)
            // NOTE: The asynchronous version is essentially the same as synchrnous (except for a wrapper) (Doesnt return a promise)
            try {
                privateKey = await fs.readFile('private.key');
            } catch (err) {
                throw new PrivateKeyReadError();
            }

            try {
                decodedToken = jwt.verify(token, privateKey);
            } catch (err) {
                switch (err.name){
                case 'JsonWebTokenError':
                    switch (err.message){
                    case 'invalid signature':
                        throw new TamperedTokenError();
                    default:
                        throw new InvalidTokenError();
                    }
                case 'TokenExpiredError':
                    throw new ExpiredTokenError();
                case 'NotBeforeError':
                    // NOTE: We are not implementing NBE so this error should never be raise -- Make sure to add it to tests though
                    throw new  NotBeforeTokenError();
                default:
                    //pass
                }
            }
            // Token here should be successfully verified
            // TODO: Getting identifiable and important information from valid token and the query (url query + body args)
            validToken = true;
            userID = decodedToken.userID;
            console.log(decodedToken);
        }

        category = securitySchemaDefinitions.resource;
        // categories are as follows:
        // NoAuth = 'NA', TokenCreation = 'TC', TokenRegeneration = 'TR', Authorize+Authenticate (Token Only) = 'AA_TO', 'Authorize + Authenticate (Token And Password)'

        if (category === 'NA'){
            return [true, null];

        } else if (category === 'TC'){
            if (validToken) {
                throw new AlreadyAuthenticatedError();
            } else if (!this.isUserCredentialsValid(query.email, query.password)) {
                throw new InvalidCredentialsError();
            } else {
                return [true, this.createNewToken(resourceName, token)]; // At this point, there should be no current token, and the user has valid creds
            }

        } else if (category === 'TR'){
            if (validToken === null){
                throw new InvalidTokenError();
            } else {
                return [true, this.regenerateToken(token)];
            }

        } else if (category === 'AA_TO'){
            if (!validToken){
                throw new UnauthenticatedUserError();
            } else if (!this.isUserAuthorized(userID, resourceName)){
                throw new UnauthorizedUserError();
            } else {
                return [true, null];
            }

        } else if (category === 'AA_TAP'){
            if (!validToken){
                throw new UnauthenticatedUserError();
            } else if (!this.isUserPasswordValid(userID, query.password)){
                throw new InvalidCredentialsError();
            } else if (!this.isUserAuthorized(userID, resourceName)){
                throw new UnauthorizedUserError();
            } else {
                return [true, null];
            }
        }
        else {
            throw new ServerException();
        }

    }

}
