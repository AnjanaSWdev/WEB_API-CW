const express = require('express');
const { listDistricts, getDistrict, listSubstationsForDistrict } = require('../controllers/districtController');
const requireAuth = require('../middleware/auth');
const {requireDistrictAccess} = require('../middleware/jurisdictionScope');


const router = express.Router();

router.get('/', listDistricts);
router.get('/:id', requireAuth, requireDistrictAccess, getDistrict);
router.get('/:id/substations', requireAuth, requireDistrictAccess, listSubstationsForDistrict);

module.exports = router;
