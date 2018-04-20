'use strict';

function Paramspace() {
    this.models = {};
    this.domain = [];
    this.modelsDomains = {};
};

Paramspace.prototype.addModel = function (modelName, modelParameters) {

    // Add model to model collection.
    this.models[modelName] = modelParameters;

    // Expand model parameters.
    var modelDomain = [modelParameters];
    var newElements = false;
    do {

        var params = modelDomain.shift();
        for (var key in params) {
            if (params[key].constructor === Array) {
                for (var i = 0; i < params[key].length; i++) {
                    var p = JSON.parse(JSON.stringify(params));
                    p[key] = params[key][i];
                    modelDomain.push(p);
                }
                newElements = true;
                break;
            } else {
                newElements = false;
            }
        }
        if (newElements == false) {
            modelDomain.unshift(params);
        }

    } while(newElements);

    // Add indices of the model's domain section to the modelDomains object.
    this.modelsDomains[modelName] = Array.from(new Array(modelDomain.length), (x,i) => i + this.domain.length);

    // Extend the domain with parameters.
    this.domain = this.domain.concat(Array.from(modelDomain, (p) => {return {'model' : modelName, 'params' : p}}));
};

module.exports = Paramspace;