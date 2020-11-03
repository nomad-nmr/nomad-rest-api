const Instrument = require('../../models/instrument')

exports.getInstruments = async (req, res) => {
	try {
		const tableData = await Instrument.find({}, '-status')
		res.send(tableData)
	} catch (err) {
		res.status(500).send(err)
	}
}

exports.addInstrument = async (req, res) => {
	const instrument = new Instrument(req.body)
	try {
		await instrument.save()
		const tableData = await Instrument.find({}, '-status')
		res.send(tableData)
	} catch (err) {
		res.status(500).send(err)
	}
}

exports.updateInstruments = async (req, res) => {
	try {
		const instrument = await Instrument.findByIdAndUpdate(req.body._id, req.body)
		if (!instrument) {
			return res.status(404).send()
		}
		const tableData = await Instrument.find({}, '-status')
		res.send(tableData)
	} catch (err) {
		res.status(500).send(err)
	}
}

exports.deleteInstrument = async (req, res) => {
	try {
		const instrument = await Instrument.findByIdAndDelete(req.params.id)
		if (!instrument) {
			return res.status(404).send()
		}
		const tableData = await Instrument.find({}, '-status')
		res.send(tableData)
	} catch (err) {
		res.status(500).send(err)
	}
}

exports.toggleAvailable = async (req, res) => {
	try {
		const instrument = await Instrument.findById(req.params.id)
		if (!instrument) {
			return res.status(404).send()
		}
		instrument.available = !instrument.available
		const updatedInstrument = await instrument.save()
		res.send({ _id: updatedInstrument._id, available: updatedInstrument.available })
	} catch (err) {
		res.status(500).send(err)
	}
}
