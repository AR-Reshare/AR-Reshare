const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../secrets/dbconnection.json');
const { AuthenticationHandler } = require('../../classes/securityvalidation');

const request = require('supertest');

const db = new Database(credentials['test']);
const logger = console;
const app = new App(db, logger);

afterAll(() => {
    db.end();
});

describe('System Test 3 - /account/close', () => {
    test('Class 1: No token', () => {
        let data = {
            accountID: 5,
            password: 'Password123',
        };

        return request(app.app)
            .patch('/account/close')
            .send(data)
            .expect(401);
    });

    test('Class 2: Invalid token', () => {
        let token = 'ABCDEF';
        let data = {
            accountID: 6,
            password: 'Password123',
        };

        return request(app.app)
            .patch('/account/close')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });

    test('Class 3: No password', () => {
        let data = {
        };

        return AuthenticationHandler.createNewToken(db, 'killme3@gmail.com', 'Password123').then(token => {
            return request(app.app)
                .patch('/account/close')
                .set('Authorization', token)
                .send(data)
                .expect(401);
        });
    });
    
    test('Class 4: Wrong password', () => {
        
        return AuthenticationHandler.createNewToken(db, 'killme4@gmail.com', 'Password123').then(token => {
            let data = {
                password: 'wrong',
            };
            return request(app.app)
                .patch('/account/close')
                .set('Authorization', token)
                .send(data)
                .expect(401);
        });
    });
    
    test('Class 5: Valid deletion', () => {
        
        return AuthenticationHandler.createNewToken(db, 'killme5@gmail.com', 'Password123').then(token => {
            let data = {
                password: 'Password123',
            };
            return request(app.app)
                .patch('/account/close')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });
});
