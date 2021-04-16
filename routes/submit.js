const express = require('express')

const submitControllers = require('../controllers/submit')

const router = express.Router()

router.post('/', submitControllers.postSubmission)

router.post('/book-holders', submitControllers.postBook)

router.delete('/book-holders', submitControllers.deleteBooked)

module.exports = router
