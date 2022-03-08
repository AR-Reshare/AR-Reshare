const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../connection.json');
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

describe('System Test 7 - /listing/close', () => {
    test('Class 1: No token', () => {
        let data = {
            listingID: 10,
        };

        return request(app.app)
            .post('/listing/close')
            .send(data)
            .expect(401);
    });

    test('Class 2: An invalid token', () => {
        let token = 'ABCDE';
        let data = {
            listingID: 11,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });
    
    test('Class 3: No listingID', () => {
        let token = validToken;
        let data = {
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 4: Listing does not exist', () => {
        let token = validToken;
        let data = {
            listingID: 5000,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 5: Listing belongs to a different account', () => {
        let token = validToken;
        let data = {
            listingID: 12,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 6: Listing is already closed', () => {
        let token = validToken;
        let data = {
            listingID: 13,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 7: Valid close request', () => {
        let token = validToken;
        let data = {
            listingID: 14,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
    
    test('Class 8: Receiver is self', () => {
        let token = validToken;
        let data = {
            listingID: 15,
            receiverID: 1,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 9: Receiver does not exist', () => {
        let token = validToken;
        let data = {
            listingID: 16,
            receiverID: 1000,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 10: Receiver is valid', () => {
        let token = validToken;
        let data = {
            listingID: 17,
            receiverID: 2,
        };

        return request(app.app)
            .post('/listing/close')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
});
