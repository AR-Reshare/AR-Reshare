const { AbsentArgumentError, InvalidArgumentError, UnprocessableArgumentError, DirtyArgumentError } = require('../../classes/errors');
const Pipeline = require('../../classes/pipeline');
const RequestTemplate = require('../../classes/requesttemplate');

let pipe;

beforeAll(() => {
    pipe = new Pipeline();
});

describe('Integration Test 13 - Pipeline.DataValidate', () => {
    test('Class 1: valid object, no changes made', () => {
        let params = [{
            in_name: 'fullname',
            conditions: [
                fn => (typeof fn === 'string' || fn instanceof String),
                fn => fn.length > 0,
            ],
        }, {
            in_name: 'password',
        }];
        let inputObject = {
            fullname: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate(params);
        return pipe.DataValidate(template, inputObject).then(res => {
            expect(res).toHaveProperty('fullname', 'Testy McTestface');
            expect(res).toHaveProperty('password', 'Password123');
        });
    });

    test('Class 2: valid object, renamed and sanitised', () => {
        let params = [{
            in_name: 'username',
            out_name: 'fullname',
            conditions: [
                fn => (typeof fn === 'string' || fn instanceof String),
                fn => fn.length > 0,
            ],
        }, {
            in_name: 'password',
            out_name: 'passhash',
            sanitise: pw => pw.length*pw.indexOf('w'),
        }];
        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate(params);
        return pipe.DataValidate(template, inputObject).then(res => {
            expect(res).toHaveProperty('fullname', 'Testy McTestface');
            expect(res).toHaveProperty('passhash', 44);
        });
    });

    test('Class 3: invalid object, missing entries', () => {
        let params = [{
            in_name: 'fullname',
            required: true,
            conditions: [
                fn => (typeof fn === 'string' || fn instanceof String),
                fn => fn.length > 0,
            ],
        }, {
            in_name: 'password',
            required: true,
        }];
        let inputObject = {
            fullname: 'Testy McTestface',
        };

        let template = new RequestTemplate(params);
        return expect(pipe.DataValidate(template, inputObject)).rejects.toBeInstanceOf(AbsentArgumentError);
    });

    test('Class 4: invalid object, unmet conditions', () => {
        let params = [{
            in_name: 'fullname',
            conditions: [
                fn => (typeof fn === 'string' || fn instanceof String),
                fn => fn.length > 0,
            ],
        }, {
            in_name: 'password',
        }];
        let inputObject = {
            fullname: '',
            password: 'Password123',
        };

        let template = new RequestTemplate(params);
        return expect(pipe.DataValidate(template, inputObject)).rejects.toBeInstanceOf(InvalidArgumentError);
    });

    test('Class 5: unprocessable object', () => {
        let params = [{
            in_name: 'fullname',
            conditions: [
                fn => (typeof fn === 'string' || fn instanceof String),
                fn => fn.length > 0,
            ],
        }, {
            in_name: 'password',
            conditions: [
                pw => {
                    if (pw.length <= 8) {
                        throw new Error('Password doesn\' meet criteria');
                    }
                },
            ]
        }];
        let inputObject = {
            fullname: 'Testy McTestface',
            password: 'pword',
        };

        let template = new RequestTemplate(params);
        return expect(pipe.DataValidate(template, inputObject)).rejects.toBeInstanceOf(UnprocessableArgumentError);
    });

    test('Class 6: unsanitisable object', () => {
        let params = [{
            in_name: 'fullname',
            conditions: [
                fn => (typeof fn === 'string' || fn instanceof String),
                fn => fn.length > 0,
            ],
        }, {
            in_name: 'password',
            sanitise: pw => {
                if (pw === 'Password123') {
                    throw new Error('unable to sanitise');
                }
            }
        }];
        let inputObject = {
            fullname: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate(params);
        return expect(pipe.DataValidate(template, inputObject)).rejects.toBeInstanceOf(DirtyArgumentError);
    });
});
