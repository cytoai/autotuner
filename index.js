'use strict';
var math = require('mathjs');

module.exports = {
    Optimizer: require('./optimizer'),
    Paramspace: require('./paramspace')
};

var domain = [1,2,3,4,5];
var modelsDomains = {'a' : [0,1,2,3,4]};
var mean = [0, 0, 0, 0, 3];
var optimizer = new module.exports.Optimizer(domain, modelsDomains, mean=mean);
optimizer.addSample(2, 1.0);
optimizer.addSample(1, 2.0);
optimizer.addSample(4, 2.5);
var point = optimizer.getNextPoint();