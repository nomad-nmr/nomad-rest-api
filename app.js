const path = require('path')
const express = require('express')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../nmr-control-dash/build')
const port = process.argv[2] ? process.argv[2] : 3000

app.use(express.static(publicDirectoryPath))

app.get('/api/test', (req, res) => {
	res.send({ test: true })
})

app.listen(port, () => {
	console.log(`Server is up on port ${port}`)
})
