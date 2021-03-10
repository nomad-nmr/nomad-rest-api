const io = require('../socket')
const bcrypt = require('bcryptjs')

const Instrument = require('../models/instrument')
const Group = require('../models/group')
const User = require('../models/user')
const Experiment = require('../models/experiment')

const runningExperiments = require('../utils/runningExperiments')

//new keys for status and history data objects
const statusKeysArr = ['holder', 'status', 'datasetName', 'expNo', 'parameterSet', 'group', 'time', 'title']
const historyKeysArr = [
	'time',
	'datasetName',
	'expNo',
	'parameterSet',
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

exports.ping = async (req, res) => {
	try {
		const { name } = await Instrument.findById(req.params.instrumentId, 'name')
		res.status(200).send({ name })
	} catch (error) {
		res.status(500).send(error)
	}
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

		//getting runningExpState from DB if undefined
		if (!runningExperiments.state) {
			await runningExperiments.getState()
		}

		let histItem = runningExperiments.update(req.body.instrumentId, newStatusTabData)

		if (histItem) {
			const rawHistItemObj = newHistoryTabData.find(
				entry => entry.datasetName === histItem.datasetName && entry.expNo === histItem.expNo
			)
			const statusEntry = newStatusTabData.find(
				entry => entry.datasetName === histItem.datasetName && entry.expNo === histItem.expNo
			)

			const status = statusEntry.status || 'Unknown'
			const expTime = statusEntry.time || 'Unknown'

			// //Disabling the
			// if(status === 'Error'){
			// 	errorCount++
			// } else {
			// 	errorCount = 0
			// }

			// if (errorCount === 3) {
			// 	instrument.available === false
			// }

			//AutoFeed for user and group
			let group = await Group.findOne({ groupName: rawHistItemObj.group })
			if (!group) {
				const newGroup = new Group({ groupName: rawHistItemObj.group })
				group = await newGroup.save()
				console.log(`New group ${group.groupName} was created`)
			}
			let user = await User.findOne({ username: rawHistItemObj.username })
			if (!user) {
				const password = await bcrypt.hash(Math.random().toString(), 12)
				const newUser = new User({
					username: rawHistItemObj.username,
					group: group._id,
					email: rawHistItemObj.username + '@' + process.env.EMAIL_SUFFIX,
					password
				})
				user = await newUser.save()
				console.log(`New user ${user.username} at group ${group.groupName} was created`)
			}

			histItem = {
				...rawHistItemObj,
				status,
				expTime,
				finishedAt: new Date(),
				instrument: { name: instrument.name, id: instrument._id },
				group: { name: group.groupName, id: group._id },
				user: { username: user.username, id: user._id }
			}
			const experiment = new Experiment(histItem)
			await experiment.save()
		}

		//Changing busyUntil to idle if there is no running experiment in the queue
		if (!newStatusSummary.running) {
			newStatusSummary.busyUntil = 'Idle'
		}

		//the following block update remarks to the experiment if they appear in history table in later update of the status file
		if (newHistoryTabData[0].remarks) {
			await Experiment.findOneAndUpdate(
				{ datasetName: newHistoryTabData[0].datasetName },
				{ remarks: newHistoryTabData[0].remarks }
			)
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
