const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const port = process.env.PORT
const app = express()

const User = require('./models/user')
const trackerRoutes = require('./routes/tracker')
const instrumentsRoutes = require('./routes/admin/insruments')
const dashRoutes = require('./routes/dashboard')
const authRoutes = require('./routes/auth')

app.use(bodyParser.json({ strict: true, limit: '50mb' }))

app.use('/api/tracker', trackerRoutes)
app.use('/api/admin/instruments', instrumentsRoutes)
app.use('/api/dash', dashRoutes)
app.use('/api/auth', authRoutes)
app.use((req, res) => {
	res.status(404).send()
})

mongoose
	.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(async () => {
		console.log('DB connected')
		try {
			const user = await User.findOne()
			if (!user) {
				const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
				const adminUser = await new User({
					username: 'admin',
					password: hashedPassword
				})
				await adminUser.save()
			}
			app.listen(port, () => {
				console.log(`Server is up on port ${port}`)
			})
		} catch (error) {
			console.log(error)
		}
	})
