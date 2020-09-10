const fs = require('fs')
const path = require('path')

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'instruments.json')

const getInstrumentsFromFile = (cb) => {
	fs.readFile(p, (err, fileContent) => {
		if (err) {
			cb([])
		} else {
			cb(JSON.parse(fileContent))
		}
	})
}

module.exports = class Instrument {
	constructor(name, model, probe, capacity) {
		this.key = name
		this.name = name
		this.model = model
		this.probe = probe
		this.capacity = capacity
		this.running = false
	}

	save(cb) {
		getInstrumentsFromFile((instruments) => {
			instruments.push(this)
			fs.writeFile(p, JSON.stringify(instruments), (err) => {
				console.log(err)
			})
			//Callback to send updated list of instruments to re-render table on frontend
			cb(instruments)
		})
	}

	static fetchAll(cb) {
		getInstrumentsFromFile(cb)
	}
}
