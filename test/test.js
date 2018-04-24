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
        var optimizer = new autotuner.Optimizer(domain, modelsDomains, mean, kernel);
        expect(optimizer.domain).to.eql([1,2,3,4,5])
        expect(optimizer.modelsDomains['a']).to.eql([1,2])
        expect(optimizer.modelsDomains['b']).to.eql([3,4,5])
    });
    
    it('should be able to add a sample', function () {
        var domain = [1,2,3,4,5];
        var modelsDomains = {'a' : [0,1,2,3,4]};
        var optimizer = new autotuner.Optimizer(domain, modelsDomains);
        optimizer.addSample(2, 1.0);
        expect(optimizer.observedValues[2]).to.equal(1.0);
    });
    
    it('should compute the next point', function () {
        var domain = [1,2,3,4,5];
        var modelsDomains = {'a' : [0,1,2,3,4]};
        var optimizer = new autotuner.Optimizer(domain, modelsDomains);
        optimizer.addSample(2, 1.0);
        var point = optimizer.getNextPoint();
        expect(point).to.not.be.oneOf([2]);
    });

    it('should compute the next point after 3 samples', function () {
        var domain = [1,2,3,4,5];
        var modelsDomains = {'a' : [0,1,2,3,4]};
        var optimizer = new autotuner.Optimizer(domain, modelsDomains);
        optimizer.addSample(2, 1.0);
        optimizer.addSample(1, 2.0);
        optimizer.addSample(4, 0.5);
        var point = optimizer.getNextPoint();
        expect(point).to.not.be.oneOf([1,2,4]);
    });

    it('should take the mean prior into account when computing the next point', function () {
        var domain = [1,2,3,4,5];
        var modelsDomains = {'a' : [0,1,2,3,4]};
        var mean = math.matrix([0, 0, 0, 0, 3]);
        var optimizer = new autotuner.Optimizer(domain, modelsDomains, mean=mean);
        optimizer.addSample(2, 1.0);
        optimizer.addSample(1, 2.0);
        optimizer.addSample(4, 2.5);
        var point = optimizer.getNextPoint();
        expect(point).to.equal(5);
    });

    it('should take the correlated points into account when computing the next point', function () {
        var domain = [1,2,3,4];
        var modelsDomains = {'a' : [0,1,2,3]};
        var kernel = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 1],
            [0, 0, 1, 1]
        ];
        var optimizer = new autotuner.Optimizer(domain, modelsDomains, null, kernel);
        optimizer.addSample(2, 1.0);
        optimizer.addSample(4, 2.5);
        var point = optimizer.getNextPoint();
        expect(point).to.equal(3);
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

describe('#Priors', function () {

    it ('should be initialized properly', function () {
        var domain = [1,2,3];
        var priors = new autotuner.Priors(domain);
        expect(priors.mean).to.eql([0,0,0]);
        expect(priors.kernel).to.eql([[1,0,0], [0,1,0], [0,0,1]]);
    });

    it ('should compute the mean', function () {
        var domain = [1,2,3];
        var priors = new autotuner.Priors(domain);
        priors.commit({1:2});
        priors.commit({1:4, 2:6});
        expect(priors.mean).to.eql([3,6,4]);
    });

});
