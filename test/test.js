'use strict';

var autotuner = require('../index');
var expect = require('chai').expect;
var math = require('mathjs');

describe('#Optimizer', function () {
    it('should be initialized properly', function () {
        var domain = [1,2,3,4,5];
        var modelsDomains = {'a' : [1,2], 'b' : [3,4,5]};
        var mean = math.ones(domain.length);
        var kernel = math.ones(domain.length, domain.length);
        var result = new autotuner.Optimizer(domain, modelsDomains, mean, kernel)
        expect(result.domain).to.eql([1,2,3,4,5])
        expect(result.modelsDomains['a']).to.eql([1,2])
        expect(result.modelsDomains['b']).to.eql([3,4,5])
    });
});


describe('#Paramspace', function () {
   it ('should be initialized properly', function () {
       var result = new autotuner.Paramspace();
   });

    it ('should expand a single parameter array', function () {
        var p = new autotuner.Paramspace();
        p.addModel('model1', {'a' : [1,2,3], 'b' : 10});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 1, 'b' : 10}});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 2, 'b' : 10}});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 3, 'b' : 10}});
    });

    it ('should expand two parameter arrays', function () {
        var p = new autotuner.Paramspace();
        p.addModel('model1', {'a' : [1,2], 'b' : [3,6]});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 1, 'b' : 3}});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 2, 'b' : 3}});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 1, 'b' : 6}});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 1, 'b' : 6}});
    });

    it ('should expand two parameter arrays where one is a single element array', function () {
        var p = new autotuner.Paramspace();
        p.addModel('model1', {'a' : [1,2], 'b' : [3]});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 1, 'b' : 3}});
        expect(p.domain).to.deep.include({'model' : 'model1', 'params' : {'a' : 2, 'b' : 3}});
    });

    it ('should assign proper indices to models', function () {
        var p = new autotuner.Paramspace();
        p.addModel('model1', {'a' : [1,2], 'b' : [3]});
        p.addModel('model2', {'a' : [1,2], 'b' : [3]});
        expect(p.modelsDomains['model1']).to.deep.equal([0, 1]);
        expect(p.modelsDomains['model2']).to.deep.equal([2, 3]);
    });
});