const axios = require('axios');
const logger = require('../config/logger');

const authClient = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001/api/auth',
  timeout: 5000,
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error(`Erro de comunicação com Auth Service: ${error.message}`);
    if (!error.response) {
      const err = new Error('Serviço de autenticação está temporariamente indisponível.');
      err.status = 503;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

const academicClient = axios.create({
  baseURL: process.env.ACADEMIC_SERVICE_URL || 'http://localhost:3002/api/academic',
  timeout: 5000,
});

academicClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error(`Erro de comunicação com Academic Service: ${error.message}`);
    if (!error.response) {
      const err = new Error('Serviço acadêmico está temporariamente indisponível.');
      err.status = 503;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

const getAuthHeaders = (req) => {
  return {
    Authorization: req.headers.authorization,
  };
};

module.exports = { authClient, academicClient, getAuthHeaders };
