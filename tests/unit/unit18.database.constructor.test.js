const Database = require('../../classes/database');
const {Pool} = require('pg');

const {DatabaseConnectionError} = require('../../classes/errors');

const mockConstructor = jest.fn().mockImplementation(() => {
    return {query: mockQuery};
});
const mockQuery = jest.fn();

jest.mock('pg', () => {
    return {
        // this is required since jest refuses to hoist things properly
        Pool: jest.fn().mockImplementation((...args) => mockConstructor(...args)),
    };
});

beforeEach(() => {
    Pool.mockClear();
    mockConstructor.mockClear();
    mockQuery.mockClear();
});

describe('Unit Test 18 - Database.constructor', () => {
    test('Class 1: valid credentials', () => {
        // init test values
        let creds = {
            user: 'ValidUser',
            host: 'localhost',
            database: 'validdb',
            password: 'Password123',
        };

        // seed mocks
        mockQuery.mockImplementation(() => {
            return new Promise((resolve, reject) => {
                resolve();
            });
        });

        // execute
        let db = new Database(creds);
        expect(mockConstructor).toBeCalledWith(creds);
        return expect(db.testConnection()).resolves.toBe(undefined);
    });

    test('Class 2: false credentials', () => {
        let creds = {
            user: 'InvalidUser',
            host: 'localhost',
            database: 'invaliddb',
            password: 'heeheehoohoo',
        };
        mockQuery.mockImplementation(() => {
            return new Promise((resolve, reject) => {
                reject();
            });
        });

        let db = new Database(creds);
        expect(mockConstructor).toBeCalledWith(creds);
        return expect(db.testConnection()).rejects.toBeInstanceOf(DatabaseConnectionError);
    });
});
