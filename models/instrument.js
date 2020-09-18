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
	constructor(id, name, model, probe, capacity, running) {
		this.key = id
		this.name = name
		this.model = model
		this.probe = probe
		this.capacity = capacity
		this.running = running ? running : false
	}

	save(cb) {
		getInstrumentsFromFile((instruments) => {
			if (!this.key) {
				this.key = Math.random().toString()
				instruments.push(this)
			} else {
				const instrIndex = instruments.findIndex((instr) => instr.key === this.key)
				instruments[instrIndex] = this
			}
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

	static deleteInstrument(id, cb) {
		getInstrumentsFromFile((instruments) => {
			const updatedInstruments = instruments.filter((inst) => inst.key !== id)
			fs.writeFile(p, JSON.stringify(updatedInstruments), (err) => {
				console.log(err)
			})
			//Callback to send updated list of instruments to re-render table on frontend
			cb(updatedInstruments)
		})
	}

	static findById(id, cb) {
		getInstrumentsFromFile((instruments) => {
			const instrument = instruments.find((instr) => instr.key === id)
			cb(instrument)
		})
	}
}
