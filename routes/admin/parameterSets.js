const e = require('express')
const express = require('express')

const paramSetsController = require('../../controllers/admin/parameterSets')
const auth = require('../../middleware/auth')
const authAdmin = require('../../middleware/auth-admin')

const router = express.Router()

router.get('/', auth, authAdmin, paramSetsController.getParamSets)

router.post('/', auth, authAdmin, paramSetsController.postParamSet)

module.exports = router
