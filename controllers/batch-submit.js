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

exports.addSample = async (req, res) => {
	const { rackId } = req.params

	try {
		const rack = await Rack.findById(rackId)
		if (!rack) {
			return res.status(404).send('Rack not found!')
		}
		const { samples } = rack
		samples.sort((a, b) => b.slot - a.slot)
		const newSlotStart = samples[0] ? samples[0].slot + 1 : 1
		const newSamples = []
		Object.values(req.body).forEach((sample, index) => {
			const slot = newSlotStart + index
			if (slot > rack.slotsNumber) {
				throw new Error('Rack is full!')
			}
			const newSample = {
				...sample,
				slot,
				user: { id: req.user._id, username: req.user.username, fullName: req.user.fullName },
				addedAt: new Date()
			}
			rack.samples.push(newSample)
			newSamples.push(newSample)
		})
		await rack.save()
		res.send({ rackId, data: newSamples })
	} catch (error) {
		if (error.message === 'Rack is full!') {
			res.status(406).send({ message: 'Rack is Full!', rackId })
		} else {
			console.log(error.message)
			res.status(500).send(error)
		}
	}
}

exports.deleteSample = async (req, res) => {
	const { rackId, slot } = req.params
	try {
		const rack = await Rack.findById(rackId).populate('group', 'groupName')
		if (!rack) {
			return res.status(404).send('Rack not found!')
		}
		const newSampleArr = rack.samples.filter(sample => sample.slot !== +slot)
		rack.samples = newSampleArr
		const newRack = await rack.save()
		res.send({rackId, slot})
	} catch (error) {
		console.log(error.message)
		res.status(500).send(error)
	}
}
