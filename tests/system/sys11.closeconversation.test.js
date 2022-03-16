const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../secrets/dbconnection.json');
const { AuthenticationHandler } = require('../../classes/securityvalidation');

const request = require('supertest');

const db = new Database(credentials['test']);
const logger = console;
const app = new App(db, logger);
let validToken;

beforeAll(() => {
    return AuthenticationHandler.createNewToken(db, 'testy@testingtons.net', 'Password123').then(res => {
        validToken = res;
    });
});

afterAll(() => {
    db.end();
});

describe('System Test 11 - /conversation/close', () => {
    test('Class 1: No token', () => {
        let data = {
            conversationID: 5,
        };

        return request(app.app)
            .patch('/conversation/close')
            .send(data)
            .expect(401);
    });

    test('Class 2: No valid token', () => {
        let token = 'AAAAAA';
        let data = {
            conversationID: 6,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });

    test('Class 3: No conversationID', () => {
        let token = validToken;
        let data = {
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    test('Class 4: Invalid conversationID', () => {
        let token = validToken;
        let data = {
            conversationID: -1,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 5: ID does not match a conversation', () => {
        let token = validToken;
        let data = {
            conversationID: 5000,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 6: ID matches a closed conversation', () => {
        let token = validToken;
        let data = {
            conversationID: 7,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });

    test('Class 7: ID matches a conversation that does not involve this user', () => {
        let token = validToken;
        let data = {
            conversationID: 8,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 8: ID matches a conversation where this user is receiver', () => {
        let token = validToken;
        let data = {
            conversationID: 9,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(200)
            .expect({success: true});
    });
    
    test('Class 9: ID matches a conversation where this user is giver', () => {
        let token = validToken;
        let data = {
            conversationID: 10,
        };

        return request(app.app)
            .patch('/conversation/close')
            .set('Authorization', token)
            .send(data)
            .expect(200)
            .expect({success: true});
    });
});
