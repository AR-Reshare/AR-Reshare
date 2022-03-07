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

describe('System Test 9 - /listing/view', () => {
    test('Class 1: No listingID', () => {
        return request(app.app)
            .get('/listing/view')
            .expect(400);
    });

    test('Class 2: ListingID is not a valid ID', () => {
        let listingid = 'banana';
        return request(app.app)
            .get(`/listing/view?listingID=${listingid}`)
            .expect(400);
    });
    
    test('Class 3: ListingID does not match a listing', () => {
        let listingid = 5000;
        return request(app.app)
            .get(`/listing/view?listingID=${listingid}`)
            .expect(404);
    });
    
    test('Class 4: ListingID matches a closed listing', () => {
        let listingid = 1;
        return request(app.app)
            .get(`/listing/view?listingID=${listingid}`)
            .expect(404);
    });

    test('Class 5: ListingID matches an open listing', () => {
        let listingid = 2;
        return request(app.app)
            .get(`/listing/view?listingID=${listingid}`)
            .expect(200)
            .expect(res => {
                expect(res.body).toMatchObject({
                    listingID: 2,
                    contributorID: 2,
                    title: 'Stuff',
                    description: 'Some things',
                    condition: 'poor',
                    location: {
                        country: 'US',
                        region: 'Abcdef, GH',
                        postcode: 'asdfgh',
                    },
                    categoryID: 1,
                    media: [], // TODO media test
                });
                expect(res.body).toHaveProperty('creationDate');
                expect(res.body).toHaveProperty('modificationDate');
                expect(res.body).not.toHaveProperty('closedDate');
                expect(res.body).not.toHaveProperty('receiverID');
            });
    });
});
