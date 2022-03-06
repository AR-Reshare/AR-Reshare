const fs = require('fs/promises');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const {DirtyArgumentError, AbsentArgumentError, PrivateKeyReadError, UnauthenticatedUserError, InvalidCredentialsError,
    InvalidTokenError, TamperedTokenError, ExpiredTokenError, NotBeforeTokenError, ServerException, QueryExecutionError, TemplateError} = require('./errors.js');
const path = require('path');
const bcrypt = require('bcrypt');

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
            return decodedToken;
        } else {
            return null;
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
        const decodedToken = await SecurityValMethods.verifyToken(token);
        if (!decodedToken){
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
        const getHash = 'SELECT userid, passhash FROM Account WHERE email = $1 AND DeletionDate IS NULL';
        let userID;
        return db.simpleQuery(getHash, [email]).then(res => {
            if (res[0].length === 0){
                throw new InvalidCredentialsError();
            } else if (res[0].length > 1){
                throw new QueryExecutionError();
            } else {
                userID = res[0][0].userid;
                return bcrypt.compare(password, res[0][0].passhash);
            }
        }).then(result => {
            if (result) return userID;
            else throw new InvalidCredentialsError();
        });
    }

   
}




// NOTE: The design is as follow: 
// 1. SecurityValidation constructor recieves parameters which define how it will validate a single resource
// 2. SecurityValidation's process() method is then called using the input object that it is validating
// (1 + 2), are both called using the pipeline
class SecuritySchema extends SecurityValMethods{
    // constructor(params){
    constructor(authMode) {
        super(); // SecurityValMethods provide static methods
        const supportedAuthTypes = ['NA', 'AA_TAP', 'AA_TO'];
        // Authentication Requirement: [AA_TAP, AA_TO, NA] and [TC, TR]

        if (!authMode) {
            // these should all be TemplateErrors, the others represent execution-time errors
            throw new TemplateError('authMode not provided');
        } else if (!(typeof authMode === 'string' || authMode instanceof String)) {
            throw new TemplateError('authMode not a string');
        } else if (!(supportedAuthTypes.includes(authMode.toUpperCase()))){
            throw new TemplateError('auth not a supported type');
        } else {
            this.authenticationType = authMode;
        }
    }

    // NOTE: This is the main function that will be called
    async process(db, token, query){
        // First we check whether the token is correct
        const decodedToken = await SecurityValMethods.verifyToken(token);
        // We may need to add verification that there exists the correct arguments
        return await this.verifyAuthentication(db, decodedToken, query); 
    }

    noToken(){
        if (this.authenticationType === 'NA') {
            return null;
        } else {
            throw new UnauthenticatedUserError();
        }
    }

    // TODO: Rename this function to something more correctly descriptive
    async verifyAuthentication(db, decodedToken, query){
        // NoAuth = 'NA', TokenCreation = 'TC', TokenRegeneration = 'TR', Authorize+Authenticate (Token Only) = 'AA_TO', 'Authorize + Authenticate (Token And Password)'
        // NOTE: Authorization doesn't happen here to reduce overhead from multiple calls to the db for same resource - It will be handled by the data-store component
        if (this.authenticationType === 'NA'){
            return (decodedToken ? decodedToken.userID : null); // In case the user is authenticated but accesses a resource that doesn't require auth
        } else if (this.authenticationType === 'AA_TO'){
            if (!decodedToken){
                throw new UnauthenticatedUserError();
            } else {
                return decodedToken.userID;
            }
        } else if (this.authenticationType === 'AA_TAP'){
            if (!decodedToken){
                throw new UnauthenticatedUserError();
            } else if (query.password === undefined){
                throw new InvalidCredentialsError();
            } else if (!await this.isUserPasswordValid(db, decodedToken.userID, query.password)){
                throw new InvalidCredentialsError();
            } else {
                return decodedToken.userID;
            }
        } else {
            throw new ServerException();
        }
    }

    isUserPasswordValid(db, userID, password){
        // TODO: Check whether this sql query string is correct
        const getHash = 'SELECT passhash FROM Account WHERE userid = $1 AND DeletionDate IS NULL';
        return db.simpleQuery(getHash, [userID]).then(res => {
            if (res.length === 0){
                throw new InvalidCredentialsError();
            } else if (res.length > 1){
                throw new QueryExecutionError();
            } else {
                return bcrypt.compare(password, res[0][0].passhash);
            }
        }).then(result => {
            if (result) return userID;
            else throw new InvalidCredentialsError();
        });
    }
}


module.exports = {
    SecuritySchema,
    AuthenticationHandler
}
