const express = require('express');
const { listProvinces, getProvince, listDistrictsForProvince } = require('../controllers/provinceController');

const router = express.Router();

router.get('/', listProvinces);
router.get('/:id', getProvince);
router.get('/:id/districts', listDistrictsForProvince);

module.exports = router;