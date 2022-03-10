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

describe('System Test 8 - /listings/search', () => {
    test('Class 1: No token', () => {
        let data = {
            startResults: 0,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .expect(401);
    });

    test('Class 2: Invalid token', () => {
        let token = 'AAAAA';
        let data = {
            startResults: 0,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(401);
    });

    test('Class 3: No maximum', () => {
        let token = validToken;
        let data = {
            startResults: 0,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 4: Invalid maximum', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: -1,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 5: No start', () => {
        let token = validToken;
        let data = {
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/listings/search?maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 6: Invalid start', () => {
        let token = validToken;
        let data = {
            startResults: -1,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 7: Valid search', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 5) throw new Error()});
    });
    
    test('Class 8: Invalid CategoryID', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            categoryID: -1,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&categoryID=${data.categoryID}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 9: Valid search with filtering', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            categoryID: 2,
        };
        return request(app.app)
            .get(`/account/listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&categoryID=${data.categoryID}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 3) throw new Error()});
    });
});
