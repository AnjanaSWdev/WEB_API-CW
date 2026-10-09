const express = require('express');
const { listDistricts, getDistrict, listSubstationsForDistrict } = require('../controllers/districtController');
const requireAuth = require('../middleware/auth');
const {requireDistrictAccess} = require('../middleware/jurisdictionScope');


const router = express.Router();

/**
 * @swagger
 * /districts:
 *   get:
 *     summary: List all districts
 *     tags: [Districts]
 *     responses:
 *       200: { description: Array of districts }
 */
router.get('/', listDistricts);


/**
 * @swagger
 * /districts/{id}:
 *   get:
 *     summary: Get a single district (jurisdiction-scoped)
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: District object }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: District not found }
 */
router.get('/:id', requireAuth, requireDistrictAccess, getDistrict);


/**
 * @swagger
 * /districts/{id}/substations:
 *   get:
 *     summary: List grid substations belonging to a district (jurisdiction-scoped)
 *     tags: [Districts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of substations }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: District not found }
 */
router.get('/:id/substations', requireAuth, requireDistrictAccess, listSubstationsForDistrict);

module.exports = router;