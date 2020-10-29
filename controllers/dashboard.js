const Instrument = require('../models/instrument')

exports.getStatusSummary = async (req, res) => {
	try {
		const data = await Instrument.find({}, '-status.statusTable -status.historyTable')
		if (!data) {
			return res.status(404).send()
		}
		res.send(data)
	} catch (error) {
		res.status(500).send(error)
	}
}

exports.getStatusTable = async (req, res) => {
	try {
		const data = await Instrument.find({}, 'status.statusTable')
		if (!data) {
			return res.status(404).send()
		}
		const filteredData = data[req.params.key].status.statusTable.filter(
			entry => entry.status !== 'Available'
		)
		res.send(filteredData)
	} catch (error) {
		res.status(500).send(error)
	}
}
