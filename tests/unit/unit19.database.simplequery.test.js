const Database = require('../../database-funcs');
const {Pool} = require('pg');

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
jest.mock('pg', () => {
    return {
        Pool: jest.fn().mockImplementation(() => {
            return {
                query: mockQuery,
            };
        }),
    };
});

let db = new Database({});
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


beforeEach(() => {
    Pool.mockClear();
    mockQuery.mockClear();
});

describe('Unit Test 19 - Database.simpleQuery', () => {
    test('Class 1: non-paramaterised query', () => {
        let q = 'MOCK query ON Database';
        mockQueryInner.mockReturnValueOnce(testObject);
        return db.simpleQuery(q).then(res => {
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
        expect.assertions(1);
        return db.simpleQuery(q).catch(err => {
            expect(err).toHaveProperty('message', msg);
        });
    });
});
