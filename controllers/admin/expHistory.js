const moment = require('moment')
const Experiment = require('../../models/experiment')

exports.getHistory = async (req, res) => {
	const date = new Date(req.params.date)
	try {
		const experiments = await Experiment.find({
			'instrument.id': req.params.instrId,
			updatedAt: {
				$gte: date,
				$lt: new Date(moment(date).add(1, 'd').format('YYYY-MM-DD'))
			}
		})
			.sort({ updatedAt: 'desc' })
			.populate('user.id', 'fullName')
			.exec()

		res.send(experiments)
	} catch (error) {
		console.log(error)
		res.status(500).send()
	}
}
