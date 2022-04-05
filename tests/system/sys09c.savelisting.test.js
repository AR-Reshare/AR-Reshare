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

describe('System Test 9 - /account/saved-listings/create', () => {
    test('Class 1: No listingID', () => {
        let token = validToken;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .expect(400);
    });

    test('Class 2: ListingID is not a valid ID', () => {
        let token = validToken;
        let listingid = 'banana';
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(400);
    });
    
    test('Class 3: ListingID does not match a listing', () => {
        let token = validToken;
        let listingid = 5000;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(404);
    });

    test('Class 4: No token', () => {
        let listingid = 2;
        return request(app.app)
            .post('/account/saved-listings/create')
            .send({listingID: listingid})
            .expect(401);
    });
    
    test('Class 5: No valid token', () => {
        let token = 'ABCDEF';
        let listingid = 2;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(401);
    });

    // Class 6 removed
    
    test('Class 7: My closed listing', () => {
        let token = validToken;
        let listingid = 1;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(404);
    });

    test('Class 8: My received listing', () => {
        let token = validToken;
        let listingid = 3;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(404);
    });

    test('Class 9: Someone else\'s closed listing', () => {
        let token = validToken;
        let listingid = 4;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(404);
    });

    test('Class 10: An open listing', () => {
        let token = validToken;
        let listingid = 2;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(200)
            .expect({success: true});
    });

    test('Class 11: An already saved listing', () => {
        let token = validToken;
        let listingid = 12;
        return request(app.app)
            .post('/account/saved-listings/create')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(409);
    });
});
