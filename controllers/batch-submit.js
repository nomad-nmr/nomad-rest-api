const { validationResult } = require('express-validator')

const Rack = require('../models/rack')

exports.getRacks = async (req, res) => {
	try {
		const racks = await Rack.find({}).populate('group', 'groupName').sort({ isOpen: 'desc' })
		res.send(racks)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.postRack = async (req, res) => {
	const errors = validationResult(req)

	try {
		if (!errors.isEmpty()) {
			return res.status(422).send(errors)
		}
		const newRack = new Rack({ ...req.body, title: req.body.title.toUpperCase() })
		await newRack.save()
		res.send(newRack)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.closeRack = async (req, res) => {
	const { rackId } = req.params
	try {
		const rack = await Rack.findByIdAndUpdate(rackId, { isOpen: false })
		if (!rack) {
			return res.status(404).send('Rack not found!')
		}
		res.send(rack._id)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.deleteRack = async (req, res) => {
	const { rackId } = req.params
	try {
		const rack = await Rack.findByIdAndDelete(rackId)
		if (!rack) {
			return res.status(404).send('Rack not found!')
		}
		res.send(rack._id)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
