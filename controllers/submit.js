const moment = require('moment')

const io = require('../socket')
const app = require('../app')
const Instrument = require('../models/instrument')
const Group = require('../models/group')
const ParameterSet = require('../models/parameterSet')

exports.postSubmission = async (req, res) => {
	const group = await Group.findById(req.user.group, 'groupName')
	const instrIds = await Instrument.find({}, '_id')
	const { username } = req.user

	const submitData = {}
	for (let sampleKey in req.body) {
		const instrId = sampleKey.split('-')[0]
		const instrIndex = instrIds.map(i => i._id).findIndex(id => id.toString() === instrId)
		if (instrIndex === -1) {
			return res.status(500).send()
		}

		const holder = req.body[sampleKey].holder

		const experiments = []
		for (let expNo in req.body[sampleKey].exps) {
			const paramSet = req.body[sampleKey].exps[expNo].paramSet
			const paramSetName = await ParameterSet.findOne({ name: paramSet }, 'description')
			experiments.push({
				expNo,
				paramSet,
				expTitle: paramSetName.description,
				params: req.body[sampleKey].exps[expNo].params
			})
		}
		const { night, solvent, title } = req.body[sampleKey]
		const sampleData = {
			userId: req.user._id,
			group: group.groupName,
			holder,
			sampleId: moment().format('YYMMDDhhmm') + '-' + instrIndex + '-' + holder + '-' + username,
			solvent,
			night,
			title,
			experiments
		}

		if (submitData[instrId]) {
			submitData[instrId].push(sampleData)
		} else {
			submitData[instrId] = [sampleData]
		}
	}

	for (let instrumentId in submitData) {
		//Getting socketId from submitter state
		const submitter = app.getSubmitter()
		const { socketId } = submitter.state.get(instrumentId)

		if (!socketId) {
			console.log('Error: Client disconnected')
			return res.status(503).send({ error: 'Client disconnected' })
		}

		io.getIO().to(socketId).emit('book', JSON.stringify(submitData[instrumentId]))

		// const holders = submitData[instrumentId].map(entry => +entry.holder)

		// //Keeping holders booked for 2 mins to allow them to get registered in usedHolders from status table
		// setTimeout(() => {
		// 	submitter.cancelBookedHolders(instrumentId, holders)
		// }, 120000)
	}

	res.send()
}

exports.postBook = async (req, res) => {
	const { instrumentId, count } = req.body
	const submitter = app.getSubmitter()
	const { usedHolders, bookedHolders } = submitter.state.get(instrumentId)

	if (!usedHolders || !bookedHolders) {
		console.log('Submitter error')
		return res.status(500).send()
	}
	//adding bookedHolders to usedHolders
	const currentUsedHolders = new Set([...usedHolders, ...bookedHolders])
	const { capacity, name } = await Instrument.findById(instrumentId, 'capacity name')

	const availableHolders = findAvailableHolders(currentUsedHolders, capacity, count)

	submitter.updateBookedHolders(instrumentId, availableHolders)

	res.send({ instrumentId, instrumentName: name, holders: availableHolders })
}

//Helper function that returns array of array of available holders
const findAvailableHolders = (usedHolders, capacity, count) => {
	const holders = []
	for (let i = 1; i <= capacity; i++) {
		if (!usedHolders.has(i)) {
			holders.push(i)
		}
		if (holders.length === +count) {
			return holders
		}
	}
}

exports.deleteBooked = (req, res) => {
	const submitter = app.getSubmitter()

	//Keeping holders booked for 2 mins to allow them to get registered in usedHolders from status table
	//after experiments been booked
	setTimeout(() => {
		req.body.forEach(i => {
			submitter.cancelBookedHolder(i.instrumentId, i.holder)
		})
	}, 120000)

	res.send()
}

exports.cancelBooked = (req, res) => {
	const submitter = app.getSubmitter()
	const instrumentId = req.params.key.split('-')[0]
	const holder = req.params.key.split('-')[1]
	submitter.cancelBookedHolder(instrumentId, holder)
	res.send()
}
