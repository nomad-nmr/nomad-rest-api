class Submitter {
	constructor() {
		this.state = new Map()
	}

	init(instrArr) {
		instrArr.forEach(instr => {
			const usedHolders = new Set()
			instr.status.statusTable.forEach(entry => {
				usedHolders.add(+entry.holder)
			})

			this.state.set(instr._id.toString(), { socketId: undefined, usedHolders })
		})
	}

	updateSocket(instrId, socketId) {
		const instr = this.state.get(instrId)
		this.state.set(instrId, { ...instr, socketId })
	}

	// updateHoldersFromStatus(statusTable) {

	// }
}

module.exports = Submitter
