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

describe('System Test 5a - /categories/list', () => {
    test('Class 1: Valid request', () => {
        return request(app.app)
            .get('/categories/list')
            .expect(200)
            .expect(/categories/)
            .expect(/"Misc"/)
            .expect(/prompt/);
    });
});
