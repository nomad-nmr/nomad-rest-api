const Instrument = require('../models/instrument')
const io = require('../socket')

//new keys for status and history data objects
const statusKeysArr = ['holder', 'status', 'datasetName', 'expNo', 'experiment', 'group', 'time', 'title']
const historyKeysArr = [
	'time',
	'datasetName',
	'expNo',
	'experiment',
	'group',
	'load',
	'atma',
	'spin',
	'lock',
	'shim',
	'proc',
	'acq',
	'title',
	'remarks',
	'holder'
]

//Helper function for sanitation of status and history raw table data array
const addNewKeys = (rawDataArr, keys) => {
	//removing first object containing old keys
	rawDataArr.splice(0, 1)

	const newTableData = []
	//Creating new object for each row using the array of new keys
	rawDataArr.forEach(row => {
		const values = Object.values(row)
		let newRowObj = keys.reduce((o, key, index) => ({ ...o, [key]: values[index] }), {})

		// Extracting username from dataset name
		// TODO: username could be extracted from title (originator item in IconNMR). Allow to change through instrument settings
		newRowObj = { ...newRowObj, username: newRowObj.datasetName.split('-')[3] }

		newTableData.push(newRowObj)
	})

	return newTableData
}

exports.updateStatus = async (req, res) => {
	try {
		const instrument = await Instrument.findById(req.body.instrumentId)

		if (!instrument) {
			return res.status(404).send('Instrument not found')
		}

		const newStatusTabData = addNewKeys(req.body.data[1], statusKeysArr)
		const newHistoryTabData = addNewKeys(req.body.data[2], historyKeysArr)

		//checking whether there is a running experiment
		const running = newStatusTabData.find(entry => entry.status === 'Running') ? true : false

		//Calculation of available holders
		const usedHolders = new Set()
		newStatusTabData.forEach(entry => usedHolders.add(entry.holder))
		availableHolders = instrument.capacity - usedHolders.size

		// Calculating number of errors and
		const errorCount = newStatusTabData.filter(entry => entry.status === 'Error').length
		const pendingCount = newStatusTabData.filter(entry => entry.status === 'Available').length

		const newStatusSummary = {
			...instrument.status.summary,
			busyUntil: Object.values(req.body.data[0][2])[1],
			dayExpt: Object.values(req.body.data[0][1])[1],
			nightExpt: Object.values(req.body.data[0][3])[1],
			running,
			availableHolders,
			errorCount,
			pendingCount
		}

		instrument.status = {
			summary: newStatusSummary,
			statusTable: newStatusTabData,
			historyTable: newHistoryTabData
		}

		const instr = await instrument.save()
		io.getIO().emit('statusUpdate', { instrId: instr._id, statusSummary: instr.status.summary })

		res.status(201).send()
	} catch (err) {
		console.log(err)
		res.status(500).send()
	}
}
