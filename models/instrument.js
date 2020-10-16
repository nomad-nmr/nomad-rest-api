const mongoose = require('mongoose')
const Schema = mongoose.Schema

const instrumentSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	model: String,
	probe: String,
	capacity: {
		type: Number,
		required: true
	},
	available: {
		type: Boolean,
		default: false
	},
	statusSummary: {
		busyUntil: {
			type: String,
			default: 'unknown'
		},
		dayExpt: {
			type: String,
			default: 'unknown'
		},
		nightExpt: {
			type: String,
			default: 'unknown'
		}
	}
})

instrumentSchema.statics.getTableData = async function () {
	const instrumentsData = await this.find()
	return instrumentsData.map((i, index) => {
		return { ...i._doc, key: index }
	})
}

module.exports = mongoose.model('Instrument', instrumentSchema)
