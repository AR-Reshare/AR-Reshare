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

describe('System Test 1d - /profile/view', () => {
    test('Class 1: No userID', () => {
        let maxResults = 5;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?startResults=${startResults}&maxResults=${maxResults}`)
            .expect(400);
    });

    test('Class 2: UserID is not a valid ID', () => {
        let userid = 'banana';
        let maxResults = 5;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&startResults=${startResults}&maxResults=${maxResults}`)
            .expect(400);
    });
    
    test('Class 3: UserID does not match an account', () => {
        let userid = 5000;
        let maxResults = 5;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&startResults=${startResults}&maxResults=${maxResults}`)
            .expect(404);
    });
    
    test('Class 4: userID matches a closed account', () => {
        let userid = 4;
        let maxResults = 5;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&startResults=${startResults}&maxResults=${maxResults}`)
            .expect(404);
    });

    test('Class 5: No maxResults', () => {
        let userid = 2;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&startResults=${startResults}`)
            .expect(400);
    });

    test('Class 6: Invalid maxResults', () => {
        let userid = 2;
        let maxResults = -1;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&startResults=${startResults}&maxResults=${maxResults}`)
            .expect(400);
    });

    test('Class 7: No startResults', () => {
        let userid = 2;
        let maxResults = 5;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&maxResults=${maxResults}`)
            .expect(400);
    });

    test('Class 8: Invalid startResults', () => {
        let userid = 2;
        let maxResults = 5;
        let startResults = -1;
        return request(app.app)
            .get(`/profile/view?userID=${userid}&startResults=${startResults}&maxResults=${maxResults}`)
            .expect(400);
    });

    test('Class 9: userID matches an open account', () => {
        let userID = 25;
        let maxResults = 5;
        let startResults = 0;
        return request(app.app)
            .get(`/profile/view?userID=${userID}&startResults=${startResults}&maxResults=${maxResults}`)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    name: 'Bob Robertson',
                    mimetype: 'image/png',
                    url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647439009/waybqdplrqim13mapgx1.png',
                });
                expect(res.body).toHaveProperty('listings');
                expect(res.body['listings']).toHaveLength(4);
                expect(res.body['listings'][0]).toMatchObject({
                    listingID: 37,
                    title: 'One Fish',
                    description: 'A single trout',
                    condition: 'good',
                    categoryID: 1,
                    country: 'UK',
                    region: 'Slough',
                    postcode: 'AS1 2DF',
                    mimetype: 'image/jpeg',
                    url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647387134/cld-sample.jpg',
                });
            });
    });
});
