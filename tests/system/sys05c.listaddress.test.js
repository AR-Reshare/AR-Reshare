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

describe('System Test 5c - /account/addresses/list', () => {
    test('Class 1: No valid token', () => {
        let token = 'ABCDEF';

        return request(app.app)
            .get('/account/addresses/list')
            .set('Authorization', token)
            .expect(401);
    });

    test('Class 2: Valid token', () => {
        let token = validToken;

        return request(app.app)
            .get('/account/addresses/list')
            .set('Authorization', token)
            .expect(200)
            .expect(/addresses/)
            .expect(/UK/)
            .expect(/AB1 2CD/)
            .expect(res => {
                if (res.body['addresses'].some(addr => addr['postcode'] === 'asdfgh')) throw new Error('Other address returned');
            });
    });
});
