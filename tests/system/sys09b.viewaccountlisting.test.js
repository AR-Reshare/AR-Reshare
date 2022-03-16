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

describe('System Test 9 - /listing/view', () => {
    test('Class 1: No listingID', () => {
        let token = validToken;
        return request(app.app)
            .get('/account/listing/view')
            .set('Authorization', token)
            .expect(400);
    });

    test('Class 2: ListingID is not a valid ID', () => {
        let token = validToken;
        let listingid = 'banana';
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 3: ListingID does not match a listing', () => {
        let token = validToken;
        let listingid = 5000;
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .set('Authorization', token)
            .expect(404);
    });

    test('Class 4: No token', () => {
        let listingid = 2;
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .expect(401);
    });
    
    test('Class 5: No valid token', () => {
        let token = 'ABCDEF';
        let listingid = 2;
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .set('Authorization', token)
            .expect(401);
    });

    // Class 6 removed
    
    test('Class 7: My closed listing', () => {
        let token = validToken;
        let listingid = 1;
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    listingID: 1,
                    contributorID: 1,
                    title: 'Things',
                    description: 'Some stuff',
                    condition: 'good',
                    location: {
                        country: 'UK',
                        region: 'Durham',
                        postcode: 'AB1 2CD',
                    },
                    categoryID: 1,
                    media: [{
                        mimetype: 'image/png',
                        url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647439009/waybqdplrqim13mapgx1.png'
                    }, {
                        mimetype: 'image/jpeg',
                        url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647387110/sample.jpg',
                    }],
                });
                expect(res.body).toHaveProperty('creationDate');
                expect(res.body).toHaveProperty('modificationDate');
                expect(res.body).toHaveProperty('closedDate');
                expect(res.body).toHaveProperty('receiverID');
            });
    });

    test('Class 8: My received listing', () => {
        let token = validToken;
        let listingid = 3;
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    listingID: 3,
                    contributorID: 2,
                    title: 'Egg box three hundred and sixty', // I was getting a bit bored of writing test cases by this point
                    description: 'For playing of the viddy games',
                    condition: 'like new',
                    location: {
                        country: 'US',
                        region: 'Abcdef, GH',
                        postcode: 'asdfgh',
                    },
                    categoryID: 1,
                    media: [],
                });
                expect(res.body).toHaveProperty('creationDate');
                expect(res.body).toHaveProperty('modificationDate');
                expect(res.body).toHaveProperty('closedDate');
                expect(res.body).toHaveProperty('receiverID', 1);
            });
    });

    test('Class 9: Someone else\'s closed listing', () => {
        let token = validToken;
        let listingid = 4;
        return request(app.app)
            .get(`/account/listing/view?listingID=${listingid}`)
            .set('Authorization', token)
            .expect(404);
    });
});
