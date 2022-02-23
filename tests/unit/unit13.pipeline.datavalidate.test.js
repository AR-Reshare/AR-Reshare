const { AbsentArgumentError, InvalidArgumentError, DirtyArgumentError } = require('../../classes/errors');
const Pipeline = require('../../classes/pipeline');
const RequestTemplate = require('../../classes/requesttemplate');

const mockProcess = jest.fn();

jest.mock('../../classes/requesttemplate', () => {
    return jest.fn().mockImplementation(() => {
        return {process: mockProcess};
    });
});

let pipe, template;

beforeAll(() => {
    pipe = new Pipeline();
    template = new RequestTemplate();
});

beforeEach(() => {
    RequestTemplate.mockClear();
    mockProcess.mockClear();
});

describe('Unit Test 13 - Pipeline.DataValidate', () => {
    test('Class 1: Valid input', () => {
        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };
        let outputObject = inputObject;

        mockProcess.mockReturnValueOnce(outputObject);

        return pipe.DataValidate(template, inputObject).then(res => {
            expect(mockProcess).toBeCalledWith(inputObject);
            expect(res).toMatchObject(outputObject);
        });
    });

    test('Class 2: Valid, mutated input', () => {
        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };
        let outputObject = {
            fullname: 'McTestface, Testy',
            passhash: 'lgjrawg5kyt56lo8b368li6qi45',
        };

        mockProcess.mockReturnValueOnce(outputObject);

        return pipe.DataValidate(template, inputObject).then(res => {
            expect(mockProcess).toBeCalledWith(inputObject);
            expect(res).toMatchObject(outputObject);
        });
    });

    test('Class 3: AbsentArgumentError', () => {
        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        mockProcess.mockImplementation(() => {throw new AbsentArgumentError('something done broked');});
        expect.assertions(2);

        return pipe.DataValidate(template, inputObject).catch(err => {
            expect(mockProcess).toBeCalledWith(inputObject);
            expect(err).toBeInstanceOf(AbsentArgumentError);
        });
    });

    test('Class 4: InvalidArgumentError', () => {
        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        mockProcess.mockImplementation(() => {throw new InvalidArgumentError('something done broked');});
        expect.assertions(2);

        return pipe.DataValidate(template, inputObject).catch(err => {
            expect(mockProcess).toBeCalledWith(inputObject);
            expect(err).toBeInstanceOf(InvalidArgumentError);
        });
    });

    test('Class 5: DirtyArgumentError', () => {
        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        mockProcess.mockImplementation(() => {throw new DirtyArgumentError('something done broked');});
        expect.assertions(2);

        return pipe.DataValidate(template, inputObject).catch(err => {
            expect(mockProcess).toBeCalledWith(inputObject);
            expect(err).toBeInstanceOf(DirtyArgumentError);
        });
    });
});
