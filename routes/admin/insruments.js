const express = require('express')
const auth = require('../../middleware/auth')
const instrumentsController = require('../../controllers/admin/instruments')

const router = express.Router()

router.get('/', auth, instrumentsController.getInstruments)

router.post('/', auth, instrumentsController.addInstrument)

router.put('/', auth, instrumentsController.updateInstruments)

router.delete('/:id', auth, instrumentsController.deleteInstrument)

router.patch('/toggle-available/:id', auth, instrumentsController.toggleAvailable)

module.exports = router
