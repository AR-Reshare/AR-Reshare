/*
* @jest-environment node
*/

const App = require('../../app');
const Database = require('../../classes/database');
const credentials = require('../../secrets/dbconnection.json');
const cloudinary = require('cloudinary').v2;
const mediaConfig = require('../../secrets/mediaconnection.json');

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

describe('System Test 1a - /account/create', () => {
    test('Class 1: An invalid email address', () => {
        let data = {
            email: 'person at googol dot com',
            name: 'Shaundyl Elydark', // Names provided by https://www.fantasynamegenerators.com/elf_names.php
            password: 'P@ssw0rd',
            dob: '1990-01-01',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(400);
    });
    
    test('Class 2: An email address that is already registered', () => {
        let data = {
            email: 'testy@testingtons.net',
            name: 'Ailred Sarbella',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(409);
    });

    // Class 3 is a superclass
    
    test('Class 4: An invalid name', () => {
        let data = {
            email: 'class4@testingtons.net',
            name: '',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(400);
    });
    
    // Class 5 is a superclass

    test('Class 6: An invalid date', () => {
        let data = {
            email: 'class6@testingtons.net',
            name: 'Alre Rorieth',
            password: 'P@ssw0rd',
            dob: 'Tuesday',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(400);
    });
    
    test('Class 7: A date that does not meet the age limit', () => {
        let now = new Date();
        let data = {
            email: 'class7@testingtons.net',
            name: 'Uevareth Sarjyre',
            password: 'P@ssw0rd',
            dob: `${now.getFullYear()-1}-${now.getMonth()}-${now.getDate()}`,
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(422);
    });

    // Class 8 is a superclass

    // Class 9, 10 moved below

    test('Class 11: Password not a valid string', () => {
        let data = {
            email: 'class11@testingtons.net',
            name: 'Rathal Tragwyn',
            password: 5,
            dob: '1990-01-01',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(400);
    });
    
    test('Class 12: Password not strong enough', () => {
        let data = {
            email: 'class12@testingtons.net',
            name: 'Elas Helewarin',
            password: 'Password123', // no special character
            dob: '1990-01-01',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(422);
    });
    
    test('Class 13: Valid request', () => {
        let data = {
            email: 'class13@testingtons.net',
            name: 'Alluin Bixina',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(201);
    });

    test('Class 9: An invalid address', () => {
        let data = {
            email: 'class9@testingtons.net',
            name: 'Ruvaen Ilizorwyn',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
            address: {
                country: 'UK',
                // no region or postcode
            }
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(400);
    });
    
    test('Class 10: Valid address', () => {
        let data = {
            email: 'class10@testingtons.net',
            name: 'Aias Keafaren',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
            address: {
                country: 'Faerun',
                region: 'Sword Coast',
                postcode: 'WD1 5BC',
            }
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(201);
    });

    test('Class 14: Invalid picture', () => {
        let data = {
            email: 'class14@testingtons.net',
            name: 'Reluvethel Sylgolor',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
            picture: 'data:picture/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYAAAAGACAYAAACkx7W/AAAAB'
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(422);
    });

    test('Class 15: Valid picture', () => {
        let data = {
            email: 'class15@testingtons.net',
            name: 'Maradeim Elhice',
            password: 'P@ssw0rd',
            dob: '1990-01-01',
            picture: readFileSync('tests/data/b64_img.txt').toString(),
        };

        return request(app.app)
            .put('/account/create')
            .send(data)
            .expect(201);
    });
});
