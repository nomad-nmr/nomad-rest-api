const express = require('express')
const auth = require('../middleware/auth')

const submitControllers = require('../controllers/submit')

const router = express.Router()

router.post('/holders', auth, submitControllers.postBookHolders)

router.delete('/holders', auth, submitControllers.deleteHolders)

router.delete('/holder/:key', auth, submitControllers.deleteHolder)

router.post('/experiments', auth, submitControllers.postSubmission)

router.delete('/experiments/:instrId', auth, submitControllers.deleteExps)

router.post('/pending/:type', auth, submitControllers.postPending)

router.post('/pending-auth/:type', submitControllers.postPending)

module.exports = router
