const express = require('express')
const historyControllers = require('../../controllers/admin/history')

const router = express.Router()

router.get('/:instrId/:date', historyControllers.getHistory)

module.exports = router
