const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

const trackerRoutes = require('./routes/tracker')
const instrumentsRoutes = require('./routes/admin/insruments')
const dashRoutes = require('./routes/dashboard')

const port = process.argv[2] ? process.argv[2] : 3000

app.use(bodyParser.json({ strict: true, limit: '50mb' }))

app.use('/api/tracker', trackerRoutes)
app.use('/api/admin/instruments', instrumentsRoutes)
app.use('/api/dash', dashRoutes)
app.use((req, res) => {
	res.status(404).send()
})

mongoose
	.connect('mongodb://127.0.0.1:27017/nomad', {
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
