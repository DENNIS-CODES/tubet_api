var auth = require('../routes/auth.js');
module.exports = function(req, res, next) {
  auth.authenticate(req, res, null, next);
};
