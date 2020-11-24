const express = require('express')
const authControllers = require('../controllers/auth')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/login', authControllers.postLogin)

router.post('/logout', auth, authControllers.postLogout)

module.exports = router
