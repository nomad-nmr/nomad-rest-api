const express = require('express')
const trackerControllers = require('../controllers/tracker')
const Instrument = require('../models/instrument')

const router = express.Router()

router.get('/ping/:instrumentId', async (req, res) => {
	try {
		const { name } = await Instrument.findById(req.params.instrumentId, 'name')
		res.status(200).send({ name })
	} catch (error) {
		res.status(500).send(error)
	}
})

router.patch('/status', trackerControllers.updateStatus)

module.exports = router
