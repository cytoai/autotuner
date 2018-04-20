'use strict';

var equal = require('deep-equal');
var math = require('mathjs');

function Optimizer (domain, modelsDomains, mean, kernel, delays=null, strategy='ei') {
    this.domain = domain;
    this.modelsDomains = modelsDomains;

    this.delays = delays;
    if (this.delays === null) {
        this.delays = math.ones(domain.length);
    }

    this.modelsSamples = {}
    for (var model in modelsDomains) {
        this.modelsSamples[model] = math.matrix([]);
    }
    this.allSamples = math.matrix([]);
    this.allSamplesDelays = math.matrix([]);
    this.observedValues = {};

    this.mean = mean;
    this.kernel = kernel;
    this.strategy = strategy;
};


Optimizer.prototype.addSample = function (point, value, delay=1.0) {

    var pointIndex = this.domain.findIndex((x) => equal(x, point));

    for (var model in this.modelsDomains) {
        if (this.modelsDomains[model].findIndex((x) => equal(x, point)) >= 0) {
            this.modelsSamples = math.concat(this.modelsSamples, [pointIndex]);
        }
    }

    this.allSamples = math.concat(this.allSamples, [pointIndex]);
    this.allSamplesDelays = math.concat(this.allSamplesDelays, [delay]);
    this.observedValues[point] = value;

};


Optimizer.prototype.getNextPoint = function () {



};


module.exports = Optimizer;