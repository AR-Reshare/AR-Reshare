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

describe('System Test 10d - /conversations', () => {
    test('Class 1: No token', () => {
        let data = {
            startResults: 0,
            maxResults: 5,
        };

        return request(app.app)
            .get(`/conversations?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .expect(401);
    });

    test('Class 2: No valid token', () => {
        let token = 'AAAAAA';
        let data = {
            startResults: 0,
            maxResults: 5,
        };

        return request(app.app)
            .get(`/conversations?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(401);
    });

    test('Class 3: No startResults', () => {
        let token = validToken;
        let data = {
            maxResults: 5,
        };

        return request(app.app)
            .get(`/conversations?maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 4: Invalid startResults', () => {
        let token = validToken;
        let data = {
            startResults: -1,
            maxResults: 5,
        };

        return request(app.app)
            .get(`/conversations?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 5: No maxResults', () => {
        let token = validToken;
        let data = {
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversations?startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 6: Invalid maxResults', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: -1,
        };

        return request(app.app)
            .get(`/conversations?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 7: Valid request', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
        };

        return request(app.app)
            .get(`/conversations?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toHaveProperty('conversations');
                expect(res.body.conversations[0]).toMatchObject({
                    conversationID: 1,
                    listingID: 12,
                    title: '8-sided die',
                    receiverID: 1,
                    receiverName: 'Testy McTestface',
                    mimetype: 'image/png',
                    url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647439009/waybqdplrqim13mapgx1.png',
                    contributorID: 2,
                    contributorName: 'Kevin McTestface'
                });
            });
    });
});
