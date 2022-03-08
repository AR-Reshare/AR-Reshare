const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../connection.json');

const request = require('supertest');

const db = new Database(credentials['test']);
const logger = console;
const app = new App(db, logger);

afterAll(() => {
    db.end();
});

describe('System Test 1b - /account/login', () => {
    test('Class 1: Email which is not string', () => {
        let data = {
            email: 5,
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400);
    });

    test('Class 2: Email address which is not registered', () => {
        let data = {
            email: 'doesNotExist@nothing.com',
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401);
    });

    test('Class 3: Email address which does not match password', () => {
        let data = {
            email: 'ronnieo@yahoo.com',
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401);
    });

    // class 4 relates to moderation and is no longer in scope

    test('Class 5: Valid email address and password', () => {
        let data = {
            email: 'testy@testingtons.net',
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(200)
            .expect('Authorization', /.*/); //TODO: find a regex/other expression that does this right
    });

    test('Class 6: Password which is not a string', () => {
        let data = {
            email: 'testy@testingtons.net',
            password: 8,
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400);
    });

    test('Class 7: Incorrect password', () => {
        let data = {
            email: 'testy@testingtons.net',
            password: 'Wrong',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401);
    });

    test('Class 8: No email', () => {
        let data = {
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400);
    });

    test('Class 9: No password', () => {
        let data = {
            email: 'testy@testingtons.net',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400);
    });

    test('Class 10: Device token given', () => {
        let data = {
            email: 'testy@testingtons.net',
            password: 'Password123',
            deviceToken: 'AAAAAAAAAA',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(200);
    });

    test('Class 11: Deactivated account', () => {
        let data = {
            email: 'gary.cheeseman@aol.com',
            password: '12345QWERTY',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401);
    });
});
