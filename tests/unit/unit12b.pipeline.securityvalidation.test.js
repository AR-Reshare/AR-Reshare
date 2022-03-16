const jwt = require('jsonwebtoken');
const path = require('path');
const Database = require('../../classes/database');
const Pipeline = require('../../classes/pipeline.js');
const { AuthenticationHandler } = require('../../classes/securityvalidation.js');
const { AbsentArgumentError, InvalidTokenError, ExpiredTokenError } = require('../../classes/errors.js');
const { expect } = require('@jest/globals');
const { readFileSync } = require('fs');

// Based on unit14.pipeline.store.test.js
const mockDBInner = jest.fn();
const mockDatabaseSimple = jest.fn().mockImplementation(() => {
    return new Promise((res, rej) => {
        let result = mockDBInner();
        if (result instanceof Error) {
            rej(result);
        } else {
            res(result);
        }
    });
});
    
jest.mock('../../classes/database', () => {
    return jest.fn().mockImplementation(() => {
        return {
            simpleQuery: mockDatabaseSimple,
        };
    });
});

let db, pipe, key, query;
let jwtkeyPath = `secrets${path.sep}jwtsymmetric.key`;

beforeAll(() => {
    db = new Database();
    pipe = new Pipeline(db);
    key = readFileSync(jwtkeyPath);
    query = {};
});

beforeEach(() => {
    Database.mockClear();
    mockDBInner.mockClear();
    mockDatabaseSimple.mockClear();
});

// TODO: Update the test document with these new classes

describe('Unit Test 12 - Pipeline.SecurityValidation (Account Login)', () => {
    test('Class 13: Absent email', () => {
        let query = {password: 'testtokencreationpassword'};

        return expect(() => {
            return AuthenticationHandler.accountLogin(pipe.db, query);
        }).rejects.toEqual(new AbsentArgumentError());
    });

    test('Class 14: Absent password', () => {
        let query = {email: "samsepi0l@protonmail.com"};

        return expect(() => {
            return AuthenticationHandler.accountLogin(pipe.db, query);
        }).rejects.toEqual(new AbsentArgumentError());
    });

    test('Class 15: No query', () => {
        let query = null;

        return expect(() => {
            return AuthenticationHandler.accountLogin(pipe.db, query);
        }).rejects.toEqual(new AbsentArgumentError());
    });

    test('Class 16: Existing Token', () => {
        let payload = {userID: 'ssepi0l527'};
        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256'});
        let query = null;

        return expect(() => {
            return AuthenticationHandler.accountLogin(pipe.db, query, inputToken);
        }).rejects.toEqual(new InvalidTokenError());
    });

    // NOTE: THis is empty in the test plan report (is this an ommission error, or did we just skip it?)
    test('Class 17: Correct Username + Password', () => {
        let db_response = [[{'userid': '12345', 'passhash': '$2a$12$05QAL4HPew6x69wt2E90HuCSs7pitbgD8.b.GGK3JcK1OQVjrlQEG'}]];
        mockDBInner.mockReturnValueOnce(db_response);

        let query = {email: "samsepi0l@protonmail.com", password: 'testtokencreationpassword'};

        return AuthenticationHandler.accountLogin(pipe.db, query).then(async res => {
            const out = await AuthenticationHandler.verifyToken(res);
            expect(out.userID).toBe('12345');
        });
    });

});

// TODO: Add Token Regeneration endpoints to the OAS documents
describe('Unit Test 12 - Pipeline.SecurityValidation (Token Regeneration)', () => {
    test('Class 18: Absent Token', () => {
        let inputToken = null;
        return expect(() => {
            return AuthenticationHandler.regenerateToken(inputToken);
        }).rejects.toEqual(new AbsentArgumentError());
    });

    // No need to check whether SecurityValMethods.verifyToken works since this has already been tested
    test('Class 19: Expired Token', () => {
        let payload = {userID: 'ssepi0l'};
        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256', expiresIn: 0});

        return expect(() => {
            return AuthenticationHandler.regenerateToken(inputToken);
        }).rejects.toEqual(new ExpiredTokenError());
    });

    test('Class 20: Valid Token', () => {
        let payload = {userID: 'ssepi0l'};
        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256', expiresIn: 5*1000});

        return AuthenticationHandler.regenerateToken(inputToken).then(async res => {
            const out = await AuthenticationHandler.verifyToken(res);
            expect(out.userID).toBe('ssepi0l');
        });
    });

});
