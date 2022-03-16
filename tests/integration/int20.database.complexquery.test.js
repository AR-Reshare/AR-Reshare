const Database = require('../../classes/database');
const { QueryExecutionError } = require('../../classes/errors');
const creds = require('../../secrets/dbconnection.json')['test'];

let db;

beforeAll(() => {
    db = new Database(creds);
});

afterAll(() => {
    db.end();
});

describe('Integration Test 20 - Database.complexQuery', () => {
    test('Class 1: valid single query', () => {
        let text0 = 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'';
        let q0 = {text: text0};

        let qs = [q0];

        return db.complexQuery(qs).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });

    test('Class 2: multiple reading queries', () => {
        let text0 = 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'';
        let text1 = 'SELECT userid FROM Account WHERE fullname = \'Ronnie Omelettes\'';
        let q0 = {text: text0};
        let q1 = {text: text1};

        let qs = [q0, q1];

        return db.complexQuery(qs).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toHaveProperty('userid', 3);
        });
    });

    test('Class 3: multiple writing queries', () => {
        let text0 = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int20c3_1@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\')';
        let text1 = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevina McTestface\', \'int20c3_2@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-13\')';;
        let q0 = {text: text0};
        let q1 = {text: text1};

        let qs = [q0, q1];

        return db.complexQuery(qs).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(0);
            expect(res[1]).toHaveLength(0);

            return db.complexQuery([
                {text: 'SELECT userid FROM Account WHERE email LIKE \'int20c3_\_@gmail.com\''}
            ]);
        }).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(2);
            expect(res[0][0]).toHaveProperty('userid');
            expect(res[0][1]).toHaveProperty('userid');
        });
    });

    test('Class 4: reading and writing queries', () => {
        let text0 = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int20c4@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\') RETURNING userid';
        let text1 = 'SELECT userid FROM Account WHERE email = \'int20c4@gmail.com\'';
        let q0 = {text: text0};
        let q1 = {text: text1};

        let qs = [q0, q1];

        return db.complexQuery(qs).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid');
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toHaveProperty('userid', res[0][0]['userid']);
        });
    });

    test('Class 5: parameterised queries', () => {
        let text0 = 'SELECT userid FROM Account WHERE fullname = $1';
        let text1 = 'SELECT userid FROM Account WHERE fullname = $1';
        let val0 = ['Testy McTestface'];
        let val1 = ['Ronnie Omelettes'];

        let q0 = {text: text0, values: val0};
        let q1 = {text: text1, values: val1};

        let qs = [q0, q1];

        return db.complexQuery(qs).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toHaveProperty('userid', 3);
        });
    });

    test('Class 6: backreferencing queries', () => {
        let text0 = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int20c6@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\') RETURNING userid';
        let text1 = 'SELECT fullname FROM Account WHERE userid = $1';
        let val1 = [res => res[0][0]['userid']];
        let q0 = {text: text0};
        let q1 = {text: text1, values: val1};

        let qs = [q0, q1];

        return db.complexQuery(qs).then(res => {
            expect(res).toHaveLength(2);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid');
            expect(res[1]).toHaveLength(1);
            expect(res[1][0]).toHaveProperty('fullname', 'Kevin McTestface');
        });
    });

    test('Class 7: exceptional early query', () => {
        let text0 = 'ABDFGYRAE INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int20c7_1@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\')';
        let text1 = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevina McTestface\', \'int20c7_2@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-13\')';;
        let q0 = {text: text0};
        let q1 = {text: text1};

        let qs = [q0, q1];

        expect.assertions(3);

        return db.complexQuery(qs).catch(err => {
            expect(err).toBeInstanceOf(QueryExecutionError);

            return db.complexQuery([
                {text: 'SELECT userid FROM Account WHERE email LIKE \'int20c7_\_@gmail.com\''}
            ]);
        }).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(0);
        });
    });

    test('Class 8: exceptional late query', () => {
        let text0 = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int20c8_1@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\')';
        let text1 = 'AKUGERAGKJRE INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevina McTestface\', \'int20c8_2@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-13\')';;
        let q0 = {text: text0};
        let q1 = {text: text1};

        let qs = [q0, q1];

        expect.assertions(3);

        return db.complexQuery(qs).catch(err => {
            expect(err).toBeInstanceOf(QueryExecutionError);

            return db.complexQuery([
                {text: 'SELECT userid FROM Account WHERE email LIKE \'int20c8_\_@gmail.com\''}
            ]);
        }).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(0);
        });
    });
});
