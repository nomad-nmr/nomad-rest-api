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

exports.getDrawerTable = async (req, res) => {
	try {
		const data = await Instrument.find({}, 'name status.statusTable status.historyTable')
		if (!data) {
			return res.status(404).send()
		}

		let respArray = []
		const statusId =
			req.params.id === 'pending' ? 'available' : req.params.id === 'errors' ? 'error' : req.params.id

		data.forEach(i => {
			const filteredArray = i.status.statusTable
				.filter(row => row.status.toLowerCase() === statusId.toLowerCase())
				.map(row => {
					const histObject = i.status.historyTable.find(
						i => row.datasetName === i.datasetName && row.expNo === i.expNo
					)
					if (histObject) {
						return { ...row, instrument: i.name, description: histObject.remarks }
					} else {
						return { ...row, instrument: i.name }
					}
				})
			respArray = respArray.concat(filteredArray)
		})

		res.send(respArray)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
