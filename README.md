### NOTE: IN ACTIVE DEVELOPMENT

# Watson Machine Learning Scoring

## Overview

This is a simple Node.js library for calling scoring endpoints on deployed models in the Watson Machine Learning service.

## Installing

`npm install --save watson-ml-scoring`

## Running

After setting up your environment (see below) making predictions requires just a few lines of code:

```
let WatsonMLScoring = require("watson-ml-scoring");
let endpoint = new WatsonMLScoring(features);
let features = ['SquareFeet', 'Bedrooms'];
let values = [2400, 4];
endpoint.score(values)
    .then(predictions => console.log(predictions))
    .catch(err => console.log(err));
```

Alternatively, you can pass in the model and deployment IDs. This would be valuable if you plan on testing or working with multiple versions of the same model.

```
let endpoint = new WatsonMLScoring(features, {
  modelId: 'xxx',
  deploymentId: 'xxx'
});
```

Finally, you can pass in everything, including the Watson ML service credentials (or you can selectively choose what features you want to pass in — all others will be read from the environment):

```
let endpoint = new WatsonMLScoring(features, {
  servicePath: 'https://ibm-watson-ml.mybluemix.net',
  username: 'xxx',
  password: 'xxx',
  instanceId: 'xxx',
  modelId: 'xxx',
  deploymentId: 'xxx'
});
```

## Running Locally

Create or modify your `.env` file to include the following:

```
WML_SERVICE_PATH=https://ibm-watson-ml.mybluemix.net
WML_USERNAME=
WML_PASSWORD=
WML_INSTANCE_ID=
WML_MODEL_ID=
WML_DEPLOYMENT_ID=
```

2. Fill in username, password, and instance ID using the credentials in your IBM Watson Machine Learning service
  - Go to the service in your IBM Cloud instance
  - Click _Service Credentials_
  - Expand your credentials

3. Fill in your model ID and deployment ID
  - Go to your model under the Assets in your Data Science Platform or Watson Data Platform account
  - Click the _Deployments_ tab
  - Click the deployment
  - Copy and paste the Deployment ID and Model ID values


## Running in IBM Cloud

1. Create a `manifest.yml` file similar to the following:

```
applications:
- path: .
  buildpack: sdk-for-nodejs
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