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

describe('System Test 6 - /listing/modify', () => {
    test('Class 1: No token', () => {
        let data = {
            listingID: 27,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .send(data)
            .expect(401);
    });
    
    test('Class 2: Invalid token', () => {
        let token = 'AAAAA';
        let data = {
            listingID: 27,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });
    
    test('Class 3: No listingID', () => {
        let token = validToken;
        let data = {
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 4: Invalid listingID', () => {
        let token = validToken;
        let data = {
            listingID: -1,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
});
