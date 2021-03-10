const mongoose = require('mongoose')
const Schema = mongoose.Schema

const experimentSchema = new Schema({
	instrument: {
		name: {
			type: String,
			required: true
		},
		id: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Instrument'
		}
	},
	user: {
		username: {
			type: String,
			required: true
		},
		id: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		}
	},
	group: {
		name: {
			type: String,
			required: true
		},
		id: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Group'
		}
	},
	holder: { type: String, required: true },
	datasetName: { type: String, required: true },
	expNo: { type: String, required: true },
	parameterSet: { type: String, required: true },
	title: { type: String, required: true },
	finishedAt: { type: Date, required: true },
	expTime: { type: String, required: true },
	status: { type: String, required: true },
	remarks: String,
	load: { type: String, required: true },
	atma: { type: String, required: true },
	spin: { type: String, required: true },
	lock: { type: String, required: true },
	shim: { type: String, required: true },
	proc: { type: String, required: true },
	acq: { type: String, required: true }
})

module.exports = mongoose.model('Experiment', experimentSchema)
