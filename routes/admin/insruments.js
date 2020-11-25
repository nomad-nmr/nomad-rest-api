const express = require('express')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const instrumentsController = require('../../controllers/admin/instruments')

const router = express.Router()

router.get('/', auth, authAdmin, instrumentsController.getInstruments)

router.post('/', auth, instrumentsController.addInstrument)

router.put('/', auth, instrumentsController.updateInstruments)

router.delete('/:id', auth, instrumentsController.deleteInstrument)

router.patch('/toggle-available/:id', auth, instrumentsController.toggleAvailable)

module.exports = router
