const Instrument = require('../../models/instrument')

exports.postAddInstrument = (req, res) => {
	const { name, model, probe, capacity } = req.body
	const instrument = new Instrument(name, model, probe, capacity)

	instrument.save((instruments) => {
		res.send(instruments)
	})
}

exports.getInstruments = (req, res) => {
	Instrument.fetchAll((instruments) => {
		res.send(instruments)
	})
}
