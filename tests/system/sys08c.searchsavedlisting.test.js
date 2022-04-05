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

describe('System Test 8 - /account/saved-listings/search', () => {
    test('Class 1: No token', () => {
        let data = {
            startResults: 0,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .expect(401);
    });

    test('Class 2: Invalid token', () => {
        let token = 'AAAAA';
        let data = {
            startResults: 0,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(401);
    });

    test('Class 3: No maximum', () => {
        let token = validToken;
        let data = {
            startResults: 0,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 4: Invalid maximum', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: -1,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 5: No start', () => {
        let token = validToken;
        let data = {
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 6: Invalid start', () => {
        let token = validToken;
        let data = {
            startResults: -1,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 7: Valid search', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {if(res.body['listings'].length !== 5) throw new Error()});
    });
    
    test('Class 8: Invalid CategoryID', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            categoryID: -1,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&categoryID=${data.categoryID}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 9: Valid search with categoryID', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            categoryID: 4,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&categoryID=${data.categoryID}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body['listings']).toHaveLength(4);
                expect(res.body['listings'][0]).toMatchObject({
                    listingID: 33,
                    title: 'Bookmark3', // I was getting a bit bored of writing test cases by this point
                    description: 'Some stuff',
                    condition: 'good',
                    categoryID: 4,
                    country: 'US',
                    region: 'Abcdef, GH',
                    postcode: 'asdfgh',
                    mimetype: 'image/jpeg',
                    url: 'https://res.cloudinary.com/dtdvwembb/image/upload/v1647387110/sample.jpg',
                });
            });
    });
    
    test('Class 10: Invalid Region', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            region: '',
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&region=${data.region}`)
            .set('Authorization', token)
            .expect(400);
    });
    
    test('Class 11: Valid search with region', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            region: 'Nowhere, NV',
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&region=${data.region}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body['listings']).toHaveLength(3);
            });
    });
    
    test('Class 12: Valid search with both filters', () => {
        let token = validToken;
        let data = {
            startResults: 0,
            maxResults: 5,
            categoryID: 4,
            region: 'Nowhere, NV',
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}&region=${data.region}&categoryID=${data.categoryID}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                expect(res.body['listings']).toHaveLength(2);
            });
    });

    test('Class 13: Valid search with omitted results', () => {
        let token = validToken;
        let data = {
            startResults: 5,
            maxResults: 5,
        };
        return request(app.app)
            .get(`/account/saved-listings/search?startResults=${data.startResults}&maxResults=${data.maxResults}`)
            .set('Authorization', token)
            .expect(200)
            .expect(res => {
                if (res.body['listings'].length == 5) throw new Error();
                // Can't get an exact number because I don't know when this, 09c, and 09d will run relative to each other
            });
    });
});
