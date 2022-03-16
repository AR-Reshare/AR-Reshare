/*
* @jest-environment node
*/

const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../connection.json');
const cloudinary = require('cloudinary').v2;
const mediaConfig = require('../../configs/mediaConfig.json');

const { AuthenticationHandler } = require('../../classes/securityvalidation');
const { readFileSync } = require('fs');

const request = require('supertest');

cloudinary.config(mediaConfig);

const db = new Database(credentials['test']);
const logger = console;
const mediaHandler = cloudinary.uploader;
const app = new App(db, logger, null, mediaHandler);
let validToken;

beforeAll(() => {
    return AuthenticationHandler.createNewToken(db, 'testy@testingtons.net', 'Password123').then(res => {
        validToken = res;
    });
});

afterAll(() => {
    db.end();
});

describe('System Test 10b - /conversation/message', () => {
    test('Class 1: No token', () => {
        let data = {
            conversationID: 1,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .send(data)
            .expect(401);
    });

    test('Class 2: No valid token', () => {
        let token = 'AAAAAA';
        let data = {
            conversationID: 1,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });

    test('Class 3: No conversationID', () => {
        let token = validToken;
        let data = {
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    test('Class 4: Invalid conversationID', () => {
        let token = validToken;
        let data = {
            conversationID: -1,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 5: ID does not match a conversation', () => {
        let token = validToken;
        let data = {
            conversationID: 5000,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 6: ID matches a closed conversation', () => {
        let token = validToken;
        let data = {
            conversationID: 2,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });

    test('Class 7: ID matches a conversation that does not involve this user', () => {
        let token = validToken;
        let data = {
            conversationID: 3,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 8: ID matches a conversation where this user is receiver', () => {
        let token = validToken;
        let data = {
            conversationID: 1,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(201)
            .expect(/success/);
    });
    
    test('Class 9: ID matches a conversation where this user is giver', () => {
        let token = validToken;
        let data = {
            conversationID: 4,
            textContent: 'Hello',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(201)
            .expect(/success/);
    });

    test('Class 10: No text content', () => {
        let token = validToken;
        let data = {
            conversationID: 4,
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    test('Class 11: Invalid text content', () => {
        let token = validToken;
        let data = {
            conversationID: 4,
            textContent: '',
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    test('Class 12: Valid media content', () => {
        let token = validToken;
        let data = {
            conversationID: 4,
            textContent: 'Hello',
            media: [readFileSync('tests/data/b64_img.txt').toString()],
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(201);
    });

    test('Class 13: Invalid media content', () => {
        let token = validToken;
        let data = {
            conversationID: 4,
            textContent: 'Hello',
            media: ['data:picture/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAGACAYAAACkx7W/AAAAB'],
        };

        return request(app.app)
            .put('/conversation/message')
            .set('Authorization', token)
            .send(data)
            .expect(422);
    });
});
