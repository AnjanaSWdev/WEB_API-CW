const express = require('express');
const { getSubstation, listInstallationsForSubstation } = require('../controllers/substationController');
const requireAuth = require('../middleware/auth');
const { requireSubstationAccess } = require('../middleware/jurisdictionScope');

const router = express.Router();


router.get('/:id', requireAuth, requireSubstationAccess, getSubstation);

/**
 * @swagger
 * /substations/{id}/installations:
 *   get:
 *     summary: List solar installations belonging to a substation (jurisdiction-scoped)
 *     tags: [Substations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of installations }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: Substation not found }
 */
router.get('/:id/installations', requireAuth, requireSubstationAccess, listInstallationsForSubstation);

module.exports = router;


