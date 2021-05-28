const User = require('../../models/user')
const transporter = require('../../utils/emailTransporter')

exports.postMessage = async (req, res) => {
	const { recipients, subject, message } = req.body
	try {
		const recipientsSet = new Set()
		await Promise.all(
			recipients.map(async entry => {
				let users = []
				switch (entry.type) {
					case 'user':
						const user = await User.findById(entry.id)
						users = [user]
						break

					case 'group':
						users = await User.find({ group: entry.id, isActive: true })
						break

					case 'all':
						users = await User.find({ isActive: true })
						break

					default:
						throw new Error('Recipient type unknown')
				}

				users.forEach(user => {
					if (user.email) {
						recipientsSet.add(user.email)
					}
				})
			})
		)

		await transporter.sendMail({
			from: process.env.SMTP_SENDER,
			cc: process.env.SMTP_SENDER,
			to: [...recipientsSet],
			subject: 'NOMAD: ' + (subject ? subject : ''),
			text: message
		})

		res.status(200).send(recipientsSet.size.toString())
	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}
