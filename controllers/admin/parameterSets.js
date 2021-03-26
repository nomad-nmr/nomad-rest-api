const ParameterSet = require('../../models/paramterSet')

exports.getParamSets = async (req, res) => {
	const { instrumentId, searchValue } = req.query
	const searchParams = { $and: [{}] }
	if (instrumentId !== 'null') {
		searchParams.$and.push({ 'availableOn.instrument.id': instrumentId })
	}

	if (searchValue) {
		const regex = new RegExp(searchValue, 'i')
		searchParams.$and.push({
			$or: [{ name: { $regex: regex } }, { description: { $regex: regex } }]
		})
	}

	try {
		const paramSets = await ParameterSet.find(searchParams).sort({ count: 'desc' })
		res.send(paramSets)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}

exports.postParamSet = async (req, res) => {
	console.log(req.body)
	try {
		const newParamSet = new ParameterSet(req.body)
		const paramSet = await newParamSet.save()
		res.send(paramSet)
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
