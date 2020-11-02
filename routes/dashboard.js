const express = require('express')
const dashControllers = require('../controllers/dashboard')
const Instrument = require('../models/instrument')

const router = express.Router()

router.get('/status-summary', dashControllers.getStatusSummary)

router.get('/status-table/:key', dashControllers.getStatusTable)

router.get('/drawer-table/:id', dashControllers.getDrawerTable)

module.exports = router
