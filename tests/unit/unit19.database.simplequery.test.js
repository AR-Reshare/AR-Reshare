const Database = require('../../classes/database');
const {Pool} = require('pg');

// mock of pg.Pool.query
const mockQueryInner = jest.fn();
const mockQuery = jest.fn().mockImplementation(() => {
    return new Promise((resolve, reject) => {
        let val = mockQueryInner();
        if (val instanceof Error) {
            reject(val);
        } else {
            resolve(val);
        }
    });
});

// mock of pg
jest.mock('pg', () => {
    return {
        Pool: jest.fn().mockImplementation(() => {
            return {
                query: mockQuery,
                end: jest.fn(),
            };
        }),
    };
});

let db;

const testObject = {
    rows: [
        {'fullname': 'Ronnie Omelettes', 'email': 'ronnieo@yahoo.com'},
        {'fullname': 'Gary Cheeseman', 'email': 'gary.cheeseman@aol.com'},
    ],
    fields: [
        {'name': 'fullname', 'dataTypeID': 'who cares nobody uses this'},
        {'name': 'email', 'dataTypeID': 'a type'},
    ],
    command: 'SELECT',
    rowCount: 2,
};

beforeAll(() => {
    db = new Database({});
});

afterAll(() => {
    db.end();
});

beforeEach(() => {
    Pool.mockClear();
    mockQuery.mockClear();
});

describe('Unit Test 19 - Database.simpleQuery', () => {
    test('Class 1: non-paramaterised query', () => {
        // init test values
        let q = 'MOCK query ON Database';

        // seed mocks
        mockQueryInner.mockReturnValueOnce(testObject);

        // execute
        return db.simpleQuery(q).then(res => {
            
            // assert
            expect(mockQuery).toBeCalledWith(q, []);
            expect(res).toBe(testObject.rows);
        });
    });

    test('Class 2: paramaterised query', () => {
        let q = 'MOCK query ON Database FOR Class=$1';
        let v = [2];
        mockQueryInner.mockReturnValueOnce(testObject);
        return db.simpleQuery(q, v).then(res => {
            expect(mockQuery).toBeCalledWith(q, v);
            expect(res).toBe(testObject.rows);
        });
    });

    test('Class 3: query with no rows', () => {
        let q = 'MOCK query ON Database';
        mockQueryInner.mockReturnValueOnce({rows: [], fields: [], command: 'INSERT', rowCount: 0});
        return db.simpleQuery(q).then(res => {
            expect(res).toStrictEqual([]);
        });
    });

    test('Class 4: exceptional query', () => {
        let q = 'MOCK query ON Database';
        let msg = 'The database did a broked';
        mockQueryInner.mockReturnValueOnce(new Error(msg));
        expect.assertions(2); // required in case the promise resolves
        return db.simpleQuery(q).catch(err => {
            expect(err).toHaveProperty('name', 'QueryExecutionError');
            expect(err).toHaveProperty('message', msg);
        });
    });
});
