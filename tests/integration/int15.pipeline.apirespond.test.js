const { QueryExecutionError } = require('../../classes/errors');
const Pipeline = require('../../classes/pipeline');
const ResponseTemplate = require('../../classes/responsetemplate');

// still need to mock the response object, unfortunately. A real Response will be used for the system tests
const mockStatus = jest.fn();
const mockSend = jest.fn();
const mockEnd = jest.fn();

let pipe, template;

beforeAll(() => {
    pipe = new Pipeline();
    template = new ResponseTemplate([{
        out_name: 'username',
        field: 'fullname',
    }, {
        out_name: 'users',
        rows_with_fields: 'userid',
    }], {
        null: 201, // default is 200
        'QueryExecutionError': 404, // default is 500
    });
});

beforeEach(() => {
    mockStatus.mockClear();
    mockSend.mockClear();
    mockEnd.mockClear();
})

describe('Integration Test 15 - Pipeline.APIRespond', () => {
    test('Class 1: Successful request', () => {
        let res = {
            status: mockStatus,
            send: mockSend,
            end: mockEnd,
        }
        let inputArray = [
            [{fullname: 'Testy McTestface'}],
            [{userid: 12, email: 'kevin@gmail.com'}, {userid: 17, email: 'ronnieo@yahoo.com'}],
        ];

        return pipe.APIRespond(template, res, inputArray, null).then(out => {
            let expectedOut = {
                'username': 'Testy McTestface',
                'users': [{userid: 12, email: 'kevin@gmail.com'}, {userid: 17, email: 'ronnieo@yahoo.com'}],
            }

            expect(mockStatus).toBeCalledWith(201);
            expect(mockSend).toBeCalledWith(expectedOut);
            expect(mockEnd).not.toBeCalled();
            expect(out).toHaveProperty('status', 201);
            expect(out).toHaveProperty('result', expectedOut);
        });
    });
    
    test('Class 2: Exceptional request', () => {
        let res = {
            status: mockStatus,
            send: mockSend,
            end: mockEnd,
        }
        let err = new QueryExecutionError('test');

        return pipe.APIRespond(template, res, null, err).then(out => {
            expect(mockStatus).toBeCalledWith(404);
            expect(mockSend).not.toBeCalled();
            expect(mockEnd).toBeCalled();
            expect(out).toHaveProperty('status', 404);
            expect(out).toHaveProperty('result', null);
        });
    });
});
