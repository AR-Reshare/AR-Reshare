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

    // Parameterised query works as expected

    // DROP is prevented

    // SQL injection is prevented

    // SELECT on non-existant table rejects
});

describe('Test complex query', () => {
    test('Basic SELECT succeeds', () => {
        let commands = [
            {
                text: 'SELECT NOW() AS now',
            },
        ];

        return db.complexQuery(commands).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
        });
    });

    // More tests:

    // Multiple SELECTS return expected data

    // Valid backreference works as expected

    // Paramaterised queries work as expected

    // Invalid backreference rejects

    // Attempting SQL injection using a backreference fails

    // Rejection on initial query works, and additional queries are not sent

    // Rejection mid-way through works, and additional queries are not sent

    // Rejection on final query works, and rollback is sent
});
