const credentials = require('./connection.json')['test'];
const Database = require('./database-funcs');
const db = new Database(credentials);

afterAll(() => {
    db.end();
});

describe('Test simple query', () => {
    test('Test basic functionality', () => {
        return db.simpleQuery('SELECT NOW() AS now').then(res => {
            expect(res).toHaveLength(1);
        });
    });
});
