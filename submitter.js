const Instrument = require('./models/instrument')

//Class is used to generate submitter object that registers and holds socketId for instrument clients and state of holders on each machine
class Submitter {
	constructor() {
		//State has following map data structure [instrumentId, {socketId, usedHolders, bookedHolders}]
		// usedHolders is set with numbers of holder being used on given instrument. It gets generated and updated from status table.
		//bookedHolders is array of numbers of holders currently being booked on the instrument

		this.state = new Map()
	}

	init() {
		Instrument.find({ isActive: true }, '_id capacity status.statusTable').then(instrArr => {
			instrArr.forEach(instr => {
				const usedHolders = new Set()
				instr.status.statusTable.forEach(entry => {
					usedHolders.add(+entry.holder)
				})

				this.state.set(instr._id.toString(), { socketId: undefined, usedHolders, bookedHolders: [] })
			})
		})
	}

	updateSocket(instrId, socketId) {
		const instr = this.state.get(instrId)
		this.state.set(instrId, { ...instr, socketId })
	}

	updateBookedHolders(instrId, holders) {
		const instr = this.state.get(instrId)
		this.state.set(instrId, { ...instr, bookedHolders: instr.bookedHolders.concat(holders) })
	}

	updateUsedHolders(instrId, statusTable) {
		const instr = this.state.get(instrId)
		const newUsedHolders = new Set()
		statusTable.forEach(entry => {
			newUsedHolders.add(+entry.holder)
		})
		this.state.set(instrId, { ...instr, usedHolders: newUsedHolders })
		// console.log(this.state.get(instrId))
	}

	cancelBookedHolders(instrId, holders) {
		const instr = this.state.get(instrId)
		const newBookedHolders = instr.bookedHolders.filter(bh => !holders.includes(bh))
		this.state.set(instrId, { ...instr, bookedHolders: newBookedHolders })
	}
}

module.exports = Submitter
