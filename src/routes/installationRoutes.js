const express = require('express');
const { listInstallations, getInstallation, getLatestReading } = require('../controllers/installationController');
const { listDailyEnergy, getDailyEnergyForDate } = require('../controllers/dailyEnergyController');
const { listReadings, createReading } = require('../controllers/readingController');
const requireDeviceAuth = require('../middleware/deviceAuth');
const requireAuth = require('../middleware/auth');
const { requireInstallationAccess } = require('../middleware/jurisdictionScope');

const router = express.Router();

router.get('/', listInstallations);
router.get('/:id',requireAuth, requireInstallationAccess, getInstallation);
router.get('/:id/latest-reading',requireAuth, requireInstallationAccess, getLatestReading);

router.get('/:id/daily-energy', requireAuth, requireInstallationAccess, listDailyEnergy);
router.get('/:id/daily-energy/:date', requireAuth, requireInstallationAccess, getDailyEnergyForDate);

router.get('/:id/readings', requireAuth, requireInstallationAccess, listReadings);

router.post('/:id/readings', requireDeviceAuth, createReading)


module.exports = router;

