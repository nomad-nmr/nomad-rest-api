const Instrument = require('../../models/instrument')

exports.getInstruments = (req, res) => {
	Instrument.find()
		.then(instruments => {
			const tableData = Instrument.getTableData(instruments)
			res.send(tableData)
		})
		.catch(err => {
			res.status(500).send(err)
		})
}

exports.addInstrument = (req, res) => {
	const instrument = new Instrument(req.body)
	instrument
		.save()
		.then(() => {
			Instrument.find().then(instruments => {
				const tableData = Instrument.getTableData(instruments)
				res.send(tableData)
			})
		})
		.catch(err => {
			res.status(500).send(err)
		})
}

exports.updateInstruments = (req, res) => {
	Instrument.findByIdAndUpdate(req.body._id, req.body)
		.then(() => {
			Instrument.find().then(instruments => {
				const tableData = Instrument.getTableData(instruments)
				res.send(tableData)
			})
		})
		.catch(err => {
			res.status(500).send(err)
		})
}

exports.deleteInstrument = (req, res) => {
	console.log(req.params.id)
	Instrument.findByIdAndDelete(req.params.id)
		.then(() => {
			Instrument.find().then(instruments => {
				const tableData = Instrument.getTableData(instruments)
				res.send(tableData)
			})
		})
		.catch(err => {
			res.status(500).send(err)
		})
}

exports.toggleAvailable = (req, res) => {
	Instrument.findById(req.params.id)
		.then(instrument => {
			instrument.available = !instrument.available
			return instrument.save()
		})
		.then(data => {
			res.send({ _id: data._id, available: data.available })
		})
		.catch(err => res.status(500).send(err))
}
