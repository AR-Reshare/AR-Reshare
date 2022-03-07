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

describe('System Test 5b - /listing/create', () => {
    test('Class 1: No valid authentication token', () => {
        let token = 'NotAValidToken';
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 1,
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });

    // Class 2 is out of scope, relates to moderation

    // Class 3 is a superclass

    test('Class 4: No valid title', () => {
        let token = validToken;
        let data = {
            title: 5,
            description: 'A big box of old stuff',
            location: 1,
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    // Class 5 is out of scope

    // Class 6 is a superclass

    test('Class 7: No valid description', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 5,
            location: 1,
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    // Class 8 is out of scope

    // Class 9 is a superclass

    test('Class 10: No valid location ID or description', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 'the bin behind greggs',
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    test('Class 11: An ID that does not correspond to an existing address', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 5000,
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });

    test('Class 12: The ID of an address associated with another user', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 2,
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 13: The ID of a listing associated with the current user', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 1,
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(201);
    });

    test('Class 14: A valid location description', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: {
                country: 'Testenstein',
                region: 'Beep Boop',
                postcode: 'TE5 7Y',
            },
            categoryID: 1,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(201);
    });

    test('Class 15: No valid category ID', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 1,
            categoryID: 'no',
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 16: An ID that does not correspond to an existing category', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 1,
            categoryID: 5000,
            condition: 'good',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });

    // Class 17 is a superclass

    test('Class 18: No valid condition', () => {
        let token = validToken;
        let data = {
            title: 'Old Stuff',
            description: 'A big box of old stuff',
            location: 1,
            categoryID: 1,
            condition: 'absolutely abyssmal',
        };

        return request(app.app)
            .post('/listing/create')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });

    // Class 19 is a superclass
});
