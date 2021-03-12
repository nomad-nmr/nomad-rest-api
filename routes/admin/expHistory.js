const express = require('express')
const historyControllers = require('../../controllers/admin/expHistory')

const router = express.Router()

router.get('/:instrId/:date', historyControllers.getHistory)

module.exports = router
