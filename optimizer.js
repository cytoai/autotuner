'use strict';

var equal = require('deep-equal');
var difference = require('lodash/difference');
var math = require('mathjs');
var util = require('./util');


function Optimizer (domain, modelsDomains, mean=null, kernel=null, delays=null, strategy='ei') {
    this.domain = domain;
    this.modelsDomains = modelsDomains;

    this.delays = delays;
    if (this.delays === null) {
        this.delays = math.ones(domain.length);
    }

    this.modelsSamples = {};
    for (var model in modelsDomains) {
        this.modelsSamples[model] = math.matrix([]);
    }
    this.allSamples = math.matrix([]);
    this.allSamplesDelays = math.matrix([]);
    this.observedValues = {};
    this.best = null;

    if (mean === null) {
        mean = math.zeros(this.domain.length)
    } else if (Array.isArray(mean)) {
        mean = math.matrix(mean)
    }
    if (kernel === null) {
        kernel = math.eye(this.domain.length)
    } else if (Array.isArray(kernel)) {
        kernel = math.matrix(kernel)
    }

    this.mean = mean;
    this.kernel = kernel;
    this.strategy = strategy;
};


Optimizer.prototype.addSample = function (point, value, delay=1.0) {

    var pointIndex = this.domain.findIndex((x) => equal(x, point));

    for (var model in this.modelsDomains) {
        if (this.modelsDomains[model].findIndex((x) => equal(x, point)) >= 0) {
            this.modelsSamples[model] = math.concat(this.modelsSamples[model], [pointIndex]);
        }
    }

    this.allSamples = math.concat(this.allSamples, [pointIndex]);
    this.allSamplesDelays = math.concat(this.allSamplesDelays, [delay]);
    this.observedValues[point] = value;

    if (this.best === null || this.observedValues[this.best] < value) {
        this.best = point;
    }
};


Optimizer.prototype.getNextPoint = function (excludeModels=[]) {

    var domainIndices = Array.from(new Array(this.domain.length), (x,i) => i);

    // If allSamples contains samples from the whole domain, then we will skip the posterior calculation step.
    if (difference(domainIndices, this.allSamples).length === 0) {

        var posteriorMean = math.matrix(Array.from(this.domain, (x) => this.observedValues[x]));
        var posteriorStd = math.zeros(posteriorMean.size());
        var expectedImprov = math.zeros(posteriorMean.size());

    } else {

        // Compute best rewards for each model.
        var modelsBestRewards = {};
        for (var model in this.modelsSamples) {
            modelsBestRewards[model] = Math.max.apply(null, Array.from(this.modelsSamples[model].toArray(), (x) => this.observedValues[this.domain[x]]));
        }

        // Compute posterior distribution (mean and standard deviation).
        var domainSize = this.mean.size()[0];
        var sampleSize = this.allSamples.size()[0];
        var sampleRewards = math.matrix(Array.from(this.allSamples.toArray(), (x) => this.observedValues[this.domain[x]]));
        var samplePriorMean = this.mean.subset(math.index(this.allSamples));
        var sampleKernel = this.kernel.subset(math.index(this.allSamples, this.allSamples));
        var allToSampleKernel = this.kernel.subset(math.index(math.range(0, domainSize), this.allSamples));

        // Sample kernel is sometimes a scalar.
        if (typeof(sampleKernel) === 'number') {
            sampleKernel = math.matrix([[sampleKernel]]);
        }

        // Defend against singular matrix inversion.
        sampleKernel = math.add(sampleKernel, math.multiply(math.eye(sampleSize), 0.001));


        var sampleKernelInv = math.inv(sampleKernel);
        var sampleRewardGain = math.reshape(math.subtract(sampleRewards, samplePriorMean), [sampleSize, 1]);
        var sampleKernelDotGain = math.multiply(sampleKernelInv, sampleRewardGain);
        var posteriorMean = math.add(math.multiply(allToSampleKernel, sampleKernelDotGain), math.reshape(this.mean, [domainSize, 1]));

        var posteriorKernel = math.multiply(allToSampleKernel, math.multiply(sampleKernelInv, math.transpose(allToSampleKernel)));
        posteriorKernel = math.subtract(this.kernel, posteriorKernel);

        this.posteriorMean = posteriorMean;

        var posteriorStd = math.sqrt(math.diag(posteriorKernel).reshape([domainSize, 1]));

        // Compute the expected improvement.
        var expectedImprov = math.zeros(domainSize);
        for (var model in this.modelsDomains) {
            var modelPoints = difference(this.modelsDomains[model], this.modelsSamples[model].toArray());
            var modelPosteriorMean = posteriorMean.subset(math.index(modelPoints, 0));
            var modelPosteriorStd = posteriorStd.subset(math.index(modelPoints, 0));
            var modelExpectedImprov = util.expectedImprovement(modelsBestRewards[model], modelPosteriorMean, modelPosteriorStd);
            modelExpectedImprov = modelExpectedImprov.reshape([modelPoints.length]);

            expectedImprov = expectedImprov.subset(math.index(modelPoints), math.add(expectedImprov.subset(math.index(modelPoints)), modelExpectedImprov));
        }

        // Rescale EI with delays.
        expectedImprov = math.dotDivide(expectedImprov, this.delays);

        // Ensure the expected improvement is zero for all observed points.
        for (var i = 0; i < this.allSamples.length; i++) {
            expectedImprov.set(this.allSamples[i], 0);
        }

    }

    // Determine the model choice based on the specified strategy.
    var allModels = Object.keys(this.modelsDomains);

    if (this.strategy === 'ei') {

        // Exclude some models from the domain if specified.
        allModels = difference(allModels, excludeModels);
        var excludedDomain = [];
        for (var i = 0; i < excludeModels.length; i++) {
            excludedDomain = excludedDomain.concat(this.modelsDomains[excludeModels[i]]);
        }
        var domain = [].concat.apply([], Array.from(allModels, (x) => this.modelsDomains[x]));

    } else if (this.strategy === 'rr') {
        model = allModels[this.allSamples.length % allModels.length];
        var domain = this.modelsDomains[model];
    } else if (this.strategy === 'rnd') {
        model = math.pickRandom(allModels);
        var domain = this.modelsDomains[model];
    } else {
        throw "Accepted values for strategy are: ei, rr and rnd.";
    }

    // Sample the point with maximal expected improvement over the given domain.
    var idx = util.argmax(math.subset(expectedImprov.toArray(), math.index(domain)));

    if (expectedImprov[idx] === 0) {
        // If the whole domain has been sampled, then just run the point with the shortest delay.
        idx = util.argmax(this.delays.subset(math.index(domain)).toArray());
    }

    return this.domain[domain[idx]];

};


module.exports = Optimizer;