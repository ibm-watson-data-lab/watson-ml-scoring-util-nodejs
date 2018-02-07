"use strict";

let axios = require('axios');
let dotenv = require('dotenv');
dotenv.config();

let TOKEN_MAX_ATTEMPTS = 3;

class WatsonMLScoringEndpoint {

  constructor(fields, options) {
    if (! fields) {
      throw 'fields not specified.';
    }
    if (!options) {
      options = {};
    }
    // attempt to load Watson ML credentials from VCAP_SERVICES
    if (process.env.VCAP_SERVICES) {
      let vcapServices = JSON.parse(process.env.VCAP_SERVICES);
      if (vcapServices['pm-20'] && vcapServices['pm-20'].length > 0) {
        let service = vcapServices['pm-20'][0];
        if (service.credentials) {
          options['servicePath'] = service.url;
          options['username'] = service.username;
          options['password'] = service.password;
          options['instanceId'] = service.instance_id;
        }
      }
    }
    this.servicePath = this.getRequiredProperty(options, 'servicePath', 'WML_SERVICE_PATH', 'https://ibm-watson-ml.mybluemix.net');
    this.username = this.getRequiredProperty(options, 'username', 'WML_USERNAME');
    this.password = this.getRequiredProperty(options, 'password', 'WML_PASSWORD');
    this.instanceId = this.getRequiredProperty(options, 'instanceId', 'WML_INSTANCE_ID');
    this.modelId = this.getRequiredProperty(options, 'modelId', 'WML_MODEL_ID');
    this.deploymentId = this.getRequiredProperty(options, 'deploymentId', 'WML_DEPLOYMENT_ID');
    this.scoringUrl = `${this.servicePath}/v3/wml_instances/${this.instanceId}/published_models/${this.modelId}/deployments/${this.deploymentId}/online`
    this.fields = fields;
  }

  getRequiredProperty(options, optionsName, envName, defaultValue) {
    let prop = options[optionsName] || process.env[envName] || defaultValue;
    if (! prop) {
      throw `${optionsName} not specified.`;
    }
    return prop;
  }

  getWatsonMLAccessToken() {
    if (this.token) {
      return Promise.resolve(this.token);
    }
    else {
      return axios({
        method: 'GET',
        url: `${this.servicePath}/v3/identity/token`,
        headers: {
          'Authorization': 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64')
        }
      })
        .then((response) => {
          this.token = 'Bearer ' + response.data.token;
          return Promise.resolve(this.token);
        });
    }
  }

  score(values) {
    return this.scoreMulti([values])
      .then((response) => {
        return Promise.resolve({prediction: response.predictions[0], data: response.data})
      });
  }

  scoreMulti(valuesArray) {
    this.tokenFailures = 0;
    return this.scoreMultiInternal(valuesArray, 0);
  }

  scoreMultiInternal(valuesArray, attempt) {
    return this.getWatsonMLAccessToken()
      .then((token) => {
        return axios({
          method: 'POST',
          url: this.scoringUrl,
          data: {
            fields: this.fields,
            values: valuesArray
          },
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });
      }).then((response) => {
        let predictions = [];
        let predictionIndex = -1;
        let fields = response.data.fields;
        for (let i = 0; i < fields.length; i++) {
          if (fields[i].toLowerCase() === 'prediction') {
            predictionIndex = i;
            break;
          }
        }
        if (predictionIndex >= 0) {
          let values = response.data.values;
          for (let i = 0; i < valuesArray.length; i++) {
            predictions[i] = values[i][predictionIndex];
          }
          return Promise.resolve({predictions: predictions, data: response.data});
        }
      }).catch((err) => {
        let errorCode = null;
        if (err.response && err.response.data && err.response.data.code && err.response.data.code) {
          errorCode = err.response.data.code;
        }
        if (errorCode && errorCode.indexOf('token') >= 0) {
          if ((attempt+1) >= TOKEN_MAX_ATTEMPTS) {
            console.log('Too many token failures.');
            return Promise.reject(err);
          }
          else {
            console.log('Token failure; attempting to retrieve new token...');
            this.token = null;
            return this.scoreMultiInternal(valuesArray, attempt + 1);
          }
        }
        else {
          return Promise.reject(err);
        }
      });
  }
}

exports.WatsonMLScoringEndpoint = WatsonMLScoringEndpoint;