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
    test('Class 1: Email which is not string', (done) => {
        let data = {
            email: 5,
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400, done);
    });

    test('Class 2: Email address which is not registered', (done) => {
        let data = {
            email: 'doesNotExist@nothing.com',
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401, done);
    });

    test('Class 3: Email address which does not match password', (done) => {
        let data = {
            email: 'ronnieo@yahoo.com',
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401, done);
    });

    // class 4 relates to moderation and is no longer in scope

    test('Class 5: Valid email address and password', (done) => {
        let data = {
            email: 'testy@testingtons.net',
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(200, done);
            // TODO: add logic for checking JWT
    });

    test('Class 6: Password which is not a string', (done) => {
        let data = {
            email: 'testy@testingtons.net',
            password: 8,
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400, done);
    });

    test('Class 7: Incorrect password', (done) => {
        let data = {
            email: 'testy@testingtons.net',
            password: 'Wrong',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(401, done);
    });

    test('Class 8: No email', (done) => {
        let data = {
            password: 'Password123',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400, done);
    });

    test('Class 9: No password', (done) => {
        let data = {
            email: 'testy@testingtons.net',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(400, done);
    });

    test('Class 10: Device token given', (done) => {
        let data = {
            email: 'testy@testingtons.net',
            password: 'Password123',
            device_token: 'AAAAAAAAAA',
        };

        return request(app.app)
            .post('/account/login')
            .send(data)
            .expect(200, done);
    });
});
