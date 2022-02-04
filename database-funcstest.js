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
            expect(res[0]).toMatchObject({username: 'Testy McTestface'});
            expect(res[3]).toMatchObject({username: 'Gary Cheeseman'});
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

    test('Query with no return still resolves', () => {
        return db.simpleQuery('UPDATE Account SET useremail = \'gary.cheeseman@gmail.com\' WHERE userid = 4').then(res => {
            expect(res).toHaveLength(0);
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

    test('Not enough paramaters to paramaterised query fails', () => {
        expect.assertions(1);
        return db.simpleQuery('SELECT UserID FROM Account WHERE UserName = $1 AND PassHash = $2', ['Testy McTestface']).catch(err => {
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

    test('Multiple SELECTS return expected data', () => {
        let commands = [
            {
                text: 'SELECT UserID FROM Account WHERE UserName = \'Testy McTestface\'',
            },
            {
                text: 'SELECT DoB FROM StdUser WHERE UserID = 1',
            },
        ];

        return db.complexQuery(commands).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toMatchObject({userid: 1});
            expect(res[1]).toHaveLength(1);
        })
    });

    test('Paramaterised queries work as expected', () => {
        let commands = [
            {
                text: 'SELECT UserID FROM Account WHERE UserName = $1',
                values: ['Testy McTestface'],
            },
            {
                text: 'SELECT UserEmail FROM Account WHERE UserName = $1 AND PassHash = $2',
                values: ['Ronnie Omelettes', '$2a$12$DYJ0yc1OWkCVAT97hmq/nOr0v1NId/8pwyeXpK.QcLExIE8E1ouEu'],
            }
        ];

        return db.complexQuery(commands).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toMatchObject({userid: 1});
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toMatchObject({useremail: 'ronnieo@yahoo.com'});
        });
    });

    test('Rejection on initial query prevents others', () => {
        let commands = [
            {
                text: 'SELECT * FROM asdsdgfasgsdafs WHERE UserName = \'Testy McTestface\'',
            },
            {
                text: 'INSERT INTO Account (UserName, UserEmail, PassHash) VALUES (\'Badguy McTerrible\', \'bug@thisscript.com\', \'$2a$12$IQnslt.5a8kjZvmSn.fxOO5WvOS6rbpedEhmHR0.Iwdk31vBe1p1i\'',
            },
        ];

        let verify = [
            {
                text: 'SELECT * FROM Account WHERE UserName = \'Badguy McTerrible\'',
            },
        ];

        expect.assertions(3);
        return db.complexQuery(commands).catch(err => {
            expect(err).toBeDefined();
            return db.complexQuery(verify).then(res => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveLength(0);
            });
        });
    });

    test('Rejection on final query rolls back', () => {
        let commands = [
            {
                text: 'INSERT INTO Account (UserName, UserEmail, PassHash) VALUES (\'Badman McTerrible\', \'bug@thisscript.com\', \'$2a$12$IQnslt.5a8kjZvmSn.fxOO5WvOS6rbpedEhmHR0.Iwdk31vBe1p1i\'',
            },
            {
                text: 'SELECT * FROM asdsdgfasgsdafs WHERE UserName = \'Testy McTestface\'',
            }
        ];

        let verify = [
            {
                text: 'SELECT * FROM Account WHERE UserName = \'Badman McTerrible\'',
            },
        ];

        expect.assertions(3);
        return db.complexQuery(commands).catch(err => {
            expect(err).toBeDefined();
            return db.complexQuery(verify).then(res => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveLength(0);
            });
        });
    });

    // More tests:

    // Valid backreference works as expected

    // Invalid backreference rejects

    // Attempting SQL injection using a backreference fails
});
