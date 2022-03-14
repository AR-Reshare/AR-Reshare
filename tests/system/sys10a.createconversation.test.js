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

describe('System Test 10 - /conversation/create', () => {
    test('Class 1: No token', () => {
        let data = {
            listingID: 2,
        };

        return request(app.app)
            .put('/conversation/create')
            .send(data)
            .expect(401);
    });

    test('Class 2: No valid token', () => {
        let token = 'AAAAAA';
        let data = {
            listingID: 2,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });

    test('Class 3: No listingID', () => {
        let token = validToken;
        let data = {
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    test('Class 4: Invalid listingID', () => {
        let token = validToken;
        let data = {
            listingID: -1,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 5: ID does not match a listing', () => {
        let token = validToken;
        let data = {
            listingID: 5000,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 6: ID matches a closed listing', () => {
        let token = validToken;
        let data = {
            listingID: 3,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 7: ID matches a listing this user already has a conversation about', () => {
        let token = validToken;
        let data = {
            listingID: 12,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(409);
    });
    
    test('Class 8: ID matches a listing this user created', () => {
        let token = validToken;
        let data = {
            listingID: 1,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 9: ID matches a valid listing', () => {
        let token = validToken;
        let data = {
            listingID: 2,
        };

        return request(app.app)
            .put('/conversation/create')
            .set('Authorization', token)
            .send(data)
            .expect(201)
            .expect(/success/);
    });
});
