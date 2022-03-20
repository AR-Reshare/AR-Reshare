/*
* @jest-environment node
*/

const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../secrets/dbconnection.json');
const cloudinary = require('cloudinary').v2;
const mediaConfig = require('../../secrets/mediaconnection.json');

const { AuthenticationHandler } = require('../../classes/securityvalidation');
const { readFileSync } = require('fs');

const request = require('supertest');

cloudinary.config(mediaConfig);

const db = new Database(credentials['test']);
const logger = console;
const mediaHandler = cloudinary.uploader;
const app = new App(db, logger, null, mediaHandler);
let validToken;

beforeAll(() => {
    return AuthenticationHandler.createNewToken(db, 'testy@testingtons.net', 'Password123').then(res => {
        validToken = res;
    });
});

afterAll(() => {
    db.end();
});

describe('System Test 6 - /listing/modify', () => {
    test('Class 1: No token', () => {
        let data = {
            listingID: 27,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .send(data)
            .expect(401);
    });
    
    test('Class 2: Invalid token', () => {
        let token = 'AAAAA';
        let data = {
            listingID: 27,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });
    
    test('Class 3: No listingID', () => {
        let token = validToken;
        let data = {
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 4: Invalid listingID', () => {
        let token = validToken;
        let data = {
            listingID: -1,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 5: ListingID does not match a real listing', () => {
        let token = validToken;
        let data = {
            listingID: 5000,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 6: ListingID matches a different user\'s listing', () => {
        let token = validToken;
        let data = {
            listingID: 28,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 7: ListingID matches a closed listing', () => {
        let token = validToken;
        let data = {
            listingID: 29,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(404);
    });
    
    test('Class 8: No change', () => {
        let token = validToken;
        let data = {
            listingID: 27,
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 9: Invalid title', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            title: '',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 10: Valid title', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            title: 'New thing',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
    
    test('Class 11: Invalid description', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            description: '',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 12: Valid description', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            description: 'A new, more detailed description',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
    
    test('Class 13: Invalid location', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            location: -1,
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 14: Valid location object', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            location: {
                country: 'Tatooine',
                region: 'Mos Pelgo',
                postcode: 'ME1 6BD',
            },
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
    
    test('Class 15: Valid location ID', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            location: 4,
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
    
    test('Class 16: Invalid condition', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            condition: 'bad',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 17: Valid condition', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            condition: 'good',
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
    
    test('Class 18: Invalid category', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            categoryID: -1,
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(400);
    });
    
    test('Class 19: Valid category', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            categoryID: 3,
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });

    test('Class 20: Change multiple', () => {
        let token = validToken;
        let data = {
            listingID: 30,
            title: 'New thing',
            description: 'A new detailed description',
            location: 4,
            condition: 'good',
            categoryID: 3,
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });

    test('Class 21: Invalid media', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            media: ['data:picture/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAGACAYAAACkx7W/AAAAB'],
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(422);
    });
    
    test('Class 22: Valid media', () => {
        let token = validToken;
        let data = {
            listingID: 27,
            media: [readFileSync('tests/data/b64_img.txt').toString(), readFileSync('tests/data/b64_lil_img.txt').toString()],
        };

        return request(app.app)
            .patch('/listing/modify')
            .set('Authorization', token)
            .send(data)
            .expect(200);
    });
});
