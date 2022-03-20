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

afterAll(() => {
    db.end();
});

describe('System Test 2 - /account/modify', () => {
    test('Class 1: No token', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            name: 'Lugrub', // Supplied by https://www.fantasynamegenerators.com/orc_names.php
        };

        return request(app.app)
            .patch('/account/modify')
            .send(data)
            .expect(401);
    });

    test('Class 2: Invalid token', () => {
        let token = 'ABCDEF';
        let data = {
            password: 'MyUltraSecurePassword',
            name: 'Welub',
        };

        return request(app.app)
            .patch('/account/modify')
            .set('Authorization', token)
            .send(data)
            .expect(401);
    });

    test('Class 3: No password', () => {
        let data = {
            name: 'Yagnatz',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme1@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(401);
        });
    });
    
    test('Class 4: Wrong password', () => {
        let data = {
            password: 'wrong',
            name: 'Yonkathu',
        };
        
        return AuthenticationHandler.createNewToken(db, 'changeme2@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(401);
        });
    });
    
    test('Class 5: Invalid name', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            name: 5,
        };

        return AuthenticationHandler.createNewToken(db, 'changeme3@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(400);
        });
    });

    test('Class 6: Valid name', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            name: 'Ghamorz',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme4@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });

    test('Class 7: Invalid email', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            email: 'porgarag not have email',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme5@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(400);
        });
    });

    test('Class 8: Valid email', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            email: 'ulmragha@mordor.ac.uk',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme6@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });

    test('Class 9: Invalid new password', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            newPassword: 7,
        };

        return AuthenticationHandler.createNewToken(db, 'changeme7@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(400);
        });
    });

    test('Class 10: Insecure new password', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            newPassword: 'SauronRulez',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme8@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(422);
        });
    });

    test('Class 11: Valid new password', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            newPassword: 'Saur0nRulez!',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme9@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });

    test('Class 12: Invalid DoB', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            dob: 12,
        };

        return AuthenticationHandler.createNewToken(db, 'changeme10@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(400);
        });
    });

    test('Class 13: Too recent DoB', () => {
        let now = new Date();
        let data = {
            password: 'MyUltraSecurePassword',
            dob: `${now.getFullYear()-1}-${now.getMonth()}-${now.getDate()}`,
        };

        return AuthenticationHandler.createNewToken(db, 'changeme11@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(422);
        });
    });

    test('Class 14: Valid DoB', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            dob: '2000-01-06',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme12@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });

    test('Class 15: Valid changes to all', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            name: 'Ghoragdush',
            email: 'ghorag@mordor.ac.uk',
            newPassword: 'S3cur1ity!0rc',
            dob: '2001-12-10',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme13@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });

    test('Class 16: Invalid picture', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            picture: 'data:picture/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAGACAYAAACkx7W/AAAAB',
        };

        return AuthenticationHandler.createNewToken(db, 'changeme14@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(422);
        });
    });

    test('Class 17: Valid picture', () => {
        let data = {
            password: 'MyUltraSecurePassword',
            picture: readFileSync('tests/data/b64_img.txt').toString(),
        };

        return AuthenticationHandler.createNewToken(db, 'changeme15@yahoo.net', 'MyUltraSecurePassword').then(token => {
            return request(app.app)
                .patch('/account/modify')
                .set('Authorization', token)
                .send(data)
                .expect(200);
        });
    });
});
