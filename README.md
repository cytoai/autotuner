# Autotuner.js
Model selection and hyper-parameter tuning module. Uses a Bayesian optimization approach to pick most promising hyperparameters.

# Installation

```bash
npm install autotuner
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
