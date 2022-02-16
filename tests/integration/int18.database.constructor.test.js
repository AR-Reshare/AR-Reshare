const Database = require('../../classes/database');
const { DatabaseConnectionError } = require('../../classes/errors');
const creds = require('../../connection.json');

describe('Integration Test 18 - Database constructor', () => {
    test('Class 1: valid credentials', () => {
        let db = new Database(creds['dev']);
        return db.testConnection().then(res => {
            expect(res).toBe(undefined);
            db.end();
        });
    });

    test('Class 2: invalid credentials', () => {
        let invalid_creds = creds['dev'];
        invalid_creds['user'] = 'User McDoesntexist';

        let db = new Database(invalid_creds);
        return expect(db.testConnection()).rejects.toBeInstanceOf(DatabaseConnectionError);
    });
});
