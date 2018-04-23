'use strict';

var math = require('mathjs');

/**
 * Retrieve the array key corresponding to the largest element in the array.
 *
 * @param {Array.<number>} array Input array
 * @return {number} Index of array element with largest value
 */
function argmax (array) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

/**
 * Compute the expected improvement (EI) acquisition function.
 *
 * @param {number} bestObjective Best obtained objective value so far.
 * @param {Array.<number>} mean Mean values of the probability distribution over a given domain.
 * @param {Array.<number>} std Standard deviation values of the probability distribution over a given domain.
 * @return {Array.<number>} Values of the expected improvement for all points of the mean and std.
 */
function expectedImprovement (bestObjective, mean, std) {

    if (Array.isArray(mean)) {
        mean = math.matrix(mean)
    }
    if (Array.isArray(std)) {
        std = math.matrix(std)
    }

    var gamma = math.dotDivide(math.subtract(mean, bestObjective), std);

    var pdf = math.dotDivide(math.exp(math.dotDivide(math.square(gamma), -2)), math.sqrt(2 * 3.14159));
    var cdf = math.dotDivide(math.add(math.erf(math.dotDivide(gamma, math.sqrt(2))), 1), 2);

    return math.dotMultiply(std, math.add(math.dotMultiply(gamma, cdf), pdf));
}

module.exports = {
    argmax: argmax,
    expectedImprovement: expectedImprovement
};