const { AbsentArguementError, InvalidArguementError, DirtyArgumentError } = require('../../classes/errors');
const RequestTemplate = require('../../classes/requesttemplate');

describe('Unit Test 25 - RequestTemplate process', () => {
    test('Class 1: valid object, only in_name', () => {
        let param1 = {
            in_name: 'username',
        };
        let param2 = {
            in_name: 'password',
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            username: 'Testy McTestface',
            password: 'Password123',
        });
    });

    test('Class 2: valid object, out_names', () => {
        let param1 = {
            in_name: 'username',
            out_name: 'fullname',
        };
        let param2 = {
            in_name: 'password',
            out_name: 'passhash',
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            fullname: 'Testy McTestface',
            passhash: 'Password123',
        });
    });

    test('Class 3: valid object, optional (present)', () => {
        let param1 = {
            in_name: 'username',
            required: false,
        };
        let param2 = {
            in_name: 'password',
            required: false,
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            username: 'Testy McTestface',
            password: 'Password123',
        });
    });

    test('Class 4: valid object, optional (not present)', () => {
        let param1 = {
            in_name: 'username',
            required: false,
        };
        let param2 = {
            in_name: 'password',
            required: false,
        };

        let inputObject = {
            username: 'Testy McTestface',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            username: 'Testy McTestface',
        });
    });

    test('Class 5: valid object, required (present)', () => {
        let param1 = {
            in_name: 'username',
            required: true,
        };
        let param2 = {
            in_name: 'password',
            required: true,
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            username: 'Testy McTestface',
            password: 'Password123',
        });
    });

    test('Class 6: invalid object, required (not present)', () => {
        let param1 = {
            in_name: 'username',
            required: true,
        };
        let param2 = {
            in_name: 'password',
            required: true,
        };

        let inputObject = {
            username: 'Testy McTestface',
        };

        let template = new RequestTemplate([param1, param2]);
        expect(() => template.process(inputObject)).toThrow(AbsentArguementError);
    });

    test('Class 7: valid object, conditions', () => {
        let param1 = {
            in_name: 'username',
            conditions: [(username) => username === 'Testy McTestface'],
        };
        let param2 = {
            in_name: 'password',
            conditions: [
                (password, object) => (object['username'] === 'Testy McTestface' && password === 'Password123'),
            ],
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            username: 'Testy McTestface',
            password: 'Password123',
        });
    });

    test('Class 8: invalid object, conditions', () => {
        let param1 = {
            in_name: 'username',
            conditions: [(username) => username === 'Kevin McTestface'],
        };
        let param2 = {
            in_name: 'password',
            conditions: [
                (password, object) => (object['username'] === 'Kevin McTestface' && password === 'QW3RTy!'),
            ],
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        expect(() => template.process(inputObject)).toThrow(InvalidArguementError);
    });

    test('Class 9: valid object, sanitise', () => {
        let param1 = {
            in_name: 'username',
            sanitise: (username) => username.toUpperCase(),
        };
        let param2 = {
            in_name: 'password',
            sanitise: (password) => password.toLowerCase(),
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);
        let result = template.process(inputObject);

        expect(result).toMatchObject({
            username: 'TESTY MCTESTFACE',
            password: 'password123',
        });
    });

    test('Class 10: valid object, exceptional sanitise', () => {
        let param1 = {
            in_name: 'username',
            sanitise: (username) => {throw new Error('oops')},
        };
        let param2 = {
            in_name: 'password',
            sanitise: (password) => password.toLowerCase(),
        };

        let inputObject = {
            username: 'Testy McTestface',
            password: 'Password123',
        };

        let template = new RequestTemplate([param1, param2]);

        expect(() => template.process(inputObject)).toThrow(DirtyArgumentError);
    });
});
