const express = require('express')

const instrumentsController = require('../../controllers/admin/instruments')

const router = express.Router()

router.get('/', instrumentsController.getInstruments)

router.post('/', instrumentsController.addInstrument)

router.put('/', instrumentsController.updateInstruments)

router.delete('/:id', instrumentsController.deleteInstrument)

router.patch('/toggle-available/:id', instrumentsController.toggleAvailable)

module.exports = router
