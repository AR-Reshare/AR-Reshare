const isCallable = require("is-callable");

class RequestTemplate {
    constructor(params) {
        this.params = params.map(parameter => {
            let out = {};

            // in_name
            if ('in_name' in parameter && (typeof parameter['in_name'] === 'string' || parameter['in_name'] instanceof String)) {
                out.in_name = parameter['in_name'];
            } else {
                throw new Error('fuck');
            }

            // out_name
            if ('out_name' in parameter) {
                if (typeof parameter['out_name'] === 'string' || parameter['out_name'] instanceof String) {
                    out.out_name = parameter['out_name'];
                } else {
                    throw new Error('fuck');
                }
            } else {
                out.out_name = out.in_name;
            }

            // required
            if ('required' in parameter) {
                if (parameter['required'] === true) {
                    out.required = true;
                } else if (parameter['required'] === false) {
                    out.required = false;
                } else {
                    throw new Error('fuck');
                }
            } else {
                out.required = false;
            }

            // conditions
            if ('conditions' in parameter && Array.isArray(parameter['conditions'])) {
                if (parameter['conditions'].every(c => isCallable(c))) {
                    out.conditions = parameter['conditions'];
                } else {
                    throw new Error('fuck');
                }
            } else {
                out.conditions = [];
            }

            // sanitise
            if ('sanitise' in parameter) {
                if (isCallable(parameter['sanitise'])) {
                    out.sanitise = parameter['sanitise'];
                } else {
                    throw new Error('fuck');
                }
            } else {
                out.sanitise = a=>a;
            }

            return out;
        });
    }

    process(inputObject) {
        let outputObject = {};

        this.params.forEach(parameter => {
            if (parameter.in_name in inputObject) {
                if (parameter.conditions.every(c => c(inputObject[parameter.in_name], inputObject))) {
                    let clean;
                    try {
                        clean = parameter.sanitise(inputObject[parameter.in_name]);
                    } catch (err) {
                        throw new Error('fuck');
                    }
                    outputObject[parameter.out_name] = clean;
                    return;
                } else {
                    throw new Error('fuck');
                }
            } else if (parameter.required) {
                throw new Error('fuck');
            }
        });

        return outputObject;
    }
}

module.exports = RequestTemplate;
