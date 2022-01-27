const express = require('express')

const clientAuth = require('../middleware/auth-client')
const multerUpload = require('../middleware/multerUpload')
const dataControllers = require('../controllers/data')

const router = express.Router()

router.post('/auto/:instrumentId', clientAuth, multerUpload, dataControllers.postData)

module.exports = router
