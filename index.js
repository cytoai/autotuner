'use strict';
var math = require('mathjs');

module.exports = {
    Optimizer: require('./optimizer'),
    Paramspace: require('./paramspace'),
    Priors: require('./priors')
};

var domain = [1,2,3];
var priors = new module.exports.Priors(domain);
priors.commit({1:2});
priors.commit({1:4, 2:5});
