/* This file will contain template strings for PostgreSQL
*/

const isCallable = require('is-callable');

class ConstructionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConstructionError';
    }
}

const getAllIndexes = (arr, elem) => {
    let indexes = [];
    for (let i=0; i<arr.length; i++) {
        if (arr[i] === elem) {
            indexes.push(i);
        }
    }
    return indexes;
};

class SQLTemplate {

    /**
     * Build the SQLTemplate
     * @param {*} queryDict A dictionary of queries. Each query must have text, plus optional values, times, and condition properties.
     * @param {*} order A list of strings which correspond to keys in the queryDict, giving the order that the queries should be executed.
     */
    constructor(queryDict, order) {
        this.queryDict = queryDict;
        this.order = order;

        // verify some things now, so we don't have to in .build
        this.order.forEach((query, index) => {

            // make sure all the queries used actually exist
            if (!(query in this.queryDict)) {
                throw new ConstructionError(`Query "${query}" in order but not in queryDict`);
            }

            let q = this.queryDict[query];

            // make sure the queries all have text in
            if (!('text' in q)) {
                throw new ConstructionError(`Query "${query}" contains no text`);
            }

            if ('values' in q) {
                // values can be one of 4 things
                q.values.forEach(elem => {
                    // the string "accountID"
                    if (typeof elem === 'string' || elem instanceof String) {
                        if (elem !== 'accountID') {
                            throw new ConstructionError(`Value argument "${elem}" not recognised`);
                        }
                        return;

                    // callables
                    } else if (isCallable(elem)) {
                        return;
                    
                    // or objects containing exactly one of from_input or from_query
                    } else if (typeof elem === 'object') {
                        if ('from_input' in elem && 'from_query' in elem) {
                            throw new ConstructionError(`Query ${query} contains both from_input and from_query`);

                        } else if ('from_input' in elem) {
                            return;

                        } else if ('from_query' in elem) {
                            // from_query has to be provided with a list of two elements
                            if (!Array.isArray(elem['from_query']) || elem['from_query'].length < 2) {
                                throw new ConstructionError('Backreference contains less than two values');
                            }

                            // make sure the backreference is to an actual query that will have already been executed
                            let i = order.indexOf(elem['from_query'][0]);
                            if (i === -1) {
                                throw new ConstructionError('Backreference to non-existant query');
                            } else if (i >= index) {
                                throw new ConstructionError('Backreference to future query');
                            }

                        } else {
                            throw new ConstructionError('Must include either from_input or from_query');
                        }
                    } else {
                        throw new ConstructionError('Unparsable value');
                    }
                });
            }
        });
    }

    /**
     * Build the set of queries from an input object and account ID.
     * @param {*} inputObject Object containing values which can be used as parameters to the queries.
     * @param {*} accountID ID of the user who is performing this request.
     * @returns A list of queries which can be passed to Database.complexQuery.
     */
    build(inputObject, accountID) {
        let queryList = [], queryNames = [];

        this.order.forEach(query => {
            let nextquerytexts = [];
            let nextqueryvalueses = [];
            let queryTimes = 1;

            // handle the query's condition (conditional execution)
            if ('condition' in this.queryDict[query]) {
                try {
                    if (!this.queryDict[query].condition(inputObject, accountID)) {
                        return; // skip this query
                    }

                } catch {
                    throw new ConstructionError('Error in callable condition function');
                }
            }

            // handle the query's times (multiple execution)
            if ('times' in this.queryDict[query]) {
                try {
                    queryTimes = this.queryDict[query].times(inputObject, accountID);
                } catch {
                    throw new ConstructionError('Error in callable times function');
                }
                if (!(Number.isInteger(queryTimes)) || queryTimes < 0) {
                    throw new ConstructionError('Return value of times function was not a positive integer');
                }
            }

            // handle the query's text
            for (let i=0; i<queryTimes; i++) {
                nextquerytexts.push(this.queryDict[query].text);
            }

            if ('values' in this.queryDict[query]) {
                // initialise value arrays for each query
                for (let i=0; i<queryTimes; i++) {
                    nextqueryvalueses.push([]);
                }

                this.queryDict[query].values.forEach(valueCons => {

                    // handle "accountID"
                    if (valueCons === 'accountID') {
                        for (let i=0; i<queryTimes; i++) {
                            nextqueryvalueses[i].push(accountID);
                        }
                        return;
                    
                    // handle callable
                    } else if (isCallable(valueCons)) {
                        let value;
                        try {
                            value = valueCons(inputObject, accountID, queryNames);
                        } catch {
                            throw new ConstructionError('Error in callable value constructor');
                        }

                        for (let i=0; i<queryTimes; i++) {
                            nextqueryvalueses[i].push(value);
                        }
                        return;

                    // handle from_input
                    } else if (typeof valueCons === 'object' && 'from_input' in valueCons) {
                        if (valueCons['from_input'] in inputObject) {
                            for (let i=0; i<queryTimes; i++) {
                                nextqueryvalueses[i].push(inputObject[valueCons['from_input']]);
                            }

                        } else {
                            throw new ConstructionError('Key does not exist in input object');
                        }

                    // handle from_query
                    } else { // if (typeof valueCons === 'object' && 'from_query' in valueCons) {
                        let qIndexes = getAllIndexes(queryNames, valueCons['from_query'][0]);
                        let fKey = valueCons['from_query'][1];

                        // backreference is to one query
                        if (qIndexes.length === 1) {
                            let getValue = (res) => {
                                return res[qIndexes[0]][0][fKey];
                            };

                            for (let i=0; i<queryTimes; i++) {
                                nextqueryvalueses[i].push(getValue);
                            }

                        // backreference is to query with multiple execution
                        } else if (qIndexes.length === queryTimes) {
                            for (let i=0; i<queryTimes; i++) {
                                let getValue = (res) => {
                                    return res[qIndexes[i]][0][fKey];
                                };
                                nextqueryvalueses[i].push(getValue);
                            }

                        // handle error cases
                        } else if (qIndexes.length === 0) {
                            throw new ConstructionError('Query referenced was conditional and did not run');
                        } else {
                            throw new ConstructionError('Mismatch between number of executions and number of backreferences');
                        }
                    }
                });
            }

            // build queries and push to output
            for (let i=0; i<queryTimes; i++) {
                let nextqueryobject = {
                    text: nextquerytexts[i],
                };
                if (nextqueryvalueses[i] !== undefined) {
                    nextqueryobject['values'] = nextqueryvalueses[i];
                }
                queryNames.push(query);
                queryList.push(nextqueryobject);
            }
        });
        return queryList;
    }
}

// define a bunch of SQLTemplates, including maybe some custom ones that overwrite .build
const CreateAccountTemplate = new SQLTemplate({
    create: {
        text: 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ($1, $2, $3, $4) RETURNING UserID',
        values: ['name', 'email', 'hash_password', 'date_of_birth'],
    },
}, ['create']);

const CreateAdminAccountTemplate = new SQLTemplate({
    create: {
        text: 'INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ($1, $2, $3, $4) RETURNING UserID',
        values: [{
            from_input: 'name'
        }, {
            from_input: 'email'
        }, {
            from_input: 'hash_password'
        }, {
            from_input: 'date_of_birth'
        }],
    },
    make_admin: {
        text: 'INSERT INTO Administrator (UserID) VALUES ($1)',
        values: [{
            from_query: ['create', 'UserID'],
        }],
    },
}, ['create', 'make_admin']);

const sqlTemplatesDict = {
    'create-account': CreateAccountTemplate,
    'create-admin': CreateAdminAccountTemplate,
};

module.exports = {SQLTemplate, ConstructionError, sqlTemplatesDict};
