'use strict';

module.exports = {
    Optimizer: require('./optimizer'),
    Paramspace: require('./paramspace')
};

var p = new module.exports.Paramspace();
p.addModel('model1', {'a':[1,2], 'b':[4,8]});