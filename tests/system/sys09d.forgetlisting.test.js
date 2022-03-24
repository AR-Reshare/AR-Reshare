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

describe('System Test 9 - /account/saved-listings/delete', () => {
    test('Class 1: No listingID', () => {
        let token = validToken;
        return request(app.app)
            .post('/account/saved-listings/delete')
            .set('Authorization', token)
            .expect(400);
    });

    test('Class 2: ListingID is not a valid ID', () => {
        let token = validToken;
        let listingid = 'banana';
        return request(app.app)
            .post('/account/saved-listings/delete')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(400);
    });

    test('Class 3: No token', () => {
        let listingid = 2;
        return request(app.app)
            .post('/account/saved-listings/delete')
            .send({listingID: listingid})
            .expect(401);
    });
    
    test('Class 4: No valid token', () => {
        let token = 'ABCDEF';
        let listingid = 2;
        return request(app.app)
            .post('/account/saved-listings/delete')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(401);
    });

    test('Class 5: ListingID not saved', () => {
        let token = validToken;
        let listingid = 5;
        return request(app.app)
            .post('/account/saved-listings/delete')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(404);
    });

    test('Class 6: Listing saved by others', () => {
        let token = validToken;
        let listingid = 7;
        return request(app.app)
            .post('/account/saved-listings/delete')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(404);
    });

    test('Class 7: Listing saved by this user', () => {
        let token = validToken;
        let listingid = 18;
        return request(app.app)
            .post('/account/saved-listings/delete')
            .set('Authorization', token)
            .send({listingID: listingid})
            .expect(200)
            .expect({success: true});
    });
});
