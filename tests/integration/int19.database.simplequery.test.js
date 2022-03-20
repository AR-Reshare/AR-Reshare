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

describe('Integration Test 19 - Database.simpleQuery', () => {
    test('Class 1: valid (non-parameterised) reading query', () => {
        let text = 'SELECT userid FROM Account WHERE fullname = \'Testy McTestface\'';
        
        return db.simpleQuery(text).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });

    test('Class 2: valid (non-parameterised) writing query', () => {
        let text = 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES (\'Kevin McTestface\', \'int19c2@gmail.com\', \'$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6\', \'1986-03-12\')';
        
        return db.simpleQuery(text).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(0);

            return db.simpleQuery('SELECT userid FROM Account WHERE email = \'int19c2@gmail.com\'');
        }).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid');
        });
    });

    test('Class 3: valid parameterised query', () => {
        let text = 'SELECT userid FROM Account WHERE fullname = $1';
        let values = ['Testy McTestface'];
        
        return db.simpleQuery(text, values).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });
    
    test('Class 4: parameterised query with parameters which can be typecast appropriately', () => {
        let text = 'SELECT userid FROM Account WHERE dob = $1';
        let values = [new Date(1990, 0, 1)];
        
        return db.simpleQuery(text, values).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(1);
            expect(res[0][0]).toHaveProperty('userid', 1);
        });
    });

    test('Class 5: query with syntax errors', () => {
        let text = 'SELCT userid FROM Account WHERE fullname = \'Testy McTestface\'';
        
        return expect(db.simpleQuery(text)).rejects.toBeInstanceOf(QueryExecutionError);
    });

    test('Class 6: query with schema errors', () => {
        let text = 'SELECT notarow FROM Account WHERE fullname = \'Testy McTestface\'';
        
        return expect(db.simpleQuery(text)).rejects.toBeInstanceOf(QueryExecutionError);
    });
    
    test('Class 7: Parameterised query with fewer values provided than are used', () => {
        let text = 'SELECT userid FROM Account WHERE fullname = $1 AND email = $2';
        let values = ['Testy McTestface'];
        
        return expect(db.simpleQuery(text, values)).rejects.toBeInstanceOf(QueryExecutionError);
    });

    test('Class 8: parameterised query with more values provided than are required', () => {
        let text = 'SELECT userid FROM Account WHERE fullname = $1';
        let values = ['Testy McTestface', 'Ronnie Omelettes'];
        
        return expect(db.simpleQuery(text, values)).rejects.toBeInstanceOf(QueryExecutionError);
    });
    
    test('Class 9: Parameterised query with values argument undefined', () => {
        let text = 'SELECT userid FROM Account WHERE fullname = $1';
        
        return expect(db.simpleQuery(text)).rejects.toBeInstanceOf(QueryExecutionError);
    });

    test('Class 10: Parameterised query with parameters which cannot be typecast appropriately', () => {
        let text = 'SELECT userid FROM Account WHERE dob = $1';
        let values = ['Testy McTestface'];
        
        return expect(db.simpleQuery(text, values)).rejects.toBeInstanceOf(QueryExecutionError);
    });

    test('Class 11: Parameterised query with attempted SQL injection', () => {
        let text = 'SELECT userid FROM Account WHERE fullname = $1';
        let values = ["\' OR 1=1; --"];
        
        return db.simpleQuery(text, values).then(res => {
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveLength(0);
        });
    });
});
