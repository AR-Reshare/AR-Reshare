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

describe('System Test 10c - /conversation/view', () => {
    test('Class 1: No token', () => {
        let data = {
            conversationID: 1,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .expect(401);
    });

    test('Class 2: No valid token', () => {
        let token = 'AAAAAA';
        let data = {
            conversationID: 1,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(401);
    });

    test('Class 3: No maxResults', () => {
        let token = validToken;
        let data = {
            conversationID: 1,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });

    test('Class 4: Invalid maxResults', () => {
        let token = validToken;
        let data = {
            conversationID: 1,
            maxResults: -1,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 5: No startResults', () => {
        let token = validToken;
        let data = {
            conversationID: 1,
            maxResults: 5,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 6: Invalid startResults', () => {
        let token = validToken;
        let data = {
            conversationID: 1,
            maxResults: 5,
            startResults: -1,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });

    test('Class 7: No conversationID', () => {
        let token = validToken;
        let data = {
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });

    test('Class 8: Invalid conversationID', () => {
        let token = validToken;
        let data = {
            conversationID: -1,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 9: ID does not match a conversation', () => {
        let token = validToken;
        let data = {
            conversationID: 5000,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(404);
    });
    
    test('Class 10: ID matches a closed conversation', () => {
        let token = validToken;
        let data = {
            conversationID: 2,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    listingID: 24,
                    title: 'Stuff',
                    mimetype: null,
                    url: null,
                    receiverID: 1,
                    receiverName: 'Testy McTestface',
                    contributorID: 2,
                    contributorName: 'Kevin McTestface',
                });
                expect(res.body).toHaveProperty('closedDate');
                expect(res.body.closedDate).not.toBeNull();
                expect(res.body).toHaveProperty('messages');
                expect(res.body.messages).toHaveLength(3);
                expect(res.body.messages[2]).toMatchObject({ // 2 instead of 0 because the order is reversed
                    senderID: 1,
                    textContent: 'Hello',
                });
            });
    });

    test('Class 11: ID matches a conversation that does not involve this user', () => {
        let token = validToken;
        let data = {
            conversationID: 3,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(404);
    });

    test('Class 12: ID matches a conversation where this user is receiver', () => {
        let token = validToken;
        let data = {
            conversationID: 11,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    listingID: 25,
                    title: 'Widgets',
                    mimetype: 'image/jpeg',
                    url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647387134/cld-sample.jpg',
                    receiverID: 1,
                    receiverName: 'Testy McTestface',
                    contributorID: 2,
                    contributorName: 'Kevin McTestface',
                    closedDate: null,
                });
                expect(res.body).toHaveProperty('messages');
                expect(res.body.messages).toHaveLength(3);
                expect(res.body.messages[2]).toMatchObject({
                    senderID: 1,
                    textContent: 'Give me your stuff',
                    mediaContentMimetype: 'image/png',
                    mediaContent: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647439009/waybqdplrqim13mapgx1.png',
                });
            });
    });
    
    test('Class 13: ID matches a conversation where this user is giver', () => {
        let token = validToken;
        let data = {
            conversationID: 12,
            maxResults: 5,
            startResults: 0,
        };

        return request(app.app)
            .get(`/conversation/view?conversationID=${data.conversationID}&maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    listingID: 26,
                    title: 'Things',
                    mimetype: null,
                    url: null,
                    receiverID: 2,
                    receiverName: 'Kevin McTestface',
                    contributorID: 1,
                    contributorName: 'Testy McTestface',
                    closedDate: null,
                });
                expect(res.body).toHaveProperty('messages');
                expect(res.body.messages).toHaveLength(3);
                expect(res.body.messages[2]).toMatchObject({
                    senderID: 1,
                    textContent: 'Greetings earthling',
                });
            });
    });
});
