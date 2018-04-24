'use strict';
var math = require('mathjs');

module.exports = {
    Optimizer: require('./optimizer'),
    Paramspace: require('./paramspace'),
    Priors: require('./priors')
};

/*
var domain = [1,2,3];
var priors = new module.exports.Priors(domain);
priors.commit({1:2});
priors.commit({2:4});
priors.commit({1:4, 2:5});
console.log(priors.kernel);
*/

/*
var domain = [1,2,3,4,5];
var modelsDomains = {'a' : [0,1,2,3,4]};
var mean = math.matrix([0, 0, 0, 0, 3]);
var optimizer = new module.exports.Optimizer(domain, modelsDomains, mean=mean);
optimizer.addSample(2, 1.0);
optimizer.addSample(1, 2.0);
optimizer.addSample(4, 2.5);
var point = optimizer.getNextPoint();

console.log(optimizer.posteriorMean.toArray());
console.log(optimizer.posteriorKernel.toArray());
*/