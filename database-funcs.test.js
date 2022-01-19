const credentials = require('./connection.json')['test'];
const Database = require('./database-funcs');
const db = new Database(credentials);

afterAll(() => {
    db.end();
});

describe('Test simple query', () => {
    test('Basic SELECT succeeds', () => {
        return db.simpleQuery('SELECT NOW() AS now').then(res => {
            expect(res).toHaveLength(1);
        });
    });

    // More tests:

    // SELECT returns expected data

    // INSERT affects data as expected

    // DROP is prevented

    // SQL injection is prevented

    // SELECT on non-existant table rejects
});
