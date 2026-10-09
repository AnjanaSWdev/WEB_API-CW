const express = require('express');
const { listInstallations, getInstallation, getLatestReading } = require('../controllers/installationController');
const { listDailyEnergy, getDailyEnergyForDate } = require('../controllers/dailyEnergyController');
const { listReadings, createReading } = require('../controllers/readingController');
const requireDeviceAuth = require('../middleware/deviceAuth');
const requireAuth = require('../middleware/auth');
const { requireInstallationAccess } = require('../middleware/jurisdictionScope');

const router = express.Router();

router.get('/', listInstallations);

/**
 * @swagger
 * /installations/{id}:
 *   get:
 *     summary: Get a single installation with nested substation/district/province and latest reading (jurisdiction-scoped)
 *     tags: [Installations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Composite installation object }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: Installation not found }
 */
router.get('/:id',requireAuth, requireInstallationAccess, getInstallation);


router.get('/:id/latest-reading',requireAuth, requireInstallationAccess, getLatestReading);


/**
 * @swagger
 * /installations/{id}/daily-energy:
 *   get:
 *     summary: Paginated daily energy totals for an installation (derived, computed on demand)
 *     tags: [Daily Energy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200: { description: Paginated array of daily totals }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: Installation not found }
 */
router.get('/:id/daily-energy', requireAuth, requireInstallationAccess, listDailyEnergy);


/**
 * @swagger
 * /installations/{id}/daily-energy/{date}:
 *   get:
 *     summary: Single day's energy total for an installation (derived, computed on demand)
 *     tags: [Daily Energy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *         description: YYYY-MM-DD
 *     responses:
 *       200: { description: Daily energy summary }
 *       400: { description: Invalid date format }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: Installation not found, or no readings for that date }
 */
router.get('/:id/daily-energy/:date', requireAuth, requireInstallationAccess, getDailyEnergyForDate);


/**
 * @swagger
 * /installations/{id}/readings:
 *   get:
 *     summary: Paginated reading history for an installation
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [timestamp] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated array of readings }
 *       401: { description: No valid credential }
 *       403: { description: Outside caller's jurisdiction }
 *       404: { description: Installation not found }
 *   post:
 *     summary: Submit a new generation reading (device write)
 *     tags: [Readings]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timestamp: { type: string, format: date-time }
 *               powerKw: { type: number }
 *               energyKwh: { type: number }
 *               voltage: { type: number }
 *     responses:
 *       201: { description: Reading created, Location header set }
 *       401: { description: Missing or invalid x-api-key }
 *       403: { description: API key does not match this installation }
 *       404: { description: Installation not found }
 */
router.get('/:id/readings', requireAuth, requireInstallationAccess, listReadings);
router.post('/:id/readings', requireDeviceAuth, createReading)



module.exports = router;