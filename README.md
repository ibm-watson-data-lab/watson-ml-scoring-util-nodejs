# Watson Machine Learning Scoring

Note: This is a work in progress. Use exact versions when installing (e.g. --save-exact) as backwards-incompatible changes may be introduced.

## Overview

This is a simple Node.js wrapper for calling scoring endpoints on deployed models in the Watson Machine Learning service.

## Installation

This package can be installed via npm:
`npm install watson-ml-scoring-util`

## Running

After setting up your environment (see below) you can make machine learning predictions with just a few lines of code. First, include the `WatsonMLScoringEndpoint` class from the `watson-ml-scoring-util` module:

```javascript
const { WatsonMLScoringEndpoint } = require("watson-ml-scoring-util");
```

Create an instance of the `WatsonMLScoringEndpoint` with the features you used to train your model:

```javascript
const features = ['SquareFeet', 'Bedrooms'];
const endpoint = new WatsonMLScoringEndpoint(features);
```

Make a prediction by calling `score` with the values you would like to use for your prediction:

```javascript
const values = [2400, 4];
endpoint.score(values)
  .then(predictions => console.log(predictions))
  .catch(err => console.log(err));
```

The `WatsonMLScoringEndpoint` will look in your environment for the appropriate Watson ML credentials, Model ID, and Deployment ID.
Alternatively, you can pass in the Model ID and Deployment IDs. This would be valuable if you plan on testing or working with multiple versions of the same model.

```javascript
let endpoint = new WatsonMLScoringEndpoint(features, {
  modelId: 'xxx',
  deploymentId: 'xxx'
});
```

You can also pass in your Watson ML service credentials (or you can selectively choose what features you want to pass in -- all others will be read from the environment):

```javascript
let endpoint = new WatsonMLScoringEndpoint(features, {
  servicePath: 'https://ibm-watson-ml.mybluemix.net',
  username: 'xxx',
  password: 'xxx',
  instanceId: 'xxx',
  modelId: 'xxx',
  deploymentId: 'xxx'
});
```

## Setting up your Environment

### Local Environment

Create a `.env` file in the root of your project and add the following:

```
WML_SERVICE_PATH=https://ibm-watson-ml.mybluemix.net
WML_USERNAME=
WML_PASSWORD=
WML_INSTANCE_ID=
WML_MODEL_ID=
WML_DEPLOYMENT_ID=
```

2. Fill in username, password, and instance ID using the credentials in your IBM Watson Machine Learning service:
  - Go to the service in your IBM Cloud instance
  - Click _Service Credentials_
  - Expand your credentials

![Watson ML Service Credentials](https://raw.githubusercontent.com/ibm-watson-data-lab/watson-ml-scoring-util-nodejs/master/readme/img/watson-ml-credentials.png)

3. Fill in your Model ID and Deployment ID
  - Go to your model under the Assets in your Data Science Platform or Watson Data Platform account
  - Click the _Deployments_ tab
  - Click the deployment
  - Copy and paste the Deployment ID and Model ID values

![Watson ML Model Deployment](https://raw.githubusercontent.com/ibm-watson-data-lab/watson-ml-scoring-util-nodejs/master/readme/img/watson-ml-model-deployment.png)

### IBM Cloud Environment

1. Create or modify your `manifest.yml` file. Here is a sample:

```
applications:
- path: .
  buildpack: sdk-for-util-nodejs
  no-route: false
  memory: 128M
  instances: 1
  domain: mybluemix.net
  name: watson-ml-scoring-demo
  host: watson-ml-scoring-demo-${random-word}
disk_quota: 256M
services:
 - IBM Watson Machine Learning
env:
  WML_MODEL_ID: xxx
  WML_DEPLOYMENT_ID: xxx
```

2. Specify the name of your Watson Machine Learning Service
  - Replace `IBM Watson Machine Learning` under *services:* with the name of the Watson Machine Learning service provisioned in your account

3. Fill in your model ID and deployment ID
  - Go to your model under the Assets in your Data Science Platform or Watson Data Platform account
  - Click the _Deployments_ tab
  - Click the deployment
  - Copy and paste the Deployment ID and Model ID values to the environment variables under *env:*

  ![Watson ML Model Deployment](https://raw.githubusercontent.com/ibm-watson-data-lab/watson-ml-scoring-util-nodejs/master/readme/img/watson-ml-model-deployment.png)