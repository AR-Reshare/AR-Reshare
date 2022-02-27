// 1. We create a mock pipeline function
// 2. We call the pipeline securityValidate function() from the mock pipeline
// 3. For each call, we use a different class of input arguments

// The classes are as specified in the Test Plan Report
// NOTE: These may be updated as we find new classes that aren't covered, or in order to split non-atomic classes

// Classes:
// C1. Token String Empty
// C2. Token String is not valid base64 format
// C3. Token String is not in JWT format (i.e. it there base64strings with dot/period dividers)
// C4. Token String isn't parsed into a valid JSON format
// C5. Token String is in a valid format
// NOTE: There is no C6 -- (This is an admin error)
// C7. (C5 and) The token has been tampered with.
// C8. (C5 and) The token has expired.
// C9. (C5 and) The token can be verified 
// C10. (C9. and) The user is not authorised.
// C11. (C9. and) The user is authorised.

// Additionally, we will want to test the above classes on four different request types:

// Requests:
// C12. Authorisation is required for the request.
// C13. Authorisation is optional for the request.
// C14. The request is to generate a token.
// C15. The request is to update a token.

// NOTE: These components are stateless, that mean that there should be no need to perform setup/teardowns for
// states. So far, the basic functionality of this component shouldn't have any dependencies (although, the recent
// decision to merge verification and signing components together will most likley change this).

// TODO: Ensure that the logic is encapsulated in the Pipeline as a function for the securityvalidate

// TODO: Test AA_TAP type methods
// TODO: Check whether all 5 authenticationTYpes are defined in the security-schemas.js

const jwt = require('jsonwebtoken');
const Database = require('../../classes/database');
const Pipeline = require('../../classes/pipeline.js');
const {SecurityValidate, AuthenticationHandler} = require('../../classes/securityvalidation.js');
const {AbsentArgumentError, DirtyArgumentError, PrivateKeyReadError, AlreadyAuthenticatedError, UnauthenticatedUserError, UnauthorizedUserError, InvalidCredentialsError,
    InvalidTokenError, TamperedTokenError, ExpiredTokenError, NotBeforeTokenError, ServerException, QueryExecutionError} = require('../../classes/errors.js');

// Based on unit14.pipeline.store.test.js
const mockDBInner = jest.fn();
const mockDBPromise = () => {
    return new Promise((res, rej) => {
        let result = mockDBInner();
        if (result instanceof Error) {
            rej(result);
        } else {
            res(result);
        }
    });
};
    
jest.mock('../../classes/database', () => {
    return jest.fn().mockImplementation(() => {
        return {
            simpleQuery: mockDatabaseSimple,
            complexQuery: mockDatabaseComplex,
        };
    });
});

const mockDatabaseSimple = jest.fn().mockImplementation(mockDBPromise);
const mockDatabaseComplex = jest.fn().mockImplementation(mockDBPromise);

let db, pipe, key, query;
beforeAll(() => {
    db = new Database();
    pipe = new Pipeline(db);
    key = 'testsecretkeybase';
    query = {};
});

beforeEach(() => {
    Database.mockClear();
    mockDBInner.mockClear();
    mockDatabaseComplex.mockClear();
    mockDatabaseSimple.mockClear();
});


describe('Unit Test 12 - Pipeline.SecurityValidation (Assessing Token Format)', () => {
    test('Class 1: Token String Empty', () => {
        let inputToken = '';
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(() => {
            return securitySchema.process(inputToken, query);
        }).rejects.toEqual(new InvalidTokenError());
    });

    test('Class 2: Token String is not valid base64', () => {
        let inputToken = '!(xfdsa]x';
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(() => {
            return securitySchema.process(inputToken, query);
        }).rejects.toEqual(new InvalidTokenError());
    });

    test('Class 3: Token String is not in valid JWT format', () => {
        // inputToken = base64.encode('hello') + '.' + base64.encode('there')
        let inputToken = 'aGVsbG8K.dGhlcmUK';
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(() => {
            return securitySchema.process(inputToken, query);
        }).rejects.toEqual(new InvalidTokenError());
    });

    test('Class 4: Token String isn\'t parsed into valid JSON object', () => {
        // inputToken = base64.encode('{'username','password','invalidformat'}')
        let inputToken = 'eyJ1c2VybmFtZSIsInBhc3N3b3JkIiwiaW52YWxpZGZvcm1hdCJ9';
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(() => {
            return securitySchema.process(inputToken, query);
        }).rejects.toEqual(new InvalidTokenError());
    });

    test('Class 5: Token String is in a valid format', () => {
        // inputToken = default encoded token example from https://jwt.io/
        let inputToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        // NOTE: This isn't tested as the below test set are subsets of class 5
        
    });
});


describe('Unit Test 12 - Pipeline.SecurityValidation (Verifying Token)', () => {
    // NOTE: THis is empty in the test plan report (is this an ommission error, or did we just skip it?)
    test('Class 6: Unknown Class', () => {
        //pass
    });
    // NOTE: We cannot absolutely say if a token has been tampered with, only that the token information doesn't add up
    test('Class 7: The token has been tampered with', () => {
        let payload = {
            name: 'BasicUser12345',
        };

        let modifiedPayload = {
            name: 'samsepi0l',
        };

        let signedToken = jwt.sign(payload, key, {algorithm: 'HS256'});
        let tokenSections = signedToken.split('.');
        tokenSections[1] = btoa(JSON.stringify(modifiedPayload));

        let inputToken = tokenSections.join('.');
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(() => {
            return securitySchema.process(inputToken, query);
        }).rejects.toEqual(new TamperedTokenError());

    });

    test('Class 8: The token has expired', () => {
        let payload = {
            name: 'Sam Sepiol',
        };

        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256', expiresIn: 0})
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(() => {
            return securitySchema.process(inputToken, query);
        }).rejects.toEqual(new ExpiredTokenError());
    });

    test('Class 9: The token can be verified successfully', () => {
        let payload = {
            name: 'Sam Sepiol',
        };

        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256'});
        let resourceName = '/';
        let query = null;
        let securitySchema = new SecurityValidate({auth: 'NA', resourceName:`${resourceName}`, db:  pipe.db});

        return expect(securitySchema.process(inputToken, query)).resolves.toEqual(true);
    });

});

//TODO: We need to create mock objects for the db that's referenced by the pipeline
describe('Unit Test 12 - Pipeline.SecurityValidation (Account Login)', () => {
    // NOTE: THis is empty in the test plan report (is this an ommission error, or did we just skip it?)
    test('Class 13: No Username', () => {

        mockDatabaseSimple.mockReturnValueOnce(["hashedpassword"]);
        let payload = {name: 'Sam Sepiol'};
        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256'});
        let resourceName = '/account/login';
        let query = {email: "samsepi0l@protonmail.com", password: 'testtokencreationpassword'};

        return expect(() => {
            return AuthenticationHandler.accountLogin(pipe.db, query);
        }).rejects.toEqual(new AbsentArgumentError());
    });
});


