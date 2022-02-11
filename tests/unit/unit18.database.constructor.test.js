const Database = require('../../classes/database');
const {Pool} = require('pg');

const {DatabaseConnectionError} = require('../../classes/errors');

const mockConstructor = jest.fn();
const mockEnd = jest.fn();

jest.mock('pg', () => {
    return {
        // this is required since jest refuses to hoist things properly
        Pool: jest.fn().mockImplementation((...args) => mockConstructor(...args)),
    };
});

beforeEach(() => {
    Pool.mockClear();
    mockConstructor.mockClear();
    mockEnd.mockClear();
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
        mockConstructor.mockImplementation(() => {
            return {end: mockEnd};
        });

        // execute
        let db = new Database(creds);
        expect(mockConstructor).toBeCalledWith(creds);
        expect(db).toHaveProperty('end');
    });

    test('Class 2: false credentials', () => {
        let creds = {
            user: 'InvalidUser',
            host: 'localhost',
            database: 'invaliddb',
            password: 'heeheehoohoo',
        };
        mockConstructor.mockImplementation(() => {
            throw new DatabaseConnectionError('test');
        });
        expect.assertions(2);
        try {
            let db = new Database(creds);
        } catch (err) {
            expect(mockConstructor).toBeCalledWith(creds);
            expect(err).toBeInstanceOf(DatabaseConnectionError);
        }
    });
});
