const Instrument = require('../models/instrument')

exports.updateStatus = async (req, res) => {
	const newStatusSummary = {
		busyUntil: Object.values(req.body.data[0][2])[1],
		dayExpt: Object.values(req.body.data[0][1])[1],
		nightExpt: Object.values(req.body.data[0][3])[1]
	}
	try {
		const instrument = await Instrument.findByIdAndUpdate(req.body.instrumentId, {
			statusSummary: newStatusSummary
		})
		if (!instrument) {
			return res.status(404).send()
		}
		res.status(201).send()
	} catch (err) {
		console.log(err)
		res.status(500).send()
	}
}
