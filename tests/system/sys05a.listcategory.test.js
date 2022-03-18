const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../secrets/dbconnection.json');

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
            .expect(res => {
                expect(res.body).toHaveProperty('categories');
                expect(res.body['categories'][0]).toMatchObject({
                    categoryID: 1,
                    categoryName: 'Misc',
                    icon: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647387110/samples/cloudinary-icon.png',
                    colour: 'FFFFFFFF',
                    prompt: 'Remember to do the things',
                    parentCategoryID: null,
                });
            });
    });
});
