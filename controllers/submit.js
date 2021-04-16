const io = require('../socket')
const app = require('../app')
const Instrument = require('../models/instrument')

exports.postSubmission = (req, res) => {
	const { instrumentId, type, data } = req.body
	//Getting socketId from submitter state
	const submitter = app.getSubmitter()
	const { socketId } = submitter.state.get(instrumentId)

	if (!socketId) {
		console.log('Error: Client disconnected')
		return res.status(503).send({ error: 'Client disconnected' })
	}

	io.getIO().to(socketId).emit(type, JSON.stringify(data))

	const holders = data.map(entry => +entry.holder)

	//Keeping holders booked for 2 mins to allow them to get registered in usedHolders from status table
	setTimeout(() => {
		submitter.cancelBookedHolders(instrumentId, holders)
	}, 120000)

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
	bookedHolders.forEach(holder => usedHolders.add(holder))

	const { capacity, name } = await Instrument.findById(instrumentId, 'capacity name')

	const availableHolders = findAvailableHolders(usedHolders, capacity, count)

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
	const { instrumentId, holders } = req.body
	const submitter = app.getSubmitter()
	submitter.cancelBookedHolders(instrumentId, holders)
	res.send()
}
