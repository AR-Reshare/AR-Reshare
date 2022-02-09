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
    constructor(queryDict, order) {
        this.queryDict = queryDict;
        this.order = order;

        this.order.forEach((query, index) => {
            if (!(query in this.queryDict)) throw new ConstructionError(`Query "${query}" in order but not in queryDict`);
            let q = this.queryDict[query];

            if (!('text' in q)) throw new ConstructionError(`Query "${query}" contains no text`);

            if ('values' in q) {
                q.values.forEach(elem => {
                    if (typeof elem === 'string' || elem instanceof String) {
                        if (elem !== 'accountID') throw new ConstructionError(`Value argument "${elem}" not recognised`);
                        return;
                    }
                    if (isCallable(elem)) return;
                    if (typeof elem === 'object') {
                        if ('from_input' in elem && 'from_query' in elem) {
                            throw new ConstructionError(`Query ${query} contains both from_input and from_query`);
                        }

                        if ('from_input' in elem) return;
                        if ('from_query' in elem) {
                            if (!Array.isArray(elem['from_query']) || elem['from_query'].length < 2) {
                                throw new ConstructionError('Backreference contains less than two values');
                            }
                            let i = order.indexOf(elem['from_query'][0]);
                            if (i === -1) throw new ConstructionError('Backreference to non-existant query');
                            if (i >= index) throw new ConstructionError('Backreference to future query');
                            return;
                        }
                        throw new ConstructionError('Must include either from_input or from_query');
                    }
                    throw new ConstructionError('Unparsable value');
                });
            }
        });
    }

    build(inputObject, accountID) {
        let queryList = [], queryNames = [];

        this.order.forEach(query => {
            let nextquerytexts = [];
            let nextqueryvalueses = [];
            let queryTimes = 1;

            if ('condition' in this.queryDict[query]) {
                try {
                    if (!this.queryDict[query].condition(inputObject, accountID)) return;
                } catch {
                    throw new ConstructionError('Error in callable condition function');
                }
            }

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

            for (let i=0; i<queryTimes; i++) nextquerytexts.push(this.queryDict[query].text);

            if ('values' in this.queryDict[query]) {
                for (let i=0; i<queryTimes; i++) nextqueryvalueses.push([]);

                this.queryDict[query].values.forEach(valueCons => {
                    if (valueCons === 'accountID') {
                        for (let i=0; i<queryTimes; i++) {
                            nextqueryvalueses[i].push(accountID);
                        }
                        return;
                    }
                    if (isCallable(valueCons)) {
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
                    }
                    if (typeof valueCons === 'object' && 'from_input' in valueCons) {
                        if (valueCons['from_input'] in inputObject) {
                            for (let i=0; i<queryTimes; i++) nextqueryvalueses[i].push(inputObject[valueCons['from_input']]);
                            return;
                        } else {
                            throw new ConstructionError('Key does not exist in input object');
                        }
                    }
                    if (typeof valueCons === 'object' && 'from_query' in valueCons) {
                        let qIndexes = getAllIndexes(queryNames, valueCons['from_query'][0]);
                        let fKey = valueCons['from_query'][1];

                        if (qIndexes.length === 1) {
                            let getValue = (res) => {
                                return res[qIndexes[0]][0][fKey];
                            };
                            for (let i=0; i<queryTimes; i++) nextqueryvalueses[i].push(getValue);
                            return;

                        } else if (qIndexes.length === queryTimes) {
                            for (let i=0; i<queryTimes; i++) {
                                let getValue = (res) => {
                                    return res[qIndexes[i]][0][fKey];
                                };
                                nextqueryvalueses[i].push(getValue);
                            }
                            return;

                        } else if (qIndexes.length === 0) {
                            throw new ConstructionError('Query referenced was conditional and did not run');
                        } else {
                            throw new ConstructionError('Mismatch between number of executions and number of backreferences');
                        }
                    }
                });
            }

            for (let i=0; i<queryTimes; i++) {
                let nextqueryobject = {
                    text: nextquerytexts[i],
                };
                if (nextqueryvalueses[i] !== undefined) nextqueryobject['values'] = nextqueryvalueses[i];
                queryNames.push(query);
                queryList.push(nextqueryobject);
            }
        });
        return queryList;
    }
}

// define a bunch of SQLTemplates, including maybe some custom ones that overwrite .build

module.exports = {SQLTemplate, ConstructionError}; //, template1, template2, ...};
