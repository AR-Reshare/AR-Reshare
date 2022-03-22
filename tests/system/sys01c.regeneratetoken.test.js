const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../secrets/dbconnection.json');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const fs = require('fs');
const {AuthenticationHandler} = require('../../classes/securityvalidation.js');
const db = new Database(credentials['test']);
const logger = console;
const app = new App(db, logger);

let key;

afterAll(() => {
    db.end();
});


beforeAll(() => {
    key = fs.readFileSync(AuthenticationHandler.PrivatekeyLocation);
});


describe('System Test 01c - Testing malformed Authorization Header', () => {
    test('Class 1: Token String Empty', async () => {
        let inputToken = '';
        
        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual({'error': 'authorization is not valid'});
    });

    test('Class 2: Token String is not valid base64', async () => {
        let inputToken = '!(xfdsa]x';

        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(400);   
        expect(response.body).toEqual({'error': 'authorization is not valid'});


    });

    test('Class 3: Token String is not in valid JWT format', async () => {
        // inputToken = base64.encode('hello') + '.' + base64.encode('there')
        let inputToken = 'aGVsbG8K.dGhlcmUK';

        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(400); 
        expect(response.body).toEqual({'error': 'authorization is not valid'});


    });

    test('Class 4: Token String isn\'t parsed into valid JSON object', async () => {
        // let inputToken = base64.encode('{'username','password','invalidformat'}')
        let inputToken = 'eyJ1c2VybmFtZSIsInBhc3N3b3JkIiwiaW52YWxpZGZvcm1hdCJ9';

        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(400); 
        expect(response.body).toEqual({'error': 'authorization is not valid'});

    });

    test('Class 5: Absent Token', async () => {
        // let inputToken =  null;

        const response = await request(app.app)
            .post('/token/regeneration')
            // .set('Authorization', inputToken) // no jwt token provided
            .set('Accept', 'application/json');

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(400); 
        expect(response.body).toEqual({'error': 'authorization is not valid'});

    });

    test('Class 6: Absent Token + HTTP body junk', async () => {
        // let inputToken =  null;

        const response = await request(app.app)
            .post('/token/regeneration')
            // .set('Authorization', inputToken) // no jwt token provided
            .send({post: 'junk information'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(400); 
        expect(response.body).toEqual({'error': 'authorization is not valid'});

    });

});


describe('System Test 01c - Testing valid tokens that should not be successfully verified', () => {
    test('Class 7: Expired Token', async () => {
        let payload = {userID: 'ssepi0l'};
        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256', expiresIn: 0});

        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(401); 
        expect(response.body).toEqual({'error': 'ExpiredTokenError'});


    });

    test('Class 8: Tampered Token', async () => {
        let payload = {userID: 'BasicUser12345'};
        let modifiedPayload = {userID: 'ssepi0l'};

        let signedToken = jwt.sign(payload, key, {algorithm: 'HS256'});
        let tokenSections = signedToken.split('.');
        tokenSections[1] = btoa(JSON.stringify(modifiedPayload));
        let inputToken = tokenSections.join('.');

        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(401); 
        expect(response.body).toEqual({'error': 'InvalidTokenError'});


    });

    test('Class 9: Unsuccessfully Verified Token + HTTP body junk', async () => {
        let payload = {userID: 'BasicUser12345'};
        let modifiedPayload = {userID: 'ssepi0l'};

        let signedToken = jwt.sign(payload, key, {algorithm: 'HS256'});
        let tokenSections = signedToken.split('.');
        tokenSections[1] = btoa(JSON.stringify(modifiedPayload));
        let inputToken = tokenSections.join('.');

        const response = await request(app.app)
            .post('/token/regeneration')
            .set({'Authorization': inputToken,
                'Accept': 'application/json'})
            .send({post: 'junk information'});

        expect(response.headers['Authorization']).toEqual(undefined);
        expect(response.status).toEqual(401); 
        expect(response.body).toEqual({'error': 'InvalidTokenError'});

    });

    test('Class 10: Verified Token', async () => {
        let decodedToken, returnedToken;
        let payload = {
            userID: 'ssepi0l',
        };

        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256', expiresIn:1000});

        const response = await request(app.app)
            .post('/token/regeneration')
            .send({})
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        returnedToken = response.headers['authorization'];
        expect(typeof returnedToken).toBe('string');
        decodedToken = jwt.verify(returnedToken, key);
        expect(decodedToken['userID'] = payload['userID']);
        expect(response.status).toEqual(200); 
        expect(response.body).toEqual({success: true});

    });

    test('Class 11: Verified Token + HTTP body junk', async () => {
        let decodedToken, returnedToken;
        let payload = {
            userID: 'ssepi0l',
        };

        let inputToken = jwt.sign(payload, key, {algorithm: 'HS256', expiresIn:1000});

        const response = await request(app.app)
            .post('/token/regeneration')
            .send({post: 'Here\'s some junk'})
            .set({'Authorization': inputToken,
                'Accept': 'application/json'});

        returnedToken = response.headers['authorization'];
        expect(typeof returnedToken).toBe('string');
        decodedToken = jwt.verify(returnedToken, key);
        expect(decodedToken['userID'] = payload['userID']);
        expect(response.status).toEqual(200); 
        expect(response.body).toEqual({success: true});
    });

});



