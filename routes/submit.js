const express = require('express')
const auth = require('../middleware/auth')

const submitControllers = require('../controllers/submit')

const router = express.Router()

router.post('/book', auth, submitControllers.postSubmission)

router.post('/book-holders', auth, submitControllers.postBook)

router.delete('/book-holders', auth, submitControllers.deleteBooked)

router.delete('/cancel-holder/:key', auth, submitControllers.cancelBooked)

module.exports = router
