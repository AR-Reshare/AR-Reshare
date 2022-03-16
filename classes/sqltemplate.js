const isCallable = require('is-callable');
const {QueryTemplateError, QueryConstructionError, EmptyResponseError, EmptyQueryError} = require('./errors');

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
     * @param {*} options Dictionary of options to use for the template.
     */
    constructor(queryDict, order, options={}) {
        this.queryDict = queryDict;
        this.order = order;

        this.errorOnEmptyResponse = ('error_on_empty_response' in options && options.error_on_empty_response === true);
        this.errorOnEmptyTransaction = ('error_on_empty_transaction' in options && options.error_on_empty_transaction === true);
        this.dropFromResults = ('drop_from_results' in options && options.drop_from_results);

        if (this.order.length === 0 && this.errorOnEmptyTransaction) {
            throw new QueryTemplateError('Template contains no queries');
        }

        if (this.dropFromResults) {
            if (this.dropFromResults.some(q => !this.order.includes(q))) {
                throw new QueryTemplateError('Query to drop not in template');
            } else if (this.errorOnEmptyResponse && !this.order.some(q => !this.dropFromResults.includes(q))) {
                throw new QueryTemplateError('Dropping every query in template');
            }
        }

        // verify some things now, so we don't have to in .build
        this.order.forEach((query, index) => {

            // make sure all the queries used actually exist
            if (!(query in this.queryDict)) {
                throw new QueryTemplateError(`Query "${query}" in order but not in queryDict`);
            }

            let q = this.queryDict[query];

            // make sure the queries all have text in
            if (!('text' in q)) {
                throw new QueryTemplateError(`Query "${query}" contains no text`);
            }

            if ('values' in q) {
                // values can be one of 3 things
                q.values.forEach(elem => {
                    // callables
                    if (isCallable(elem)) {
                        return;
                    
                    // or objects containing exactly one of from_input or from_query
                    } else if (typeof elem === 'object') {
                        if ('from_input' in elem && 'from_query' in elem) {
                            throw new QueryTemplateError(`Query ${query} contains both from_input and from_query`);

                        } else if ('from_input' in elem) {
                            return;

                        } else if ('from_query' in elem) {
                            // from_query has to be provided with a list of two elements
                            if (!Array.isArray(elem['from_query']) || elem['from_query'].length < 2) {
                                throw new QueryTemplateError('Backreference contains less than two values');
                            }

                            // make sure the backreference is to an actual query that will have already been executed
                            let i = order.indexOf(elem['from_query'][0]);
                            if (i === -1) {
                                throw new QueryTemplateError('Backreference to non-existant query');
                            } else if (i >= index) {
                                throw new QueryTemplateError('Backreference to future query');
                            }

                        } else {
                            throw new QueryTemplateError('Must include either from_input or from_query');
                        }
                    } else {
                        throw new QueryTemplateError('Unparsable value');
                    }
                });
            }
        });
    }

    /**
     * Build the set of queries from an input object and account ID.
     * @param {*} inputObject Object containing values which can be used as parameters to the queries.
     * @returns A list of queries which can be passed to Database.complexQuery.
     */
    build(inputObject) {
        let queryList = [], queryNames = [];

        this.order.forEach(query => {
            let nextquerytexts = [];
            let nextqueryvalueses = [];
            let queryTimes = 1;

            // handle the query's condition (conditional execution)
            if ('condition' in this.queryDict[query]) {
                try {
                    if (!this.queryDict[query].condition(inputObject)) {
                        return; // skip this query
                    }

                } catch {
                    throw new QueryConstructionError('Error in callable condition function');
                }
            }

            // handle the query's times (multiple execution)
            if ('times' in this.queryDict[query]) {
                try {
                    queryTimes = this.queryDict[query].times(inputObject);
                } catch {
                    throw new QueryConstructionError('Error in callable times function');
                }
                if (!(Number.isInteger(queryTimes)) || queryTimes < 0) {
                    throw new QueryConstructionError('Return value of times function was not a positive integer');
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

                    // handle callable
                    if (isCallable(valueCons)) {
                        let value;
                        try {
                            value = valueCons(inputObject, queryNames);
                        } catch {
                            throw new QueryConstructionError('Error in callable value constructor');
                        }

                        for (let i=0; i<queryTimes; i++) {
                            nextqueryvalueses[i].push(value);
                        }
                        return;

                    // handle from_input
                    } else if (typeof valueCons === 'object' && 'from_input' in valueCons) {
                        if (valueCons['from_input'] in inputObject) {
                            let val = inputObject[valueCons['from_input']];

                            // value is array and length matches times
                            if (Array.isArray(val) && val.length === queryTimes) {
                                for (let i=0; i<queryTimes; i++) {
                                    nextqueryvalueses[i].push(inputObject[valueCons['from_input']][i]);
                                }

                            // value is not array or length does not match times
                            } else {
                                for (let i=0; i<queryTimes; i++) {
                                    nextqueryvalueses[i].push(inputObject[valueCons['from_input']]);
                                }
                            }

                        } else {
                            // throw new QueryConstructionError(`Key ${valueCons['from_input']} does not exist in input object`);
                            for (let i=0; i<queryTimes; i++) {
                                // "doesn't exist in input" should be handled by DataValidate anyway
                                nextqueryvalueses[i].push(null);
                            }
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
                            throw new QueryConstructionError('Query referenced was conditional and did not run');
                        } else {
                            throw new QueryConstructionError('Mismatch between number of executions and number of backreferences');
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

        if (queryList.length === 0 && this.errorOnEmptyTransaction) {
            throw new EmptyQueryError('Transaction contains no queries');
        }

        return [queryNames, queryList];
    }

    prepareResults(queryNames, result) {
        let out = result;

        if (this.dropFromResults) {
            out = out.filter((_, i) => !this.dropFromResults.includes(queryNames[i]));
        }
        if (this.errorOnEmptyResponse && !out.some(res => res.length !== 0)) {
            throw new EmptyResponseError('No values returned from query');
        }

        return out;
    }
}

module.exports = SQLTemplate;
