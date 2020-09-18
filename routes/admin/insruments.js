const express = require('express')

const instrumentsController = require('../../controllers/admin/instruments')

const router = express.Router()

router.post('/update-instruments', instrumentsController.postUpdateInstruments)

router.get('/get-instruments', instrumentsController.getInstruments)

router.post('/delete-instrument', instrumentsController.postDeleteInstrument)

router.post('/toggle-running', instrumentsController.postToggleRunning)

module.exports = router
