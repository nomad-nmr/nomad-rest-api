const express = require('express')
const { body } = require('express-validator')

const auth = require('../middleware/auth')
const authAdmin = require('../middleware/auth-admin')
const Rack = require('../models/rack')

const batchSubmitControllers = require('../controllers/batch-submit')

const router = express.Router()

router.get('/racks', batchSubmitControllers.getRacks)

router.post(
	'/racks',
	[
		body('title', 'Rack title is invalid')
			.trim()
			.isString()
			.isLength({ min: 3 })
			.withMessage('Rack title minimum length is 3')
			.custom(value => {
				return Rack.findOne({ title: value.toUpperCase() }).then(rack => {
					if (rack) {
						return Promise.reject(`Error: Rack title ${value} already exists`)
					}
				})
			}),
		body('slotsNumber').isInt().withMessage('Number of slots must be integer')
	],
	auth,
	authAdmin,
	batchSubmitControllers.postRack
)

router.patch('/racks/:rackId', auth, authAdmin, batchSubmitControllers.closeRack)

router.delete('/racks/:rackId', auth, authAdmin, batchSubmitControllers.deleteRack)

router.post('/add/:rackId', auth, batchSubmitControllers.addSample)

module.exports = router
