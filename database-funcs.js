/**
 * This file creates the database connection and implements some low-level functions for accessing the database.
 * Pipeline.Store, and whatever other functions end up accessing the database, should do so by calling something in this file.
 */

const {Pool} = require('pg');
const isCallable = require('is-callable');

class Database {
    /**
     * Create a new Database object for querying
     * @param {Object} db_credentials The credentials to use to access the database (e.g. connection.json).
     */
    constructor (db_credentials) {
        this.pool = new Pool(db_credentials);
    }

    /**
     * Executes a query on the database
     * @async
     * @param {string} queryTemplate - The query to execute, which may be parameterised 
     * @param {string[]} [values=[]] - (Optional, Array) The values to substitute into the parameterised query
     * @returns {Promise<Object[]>} Promise object which resolves with an array of results from the query. Each object in the array corresponds to a row returned from the query. Keys of the object correspond to fields returned, in lowercase.
     */
    simpleQuery = (queryTemplate, values=[]) => {
        return new Promise((resolve, reject) => {
            this.pool.query(queryTemplate, values).then(res => {
                resolve(res.rows);
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Executes a set of queries in order as a single transaction. If there is only one query, use simpleQuery instead.
     * @async
     * @param {Object[]} queries - An array of query objects to be executed. Can be either strings, with no parameters, or objects with:
     * queries.text - The query to execute, which may be parameterised;
     * queries.values - (Optional, Array) The values to substitute into the parameterised query
     * @returns {Promise<Object[][]>} Promise object which resolves with an array of arrays containing the results from each query. Subarrays correspond to queries i.e. results of the 3rd query will be in the 3rd position of the array. Each object in a subarray corresponds to a row returned from the query. Keys of the object correspond to fields returned, in lowercase.
     */
    complexQuery = (queries) => {
        return new Promise((resolve, reject) => {
            this.pool.connect().then(client => {
                let err, result = [];

                client.query('BEGIN').then(() => {
                    // treats queries as a queue. This function takes the first one, executes it, and appends the results to the "global" (from the function's perspective) result variable, then does the next one recursively
                    let nextQueryHandler = () => {
                        return new Promise((rslv, rjct) => {
                            let nextquery = queries.shift();
                            let text;
                            let values = [];
                            if ('text' in nextquery) {
                                text = nextquery.text;
                            } else {
                                rjct(new Error('No query text provided'));
                                return;
                            }

                            if ('values' in nextquery) {
                                for (let elem of nextquery.values) {
                                    let temp = elem;
                                    if (isCallable(elem)) {
                                        try {
                                            temp = elem(result);
                                            if (temp === undefined) {
                                                throw new ReferenceError('Value not found');
                                            }
                                        } catch (err) {
                                            rjct(err);
                                            return;
                                        }
                                    }
                                    values.push(temp);
                                }
                            }

                            client.query(text, values).then(res => {
                                result.push(res.rows);

                                if (queries.length == 0) {
                                    // base case
                                    return client.query('COMMIT');
                                } else {
                                    // recursive case
                                    return nextQueryHandler();
                                }
                            }).then(rslv, rjct); // propogate resolve or reject back to top level
                        });
                    }

                    return nextQueryHandler();
                }).catch(e => {
                    err = e;
                    return client.query('ROLLBACK');
                }).finally(() => {
                    client.release();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }).catch(err => {
                reject(err);
            })
        });
    }

    end() {
        this.pool.end();
    }
}

module.exports = Database;
