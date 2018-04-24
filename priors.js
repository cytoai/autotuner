'use strict';

var equal = require('deep-equal');
var math = require('mathjs');

function Priors (domain) {
    this.domain = domain
    this.observedValues = {}
    for (var i=0; i < domain.length; i++) {
        this.observedValues[domain[i]] = [];
    }
    this.mean = math.zeros(domain.length).toArray();
    this.kernel = math.eye(domain.length).toArray();
};

Priors.prototype.commit = function (observedValues) {

    for (var point in observedValues) {
        this.observedValues[point].push(observedValues[point]);

        // Find domain index.
        var idx = this.domain.findIndex((x) => equal(x, point));

        // Recompute the mean.
        this.mean[idx] = math.mean(this.observedValues[point]);
    }

    // We find the points that have never been sampled and assign them with the mean taken over the whole sample set.
    var sum = 0;
    var count = 0;
    for (var point in this.observedValues) {
        if (this.observedValues[point].length > 0) {
                sum += this.observedValues[point].reduce((a,b) => a+b);
                count += this.observedValues[point].length;
        }
    }
    for (var i = 0; i < this.domain.length; i++) {
        if (this.observedValues[this.domain[i]].length === 0) {
            this.mean[i] = sum / count;
        }
    }

    // Recompute the kernel by using the standard covariance function between all observed points.
    for (var point in observedValues) {
        var idx = this.domain.findIndex((x) => equal(x, point));
        for (var point2 in observedValues) {
            if (this.observedValues[point2].length > 0){
                var idx2 = this.domain.findIndex((x) => equal(x, point2));
                var cov = 0.0;
                for (var i = 0; i < this.observedValues[point].length; i++) {
                    for (var j = 0; j < this.observedValues[point2].length; j++) {
                        if (i <= j) {
                            cov += (this.observedValues[point][i] - this.mean[idx]) * (this.observedValues[point2][j] - this.mean[idx2]);
                        }
                    }
                }
                cov /= (this.observedValues[point].length * this.observedValues[point2].length)
                this.kernel[idx][idx2] = cov;
                this.kernel[idx2][idx] = cov;
            }
        }
    }
};

module.exports = Priors;