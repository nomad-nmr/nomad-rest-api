const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const port = process.env.PORT
const app = express()

const trackerRoutes = require('./routes/tracker')
const instrumentsRoutes = require('./routes/admin/insruments')
const dashRoutes = require('./routes/dashboard')

app.use(bodyParser.json({ strict: true, limit: '50mb' }))

app.use('/api/tracker', trackerRoutes)
app.use('/api/admin/instruments', instrumentsRoutes)
app.use('/api/dash', dashRoutes)
app.use((req, res) => {
	res.status(404).send()
})

mongoose
	.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		// useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(() => {
		console.log('DB connected')
		app.listen(port, () => {
			console.log(`Server is up on port ${port}`)
		})
	})
