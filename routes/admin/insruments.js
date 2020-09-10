const express = require('express')

const instrumentsController = require('../../controllers/admin/instruments')

const router = express.Router()

router.post('/add-instrument', instrumentsController.postAddInstrument)

router.get('/get-instruments', instrumentsController.getInstruments)

module.exports = router
