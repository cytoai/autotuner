# Autotuner.js
Autotuner is a machine learning model selection and hyper-parameter tuning module. Uses a Bayesian optimization approach to pick most promising hyperparameters.

# Getting Started

Install and use the package with Node:
```bash
npm install autotuner
```
```javascript
var autotuner = require('autotuner');
```

Install and use the package with Bower:
```bash
bower install autotuner
```

# Usage

We first define the parameter space. It is done with the `Paramspace` class. We add models to it by calling `addModel(modelName, modelParameters)` where `modelName` is a string model identifier, and `modelParameters` is an object where fields are parameter names and values are lists of possible parameter values.

Here is an example:
```javascript
var p = new autotuner.Paramspace();
p.addModel('model1', {'param1' : [1,2,3], 'param2' : 10});
p.addModel('model2', {'param3' : [5,10,15]});
```

Then we use the parameter space to initialize the optimizer:
```javascript
// Initialize the optimizer with the parameter space.
var opt = new autotuner.Optimizer(p.domainIndices, p.modelsDomains);

while (optimizing) {
    // Take a suggestion from the optimizer.
    var point = opt.getNextPoint();
    
    // We can extract the model name and parameters.
    var model = p.domain[point]['model'];
    var params = p.domain[point]['params'];
    
    // Train a model given the params and obtain a quality metric value.
    // ...
    
    // Report the obtained quality metric value.
    p.addSample(point, value);
}

```
## Transfer learning

If we want to take advantage of the observed values from the previous optimization runs to improve our next optimization run, we need the `Priors` helper class.
```javascript
// This object is created only once and kept across optimization runs.
var priors = new autotuner.Priors(p.domainIndices);
```
We then use this class in our optimization runs as follows:
```javascript
// Use the mean and kernel from the Priors instance to
// initialize the optimizer. 
var opt = new autotuner.Optimizer(p.domainIndices, p.modelsDomains, priors.mean, priors.kernel);

// Regular optimization run.
while (optimizing) {
    var point = opt.getNextPoint();
    var model = p.domain[point]['model'];
    var params = p.domain[point]['params'];
    // ...
    p.addSample(point, value);
}

// Commit the observed points to the priors.
priors.commit(p.observedValues);
```
After commiting the observed values, the `priors.mean` and `priors.kernel` are updated with the observed values so we can use them to initialize the next optimization run.


# Development

Pull and initialize:
```bash
git pull https://github.com/cytoai/autotuner.git
cd autotuner
npm install
```

To run tests:
```bash
npm test
```

To build the bundled `autotuner.js` script:
```bash
npm run-script build
```