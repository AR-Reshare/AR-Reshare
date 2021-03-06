const { TemplateError } = require('./errors');

const DefaultErrorMap = {
    'null': 200,
    'PipelineInitialisationError': 500,
    'MissingTemplateError': 500,
    'PipelineExecutionError': 500,
    'PrivateKeyReadError': 500,
    'AlreadyAuthenticatedError': 401,
    'UnauthenticatedUserError': 401,
    'UnauthorizedUserError': 403,
    'InvalidCredentialsError': 401,
    'InvalidTokenError': 401,
    'TamperedTokenError': 401,
    'ExpiredTokenError': 401,
    'NotBeforeTokenError': 401,
    'ServerException': 500,
    'TemplateError': 500,
    'ValidationError': 400,
    'AbsentArgumentError': 400,
    'UnprocessableArgumentError': 422,
    'InvalidArgumentError': 400,
    'DirtyArgumentError': 400,
    'QueryError': 500,
    'DatabaseConnectionError': 500,
    'DBClientNotAvailableError': 500,
    'QueryTemplateError': 500,
    'EmptyQueryError': 500,
    'EmptyResponseError': 404,
    'QueryConstructionError': 500,
    'BackreferenceError': 500,
    'QueryExecutionError': 500,
    'ForeignKeyError': 404,
    'UniqueConstraintError': 409,
};

const isString = (aString) => {
    return (typeof aString === 'string' || aString instanceof String);
};

class ResponseTemplate {

    /**
     * Create a new ResponseTemplate object from a list of parameters (to include in the output) and a mapping of error objects to status codes
     * @param {Object[]} params List of objects representing parameters to include in the output. Each one must have a property out_name which gives the name of the parameter in the output, as well as exactly one of field, rows_with_fields, or one_row_with_fields
     * @param {Object} errorMap Dictionary mapping the names of errors, defined in classes/errors.js or elsewhere, to the appropriate HTTP status code to return. "null" should be mapped to a success code
     */
    constructor(params, errorMap={}) {
        this.params = params.map(parameter => {
            let out = {};
            
            // out_name
            if (!('out_name' in parameter)) {
                throw new TemplateError('out_name not provided');
            } else if (!isString(parameter['out_name'])) {
                throw new TemplateError('out_name not a string');
            } else if (parameter['out_name'].length === 0) {
                throw new TemplateError('out_name empty');
            } else {
                out.outName = parameter['out_name'];
            }

            // ensure exactly one of the others is given
            let numberOfKeys = 0;
            numberOfKeys += ('field' in parameter);
            numberOfKeys += ('rows_with_fields' in parameter);
            numberOfKeys += ('one_row_with_fields' in parameter);
            if (numberOfKeys !== 1) {
                throw new TemplateError('Exactly one of field, rows_with_fields, or one_row_with_fields must be specified');
            }

            // field
            if (!('field' in parameter)) {
                out.field = null;
            } else if (!isString(parameter['field'])) {
                throw new TemplateError('field not a string');
            } else if (parameter['field'].length === 0) {
                throw new TemplateError('field empty');
            } else {
                out.field = parameter['field'];
            }

            // rows_with_fields
            if (!('rows_with_fields' in parameter)) {
                out.rowsWithFields = null;
            } else if (isString(parameter['rows_with_fields'])) {
                if (parameter['rows_with_fields'].length === 0) {
                    throw new TemplateError('rows_with_fields is empty');
                } else {
                    out.rowsWithFields = [parameter['rows_with_fields']];
                }
            } else if (Array.isArray(parameter['rows_with_fields'])) {
                if (parameter['rows_with_fields'].length === 0) {
                    throw new TemplateError('rows_with_fields is empty');
                } else if (parameter['rows_with_fields'].some(field => !isString(field))) {
                    throw new TemplateError('rows_with_fields contains non-string field name');
                } else if (parameter['rows_with_fields'].some(field => field.length === 0)) {
                    throw new TemplateError('rows_with_fields contains empty field name');
                } else {
                    out.rowsWithFields = parameter['rows_with_fields'];
                }
            } else {
                throw new TemplateError('rows_with_fields is not string or array');
            }

            // one_row_with_fields
            if (!('one_row_with_fields' in parameter)) {
                out.oneRowWithFields = null;
            } else if (isString(parameter['one_row_with_fields'])) {
                if (parameter['one_row_with_fields'].length === 0) {
                    throw new TemplateError('one_row_with_fields is empty');
                } else {
                    out.oneRowWithFields = [parameter['one_row_with_fields']];
                }
            } else if (Array.isArray(parameter['one_row_with_fields'])) {
                if (parameter['one_row_with_fields'].length === 0) {
                    throw new TemplateError('one_row_with_fields is empty');
                } else if (parameter['one_row_with_fields'].some(field => !isString(field))) {
                    throw new TemplateError('one_row_with_fields contains non-string field name');
                } else if (parameter['one_row_with_fields'].some(field => field.length === 0)) {
                    throw new TemplateError('one_row_with_fields contains empty field name');
                } else {
                    out.oneRowWithFields = parameter['one_row_with_fields'];
                }
            } else {
                throw new TemplateError('one_row_with_fields is not string or array');
            }
            
            return out;
        });

        if (typeof errorMap !== 'object') {
            throw new TemplateError('errorMap is not an object');
        }
        this.errorMap = errorMap;
    }

    /**
     * Get the status code to respond with from an error object.
     * @param {Error} err The error to look up, or null
     * @returns The integer status code matching the error, either from this object or the default mapping
     */
    getStatus(err) {
        if (err === null) {
            return this.errorMap[null] || DefaultErrorMap[null];
        } else if (!(err instanceof Error)) {
            return 500;
        } else {
            return this.errorMap[err.name] || DefaultErrorMap[err.name] || 500;
        }
    }

    /**
     * Get the response object from an array (as per the result of Pipeline.Store)
     * @param {Object[][]} inputArray Array of query results, which are arrays of rows, which are objects to search through for the fields described in the params
     * @returns An object containing keys described in params and properties lifted from the inputArray
     */
    getResponse(inputArray) {
        let outputObject = {};
        this.params.forEach(parameter => {
            let value;
            if (parameter.field !== null) {
                // if field in paramater: get the first occurence of it in the inputArray
                inputArray.forEach(query => query.some(row => {
                    if (parameter.field in row) {
                        value = row[parameter.field];
                        return true;
                    } else return false;
                }));
            } else if (parameter.rowsWithFields !== null) {
                // if rowsWithFields in parameter: find all rows which have those fields
                value = [];
                inputArray.forEach(query => query.forEach(row => {
                    if (parameter.rowsWithFields.every(field => field in row)) {
                        value.push(row);
                    }
                }));
            } else { // parameter.oneRowWithFields !== null
                // if oneRowWithFields in parameter: get the first row which matches
                inputArray.forEach(query => query.some(row => {
                    if (parameter.oneRowWithFields.every(field => field in row)) {
                        value = row;
                        return true;
                    } else return false;
                }));
            }

            if (value !== undefined) {
                outputObject[parameter.outName] = value;
            }
        });
        return outputObject;
    }
}

module.exports = ResponseTemplate;
