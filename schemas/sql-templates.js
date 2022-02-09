/* This file will contain template strings for PostgreSQL
*/

class ConstructionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConstructionError";
    }
}

class SQLTemplate {
    constructor(queryDict, order) {
        this.queryDict = queryDict;
        this.order = order;
    }

    build(inputObject, accountID) {
        let queryList = [], queryNames = [];

        this.order.forEach(query => {
            let nextquery = {};
            if (!(query in this.queryDict)) {
                throw new ConstructionError('Query not found in queryDict');
            }
            nextquery['text'] = this.queryDict[query].text;

            if ('values' in this.queryDict[query]) {
                nextquery['values'] = [];
                this.queryDict[query].values.forEach(valueCons => {
                    if (valueCons === 'accountID') {
                        nextquery['values'].push(accountID);
                        return;
                    }
                    if ('from_input' in valueCons) {
                        if (valueCons['from_input'] in inputObject) {
                            nextquery['values'].push(inputObject[valueCons['from_input']]);
                            return;
                        }
                    }
                    if ('from_query' in valueCons) {
                        let qIndex = queryNames.indexOf(valueCons['from_query'][0]);
                        let fKey = valueCons['from_query'][1];
                        let getValue = (res) => {
                            return res[qIndex][0][fKey];
                        };
                        nextquery['values'].push(getValue);
                    }
                });
            }
            queryNames.push(query);
            queryList.push(nextquery);
        });
        return queryList;
    }
}

// define a bunch of SQLTemplates, including maybe some custom ones that overwrite .build

module.exports = {SQLTemplate}; //, template1, template2, ...};
