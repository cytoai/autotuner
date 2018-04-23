# Autotuner.js
Model selection and hyper-parameter tuning module. Uses a Bayesian optimization approach to pick most promising hyperparameters.

# Getting Started

Install the package with Node:
```bash
npm install autotuner
```

To run tests:
```bash
npm test
```

To build the bundled `autotuner.js` script:
```bash
npm run-script build
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
var opt = new autotuner.Optimizer(p.domainIndices, p.modelsDomains);

while (optimizing) {
    point = opt.getNextPoint();
    params = p.domain[point];
    
    // Train a model given the params and obrain a quality metric value.
    
    p.addSample(point, value);
}

```

If we want to take advantage of the observed values to improve future optimization runs, we use the `Priors` helper class.
```javascript
var priors = new autotuner.Priors(p.domainIndices);

var opt = new autotuner.Optimizer(p.domainIndices, p.modelsDomains, priors.mean, priors.kernel);

while (optimizing) {
    point = opt.getNextPoint();
    params = p.domain[point];
    
    // Train a model given the params and obrain a quality metric value.
    
    p.addSample(point, value);
}

// Commit the observed points to the priors.
priors.commit(p.observedValues);

// Now the priors.mean and priors.kernel is updated with the observed values.
``` 
