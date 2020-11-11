const axios = require('axios');
const request = require('request');

const config = require('../config');
const NetworkError = require('../errors/NetworkError');

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Cookie:
    'ReqClientId=749557db-8d13-4daa-aafb-40af8f31c8ce; orgId=033bad75-c63e-48dc-a282-a4dc3b14c05e',
};

let ACCESS_TOKEN = '';

//#region axios interceptor

const instance = axios.create({
  baseURL: config.baseUrl,
});

instance.interceptors.request.use(
  (config) => {
    config.headers = {
      ...DEFAULT_HEADERS,
      ...config.headers,
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    };

    return config;
  },
  function (error) {
    if (error.response) {
      return Promise.reject(error);
    } else {
      return Promise.reject(
        new NetworkError({
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        })
      );
    }
  }
);

//#endregion

//#region Set token
/**
 * Fetch access token and set it in a variable.
 */
function fetchAccessToken() {
  const options = {
    method: 'POST',
    url: config.authenticationUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Keep-Alive': 'true',
      Cookie:
        'fpc=ArKu6-Rb2XZKmTqf7DHLZMyysD6fAQAAAG_L09YOAAAA; x-ms-gateway-slice=prod; stsservicecookie=ests',
    },
    formData: {
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      resource: config.powerAppsEnvURL,
    },
  };

  request(options, function (error, response) {
    if (error) throw new Error(error); // TODO: Need to fix

    const tokentObj = JSON.parse(response.body);
    const { access_token, expires_in } = tokentObj;

    ACCESS_TOKEN = access_token;

    const nextFetchTime = (expires_in - 600) * 1000; //  10 min before expiration.
    setTimeout(() => {
      fetchAccessToken();
    }, nextFetchTime);
  });
}

fetchAccessToken();

//#endregion

//#region  Request methods

/**
 * Set a get request to a url
 *
 * @param {string} url
 * @param {object} header: Header
 */
function get(url, headers = DEFAULT_HEADERS) {
  return instance.get(url, { headers });
}

/**
 * Post request
 *
 * @param {string} url : Url
 * @param {*} param1
 */
function post(url, { headers, data }) {
  headers = headers
    ? headers
    : {
        'Content-Type': ' application/json',
        'OData-MaxVersion': ' 4.0',
        'OData-Version': ' 4.0',
        Prefer: ' return=representation',
      };

  return instance.post(url, data, { headers });
}

/**
 * Patch request
 *
 * @param {string} url : Url
 * @param {*} param1
 */
function patch(url, { headers, data }) {
  headers = headers
    ? headers
    : {
        'Content-Type': ' application/json',
        'OData-MaxVersion': ' 4.0',
        'OData-Version': ' 4.0',
        Prefer: ' return=representation',
      };

  return instance.patch(url, data, { headers });
}

//#endregion

module.exports = {
  get,
  post,
  patch,
};
