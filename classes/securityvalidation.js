const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const securitySchemaDefinitions = require('../schemas/security-schemas.js');
const {AbsentArgumentError, PrivateKeyReadError, AlreadyAuthenticatedError, UnauthenticatedUserError, UnauthorizedUserError, InvalidCredentialsError,
    InvalidTokenError, TamperedTokenError, ExpiredTokenError, NotBeforeTokenError, ServerException, QueryExecutionError} = require('./errors.js');
const errors = require('./errors.js');
const path = require('path');
const { Console } = require('console');

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


// TODO: Hand over definitions to the pipeline
// TODO: Split up the account creation seperately

// Split up into (Token Creation and Token Generation) && (evnerything else)

class SecurityValMethods{
    static PrivatekeyLocation = `classes${path.sep}private.key`;

    static async verifyToken(token){
        let privateKey, decodedToken;
        if (token !== null){
            // TODO: After creating the token signing module, add the neccessary verify() arguments (e.g. maybe audience, issuers, jwtid, etc.)
            // NOTE: The asynchronous version is essentially the same as synchrnous (except for a wrapper) (Doesnt return a promise)
            try {
                privateKey = await fs.readFile(SecurityValMethods.PrivatekeyLocation);
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
                    throw new  NotBeforeTokenError();

                }
            }
            // Token here should be successfully verified
            return [true, decodedToken];
        } else {
            return [null, null];
        }
    }

}

// TODO: Review the exception propogation and fix any issues
class AuthenticationHandler extends SecurityValMethods{
    static async emailValidation(email){}
    static async passwordValidation(password){}

    static async accountLogin(db, query, inputToken=null){
        if (inputToken){
            throw new InvalidTokenError();
        }
        // Checking existence
        if (!query){
            throw new AbsentArgumentError();
        } else if (query.email === undefined){
            throw new AbsentArgumentError();
        } else if (query.password === undefined){
            throw new AbsentArgumentError();
        } 
        // Checking format
        check(query.email).isEmail()
        // The main format validation/sanitaiton should be performed by the db execution
        check(query.password).isLength({min:10});
        const errors = validationResult(query);
        if (!errors.isEmpty()){
            throw new DirtyArgumentError();
        } else {
            return await AuthenticationHandler.createNewToken(db, query.email, query.password);
        }
    }

    // Authentication Type: TokenRegeneration (TR)
    static async regenerateToken(token){
        // TODO: Provide checking that the decodedToken is valid
        const [validToken, decodedToken] = await SecurityValMethods.verifyToken(token);
        if (!validToken){
            throw new AbsentArgumentError();
        }
        return await this._regenerateToken(decodedToken);
    }

    static async _regenerateToken(decodedToken){
        let privateKey;
        try {
            privateKey = await fs.readFile(SecurityValMethods.PrivatekeyLocation);
        } catch (err) {
            throw new PrivateKeyReadError();
        }
        return jwt.sign({'userID': `${decodedToken.userID}`}, privateKey, {algorithm: 'HS256', expiresIn: '20m'});
    }

    // Authentication Type: TokenCreation (TC)
    static async createNewToken(db, email, password){
        // TODO: Provide checking that the userID is valid
        const userID = await this.isUserCredentialsValid(db, email, password);
        return await this._createNewToken(userID);
    }

    static async _createNewToken(userID){
        let privateKey;
        try {
            privateKey = await fs.readFile(SecurityValMethods.PrivatekeyLocation);
        } catch (err){
            throw new PrivateKeyReadError();
        }
        return jwt.sign({'userID': `${userID}`}, privateKey, {algorithm: 'HS256', expiresIn: '20m'});
    }

    static async isUserCredentialsValid(db, email, password){
        // 1. Check whether the userID and the hashed (maybe salted and peppered?) password is used
        const getHash = 'SELECT userid, passhash FROM Account WHERE email = $1';
        // TODO you'll need to pass the Database object from the pipeline into this function somehow
        return db.simpleQuery(getHash, [email]).then(res => {
            if (res.length === 0){
                throw new InvalidCredentialsError();
            } else if (res.length > 1){
                throw new QueryExecutionError();
            } else {
                let userID = 'samsepi0l';
                // salt = get_salt(res[0].passhash)
                // hash = hash(password, salt)
                // if (hash === res[0].passhash)
                // return userID
                // else throw error
                return userID;
            }
        });
    }

   
}




// NOTE: The design is as follow: 
// 1. SecurityValidation constructor recieves parameters which define how it will validate a single resource
// 2. SecurityValidation's process() method is then called using the input object that it is validating
// (1 + 2), are both called using the pipeline
class SecurityValidate extends SecurityValMethods{
    constructor(params){
        super(); // SecurityValMethods provide static methods
        // Authentication Requirement: [AA_TAP, AA_TO, NA] and [TC, TR]
        this.authenticationType = params.auth;
        this.resource = params.resourceName;
        this.db = params.db;
    }

    // NOTE: This is the main function that will be called
    async process(token, query){
        // First we check whether the token is correct
        const [validToken, decodedToken] = await SecurityValMethods.verifyToken(token);
        // We may need to add verification that there exists the correct arguments
        return await this.verifyAuthentication(validToken, decodedToken, query); 
    }

    // TODO: Rename this function to something more correctly descriptive
    verifyAuthentication(validToken, decodedToken, query){
        // NoAuth = 'NA', TokenCreation = 'TC', TokenRegeneration = 'TR', Authorize+Authenticate (Token Only) = 'AA_TO', 'Authorize + Authenticate (Token And Password)'
        // NOTE: Authorization doesn't happen here to reduce overhead from multiple calls to the db for same resource - It will be handled by the data-store component
        if (this.authenticationType === 'NA'){
            return true;
        } else if (this.authenticationType === 'AA_TO'){
            if (!validToken){
                throw new UnauthenticatedUserError();
            } else {
                return true;
            }
        } else if (this.authenticationType === 'AA_TAP'){
            if (!validToken){
                throw new UnauthenticatedUserError();
            } else if (query.password === undefined){
                throw new BadArgumentError(); // TODO: Check whether this is the correct error
            } else if (!this.isUserPasswordValid(decodedToken.userID, query.password)){
                throw new InvalidCredentialsError();
            } else {
                return true;
            }
        } else {
            throw new ServerException();
        }
    }

    isUserPasswordValid(userID, password){
        // TODO: Check whether this sql query string is correct
        const getHash = 'SELECT passhash FROM Account WHERE userid = $1';
        return this.db.simpleQuery(getHash, [userID]).then(res => {
            if (res.length === 0){
                throw new InvalidCredentialsError();
            } else if (res.length > 1){
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

}


module.exports = {
    SecurityValidate,
    AuthenticationHandler
}
