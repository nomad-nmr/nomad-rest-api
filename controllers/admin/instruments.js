const Instrument = require('../../models/instrument')

exports.postUpdateInstruments = (req, res) => {
	const { key, name, model, probe, capacity, running } = req.body
	const instrument = new Instrument(key, name, model, probe, capacity, running)

	instrument.save((instruments) => {
		res.send(instruments)
	})
}

exports.getInstruments = (req, res) => {
	Instrument.fetchAll((instruments) => {
		res.send(instruments)
	})
}

exports.postDeleteInstrument = (req, res) => {
	Instrument.deleteInstrument(req.body.id, (updatedInstruments) => {
		res.send(updatedInstruments)
	})
}

exports.postToggleRunning = (req, res) => {
	Instrument.findById(req.body.id, (instrument) => {
		const { key, name, model, probe, capacity, running } = instrument
		const updatedInstrument = new Instrument(key, name, model, probe, capacity, !running)
		updatedInstrument.save((instruments) => {
			res.send(instruments)
		})
	})
}
