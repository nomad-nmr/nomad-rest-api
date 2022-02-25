const fs = require('fs/promises')
const { createReadStream } = require('fs')
const path = require('path')

const JSZip = require('jszip')

const Experiment = require('../models/experiment')

exports.postData = async (req, res) => {
  const { datasetName, expNo, dataPath } = req.body
  try {
    const experiment = await Experiment.findOne({ expId: datasetName + '-' + expNo })
    if (!experiment) {
      throw new Error('Experiment not found in Database')
    }
    experiment.dataPath = dataPath
    experiment.status = 'Archived'
    experiment.save()
    if (!process.env.NODE_ENV === 'production') {
      console.log('data received', datasetName, expNo)
    }
    res.send()
  } catch (error) {
    console.log(error)
    res.status(500).send()
  }
}

exports.getExps = async (req, res) => {
  try {
    const expIds = req.query.exps.split(',')

    const mainZip = new JSZip()

    await Promise.all(
      expIds.map(async expId => {
        const experiment = await Experiment.findById(expId)
        const zipFilePath = path.join(
          process.env.DATASTORE_PATH,
          experiment.dataPath,
          experiment.expId + '.zip'
        )

        const zipFile = await fs.readFile(zipFilePath)
        const zibObject = await JSZip.loadAsync(zipFile)
        const zipContent = await zibObject.generateAsync({ type: 'nodebuffer' })
        await mainZip.loadAsync(zipContent, { createFolders: true })
      })
    )

    mainZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(res)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}
