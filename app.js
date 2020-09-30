const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const publicDirectoryPath = path.join(__dirname, '..', 'nmr-control-dash', 'build')
const trackerRoutes = require('./routes/tracker')
const instrumentsRoutes = require('./routes/admin/insruments')

const port = process.argv[2] ? process.argv[2] : 3000

app.use(express.static(publicDirectoryPath))
app.use(bodyParser.json({ strict: true, limit: '50mb' }))

app.use('/tracker', trackerRoutes)

app.use('/admin/instruments', instrumentsRoutes)

// Redirecting any requests that don't match with above to be handled by React router
app.use((req, res, next) => {
	res.sendFile(path.join(publicDirectoryPath, 'index.html'))
})

app.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
