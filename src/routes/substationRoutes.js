const express = require('express');
const { getSubstation, listInstallationsForSubstation } = require('../controllers/substationController');
const requireAuth = require('../middleware/auth');
const { requireSubstationAccess } = require('../middleware/jurisdictionScope');

const router = express.Router();

router.get('/:id', requireAuth, requireSubstationAccess, getSubstation);
router.get('/:id/installations', requireAuth, requireSubstationAccess, listInstallationsForSubstation);

module.exports = router;


