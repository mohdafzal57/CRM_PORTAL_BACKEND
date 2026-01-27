const { Router } = require('express');
const { healthcheck } = require('../controllers/healthcheckController');

const router = Router();

router.route('/').get(healthcheck);

module.exports = router;
