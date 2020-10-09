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
	}
})

instrumentSchema.statics.getTableData = function (data) {
	return data.map((i, index) => {
		return { ...i._doc, key: index }
	})
}

module.exports = mongoose.model('Instrument', instrumentSchema)
