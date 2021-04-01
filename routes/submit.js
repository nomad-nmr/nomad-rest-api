const express = require('express')

const submitControllers = require('../controllers/submit')

const router = express.Router()

router.post('/', submitControllers.postSubmit)

module.exports = router
