const express = require('express');
const { listProvinces, getProvince, listDistrictsForProvince } = require('../controllers/provinceController');

const router = express.Router();


/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: List all provinces
 *     tags: [Provinces]
 *     responses:
 *       200:
 *         description: Array of provinces
 */
router.get('/', listProvinces);


/**
 * @swagger
 * /provinces/{id}:
 *   get:
 *     summary: Get a single province
 *     tags: [Provinces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Province object }
 *       404: { description: Province not found }
 */
router.get('/:id', getProvince);


/**
 * @swagger
 * /provinces/{id}/districts:
 *   get:
 *     summary: List districts belonging to a province
 *     tags: [Provinces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of districts }
 *       404: { description: Province not found }
 */
router.get('/:id/districts', listDistrictsForProvince);


module.exports = router;