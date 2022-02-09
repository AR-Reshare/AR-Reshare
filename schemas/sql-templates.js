/* This file will contain template strings for PostgreSQL
*/

const isCallable = require('is-callable');

class ConstructionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConstructionError";
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
}

class SQLTemplate {
    constructor(queryDict, order) {
        this.queryDict = queryDict;
        this.order = order;
    }

    build(inputObject, accountID) {
        let queryList = [], queryNames = [];

        this.order.forEach(query => {
            let nextquerytexts = [];
            let nextqueryvalueses = [];
            let queryTimes = 1;
            
            if (!(query in this.queryDict)) {
                throw new ConstructionError('Query not found in queryDict');
            }

            if ('times' in this.queryDict[query]) {
                queryTimes = this.queryDict[query].times(inputObject, accountID);
            }

            for (let i=0; i<queryTimes; i++) nextquerytexts.push(this.queryDict[query].text);

            if ('condition' in this.queryDict[query]) {
                if (!this.queryDict[query].condition(inputObject, accountID)) return;
            }

            if ('values' in this.queryDict[query]) {
                for (let i=0; i<queryTimes; i++) nextqueryvalueses.push([]);

                this.queryDict[query].values.forEach(valueCons => {
                    if (valueCons === 'accountID') {
                        for (let i=0; i<queryTimes; i++) nextqueryvalueses[i].push(accountID);
                        return;
                    }
                    if (isCallable(valueCons)) {
                        for (let i=0; i<queryTimes; i++) nextqueryvalueses[i].push(valueCons(inputObject, accountID, queryNames));
                    }
                    if ('from_input' in valueCons) {
                        if (valueCons['from_input'] in inputObject) {
                            for (let i=0; i<queryTimes; i++) nextqueryvalueses[i].push(inputObject[valueCons['from_input']]);
                            return;
                        }
                    }
                    if ('from_query' in valueCons) {
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
                        }
                    }
                });
            }

            for (let i=0; i<queryTimes; i++) {
                let nextqueryobject = {
                    text: nextquerytexts[i],
                };
                if (nextqueryvalueses[i] !== undefined) nextqueryobject['values'] = nextqueryvalueses[i]
                queryNames.push(query);
                queryList.push(nextqueryobject);
            }
        });
        return queryList;
    }
}

// define a bunch of SQLTemplates, including maybe some custom ones that overwrite .build

module.exports = {SQLTemplate}; //, template1, template2, ...};
