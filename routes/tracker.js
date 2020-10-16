const express = require('express')
const trackerControllers = require('../controllers/tracker')

const router = express.Router()

router.get('/ping', (req, res) => {
	res.status(200).send()
})

router.patch('/status', trackerControllers.updateStatus)

module.exports = router
