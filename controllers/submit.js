const io = require('../socket')
const app = require('../app')

exports.postSubmit = (req, res) => {
	const { instrumentId, type, data } = req.body
	const submitter = app.getSubmitter()

	//Getting socketId from submitter state
	const { socketId } = submitter.state.get(instrumentId)

	if (!socketId) {
		console.log('Error: Client disconnected')
		return res.status(503).send({ error: 'Client disconnected' })
	}
	io.getIO().to(socketId).emit(type, JSON.stringify(data))
	res.send()
}
