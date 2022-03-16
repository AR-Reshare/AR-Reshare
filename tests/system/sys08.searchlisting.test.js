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

describe('System Test 8 - /listings/search', () => {
    test('Class 1: No maximum', () => {
        let data = {
            startResults: 0,
        }
        return request(app.app)
            .get(`/listings/search?startResults=${data.startResults}`)
            .expect(400);
    });

    test('Class 2: Maximum not valid', () => {
        let data = {
            maxResults: -1,
            startResults: 0,
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .expect(400);
    });
    
    test('Class 3: No start', () => {
        let data = {
            maxResults: 5,
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}`)
            .expect(400);
    });

    test('Class 4: Start not valid', () => {
        let data = {
            maxResults: 5,
            startResults: -1,
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .expect(400);
    });

    test('Class 5: Valid search, no filtering', () => {
        let data = {
            maxResults: 5,
            startResults: 0,
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}`)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 5) throw new Error()});
    });

    test('Class 6: categoryID not valid', () => {
        let data = {
            maxResults: 5,
            startResults: 0,
            categoryID: -1,
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}&categoryID=${data.categoryID}`)
            .expect(400);
    });

    test('Class 7: filter by categoryID', () => {
        let data = {
            maxResults: 5,
            startResults: 0,
            categoryID: 2,
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}&categoryID=${data.categoryID}`)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 3) throw new Error()})
            .expect(res => {
                expect(res.body['listings'][0]).toMatchObject({
                    listingID: 6,
                    title: 'Cup', // I was getting a bit bored of writing test cases by this point
                    description: 'For drinking',
                    condition: 'poor',
                    categoryID: 2,
                    country: 'UK',
                    region: 'Durham',
                    postcode: 'AB1 2CD',
                    mimetype: 'image/jpeg',
                    url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647387110/sample.jpg',
                });
            });
    });
    
    test('Class 8: region not valid', () => {
        let data = {
            maxResults: 5,
            startResults: 0,
            region: '',
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}&region=${data.region}`)
            .expect(400);
    });

    test('Class 9: filter by region', () => {
        let data = {
            maxResults: 5,
            startResults: 0,
            region: 'Bristol',
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}&region=${data.region}`)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 3) throw new Error()});
    });
    
    test('Class 10: filter by category and region', () => {
        let data = {
            maxResults: 5,
            startResults: 0,
            categoryID: 2,
            region: 'Bristol',
        }
        return request(app.app)
            .get(`/listings/search?maxResults=${data.maxResults}&startResults=${data.startResults}&categoryID=${data.categoryID}&region=${data.region}`)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 2) throw new Error()});
    });
});
