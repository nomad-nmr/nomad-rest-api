const Instrument = require('../models/instrument')
const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')

exports.getStatusSummary = async (req, res) => {
	try {
		const data = await Instrument.find({ isActive: true }, '-status.statusTable -status.historyTable')
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
		let data = null
		//instrId is unknown and set to 0 when  the dashboard reloads
		if (req.params.instrId !== '0') {
			data = await Instrument.findById(req.params.instrId, 'status.statusTable')
		} else {
			const instrArr = await Instrument.find({ isActive: 'true' }, 'status.statusTable')
			data = instrArr[0]
		}
		if (!data) {
			return res.status(404).send()
		}

		//Filtering off entries in the table with 'Available'(Pending) status
		const filteredData = data.status.statusTable.filter(entry => entry.status !== 'Available')

		//Creating data structure for nested expandable tables
		const tableData = []
		let newRow = { exps: [] }
		filteredData.forEach((row, index) => {
			const prevRow = filteredData[index - 1]
			const nextRow = filteredData[index + 1]

			let newExp = {
				key: row.expNo,
				expNo: row.expNo,
				parameterSet: row.parameterSet,
				title: row.title,
				expT: row.time,
				status: row.status
			}

			if (index === 0 || prevRow.datasetName !== row.datasetName) {
				newRow = { exps: [] }
				newRow.key = row.holder
				newRow.holder = row.holder
				newRow.username = row.username
				newRow.group = row.group
				newRow.datasetName = row.datasetName
				newRow.time = row.time
				newRow.status = row.status
				newRow.exps = []
			} else {
				newRow.time = moment
					.duration(newRow.time)
					.add(moment.duration(row.time))
					.format('HH:mm:ss', { trim: false })

				if (row.status === 'Error') {
					newRow.status = 'Error'
				} else if (row.status === 'Running' || row.status === 'Submitted') {
					newRow.status = row.status
				}
			}
			newRow.exps.push(newExp)
			if (!nextRow || nextRow.datasetName !== row.datasetName) {
				tableData.push(newRow)
			}
		})

		res.send(tableData)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.getDrawerTable = async (req, res) => {
	try {
		const data = await Instrument.find({}, 'available name status.statusTable status.historyTable')
		if (!data) {
			return res.status(404).send()
		}

		let respArray = []
		// pending experiments have status "available" in and errors "error" in the source data table
		const statusId =
			req.params.id === 'pending' ? 'available' : req.params.id === 'errors' ? 'error' : req.params.id

		data.forEach(i => {
			let filteredArray = []
			//getting only "pending" entries for available instruments
			if (statusId !== 'available' || (statusId === 'available' && i.available)) {
				filteredArray = i.status.statusTable
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
			}

			respArray = respArray.concat(filteredArray)
		})

		res.send(respArray)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
