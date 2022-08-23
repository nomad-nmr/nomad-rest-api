const express = require('express')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')
const accountsControllers = require('../../controllers/admin/accounts')

const router = express.Router()

router.get('/costs', auth, authAdmin, accountsControllers.getCosts)

module.exports = router
