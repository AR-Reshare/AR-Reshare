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

    test('SELECT returns expected data', () => {
        return db.simpleQuery('SELECT UserName FROM Account').then(res => {
            expect(res).toHaveLength(4);
            expect(res[0]).toMatchObject({username: 'Testy McTestface'});
        });
    });

    test('INSERT affects data as expected', () => {
        return db.simpleQuery('INSERT INTO Account (UserName, UserEmail, PassHash) VALUES (\'John Smith\', \'john@outlook.com\', \'$2a$12$hgGavvldCSkrCmPOSOGBM.U.mdPRpfO0WYEFNPdivmXyhBX3zAgDS\') RETURNING UserID').then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toMatchObject({userid: 5});
        });
    });

    test('Parameterised query works as expected', () => {
        return db.simpleQuery('SELECT UserID FROM Account WHERE UserName = $1', ['Kevin McTestface']).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toMatchObject({userid: 2});
        });
    });

    test('SQL injection is prevented', () => {
        return db.simpleQuery('SELECT UserID FROM Account WHERE UserName = $1', ['Admin\' OR 1=1; --']).then(res => {
            expect(res).toHaveLength(0);
        });
    });

    test('Query rejects on error', () => {
        expect.assertions(1);
        return db.simpleQuery('SELECT UserID FROM NonExistantTable').catch(err => {
            expect(err).toBeDefined();
        });
    });
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
