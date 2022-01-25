const express = require('express')
const multer = require('multer')
const path = require('path')
const moment = require('moment')
const { access, mkdir } = require('fs/promises')

const dataControllers = require('../controllers/data')

const router = express.Router()

const pathDate = moment().format('YYYY-MM')

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { group, datasetName } = req.body
    const datastoreRootPath = process.env.DATASTORE_PATH ? process.env.DATASTORE_PATH : 'data'
    const relativePath = path.join(group, pathDate, datasetName)
    const storagePath = path.join(datastoreRootPath, relativePath)
    try {
      await access(storagePath)
    } catch {
      await mkdir(storagePath, { recursive: true })
    }
    req.body.path = relativePath
    cb(null, storagePath)
  },
  filename: (req, file, cb) => {
    const { datasetName, expNo } = req.body
    cb(null, datasetName + '-' + expNo + '.zip')
  }
})

const upload = multer({ storage })

router.post('/auto', upload.single('nmrData'), dataControllers.postData)

module.exports = router
