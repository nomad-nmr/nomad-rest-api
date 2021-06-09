const moment = require('moment')
const bcrypt = require('bcryptjs')

const io = require('../socket')
const app = require('../app')
const Instrument = require('../models/instrument')
const ParameterSet = require('../models/parameterSet')
const User = require('../models/user')

exports.postSubmission = async (req, res) => {
	try {
		const { userId } = req.params
		const submitter = app.getSubmitter()

		const user = userId === 'undefined' ? req.user : await User.findById(userId)

		await user.populate('group').execPopulate()

		const groupName = user.group.groupName
		const username = user.username
		const instrIds = await Instrument.find({}, '_id')

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
				group: groupName,
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
			const { socketId } = submitter.state.get(instrumentId)

			if (!socketId) {
				console.log('Error: Client disconnected')
				return res.status(503).send({ error: 'Client disconnected' })
			}

			io.getIO().to(socketId).emit('book', JSON.stringify(submitData[instrumentId]))
		}

		res.send()
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.postBookHolders = async (req, res) => {
	try {
		const submitter = app.getSubmitter()
		const { instrumentId, count } = req.body
		const { usedHolders, bookedHolders } = submitter.state.get(instrumentId)

		if (!usedHolders || !bookedHolders) {
			throw new Error('Submitter error')
		}
		//adding bookedHolders to usedHolders
		const currentUsedHolders = new Set([...usedHolders, ...bookedHolders])
		const { capacity, name } = await Instrument.findById(instrumentId, 'capacity name')

		const availableHolders = findAvailableHolders(currentUsedHolders, capacity, count)

		submitter.updateBookedHolders(instrumentId, availableHolders)

		res.send({ instrumentId, instrumentName: name, holders: availableHolders })
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.deleteHolders = (req, res) => {
	try {
		const submitter = app.getSubmitter()
		//Keeping holders booked for 2 mins to allow them to get registered in usedHolders from status table
		//after experiments been booked
		setTimeout(() => {
			req.body.forEach(i => {
				submitter.cancelBookedHolder(i.instrumentId, i.holder)
			})
		}, 120000)

		res.send()
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.deleteHolder = (req, res) => {
	try {
		const submitter = app.getSubmitter()
		const instrumentId = req.params.key.split('-')[0]
		const holder = req.params.key.split('-')[1]
		submitter.cancelBookedHolder(instrumentId, holder)
		res.send()
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.deleteExps = (req, res) => {
	try {
		emitDeleteExps(req.params.instrId, req.body)
		res.send()
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.putReset = async (req, res) => {
	const { instrId } = req.params
	try {
		const submitter = app.getSubmitter()
		const instrument = await Instrument.findById(instrId, 'status.statusTable')
		if (!instrument) {
			return res.status(404).send('Instrument not found')
		}

		const holders = instrument.status.statusTable
			.filter(row => row.status === 'Completed' || row.status === 'Error')
			.map(row => row.holder)

		submitter.resetBookedHolders(instrId)
		emitDeleteExps(instrId, holders)
		res.send(holders)
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}

exports.postPending = async (req, res) => {
	const path = req.path.split('/')[1]
	const { data, username, password } = req.body

	try {
		const submitter = app.getSubmitter()
		//If path is pending-auth authentication takes place
		if (path === 'pending-auth') {
			const user = await User.findOne({ username })

			if (!user) {
				return res.status(400).send('Wrong username or password')
			}
			const passMatch = await bcrypt.compare(password, user.password)
			if (!passMatch) {
				return res.status(400).send('Wrong username or password')
			}
		}

		for (let instrId in data) {
			const { socketId } = submitter.state.get(instrId)

			if (!socketId) {
				console.log('Error: Client disconnected')
				return res.status(503).send({ error: 'Client disconnected' })
			}

			io.getIO().to(socketId).emit(req.params.type, JSON.stringify(data[instrId]))
		}
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
	res.send()
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

//Helper function that sends array of holders to be deleted to the client
const emitDeleteExps = (instrId, holders) => {
	const submitter = app.getSubmitter()
	const { socketId } = submitter.state.get(instrId)

	if (!socketId) {
		console.log('Error: Client disconnected')
		return res.status(503).send({ error: 'Client disconnected' })
	}

	io.getIO().to(socketId).emit('delete', JSON.stringify(holders))
}
