const moment = require('moment')

const Experiment = require('../models/experiment')

exports.fetchExperiments = async (req, res) => {
  const {
    currentPage,
    pageSize,
    solvent,
    instrumentId,
    paramSet,
    title,
    dateRange,
    groupId,
    userId
  } = req.query

  const excludeProps =
    '-remarks -status -load -atma -spin -lock -shim -proc -acq -createdAt -expTime -dataPath'

  const searchParams = { $and: [{ status: 'Archived' }] }

  if (instrumentId && instrumentId !== 'undefined') {
    searchParams.$and.push({ 'instrument.id': instrumentId })
  }

  if (paramSet && paramSet !== 'undefined') {
    searchParams.$and.push({ parameterSet: paramSet })
  }

  if (solvent && solvent !== 'undefined') {
    searchParams.$and.push({ solvent })
  }

  if (title && title !== 'undefined') {
    const regex = new RegExp(title, 'i')
    searchParams.$and.push({ title: { $regex: regex } })
  }

  if (dateRange && dateRange !== 'undefined') {
    const datesArr = dateRange.split(',')
    searchParams.$and.push({
      submittedAt: {
        $gte: new Date(datesArr[0]),
        $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
      }
    })
  }

  if (
    (!groupId || groupId === 'undefined') &&
    (!userId || userId === 'undefined') &&
    req.user.accessLevel !== 'admin'
  ) {
    searchParams.$and.push({ 'user.id': req.user._id })
  }

  if (groupId && groupId !== 'undefined' && (!userId || userId === 'undefined')) {
    searchParams.$and.push({ 'group.id': groupId })
  }

  if (userId && userId !== 'undefined') {
    searchParams.$and.push({ 'user.id': userId })
  }

  const total = await Experiment.find(searchParams).countDocuments()
  const experiments = await Experiment.find(searchParams, excludeProps)
    .sort({ submittedAt: 'desc' })
    .skip((currentPage - 1) * pageSize)
    .limit(+pageSize)

  const datasets = []
  experiments.forEach(exp => {
    const datasetIndex = datasets.findIndex(dataSet => dataSet.datasetName === exp.datasetName)

    const expObj = {
      key: exp._id,
      datasetName: exp.datasetName,
      expNo: exp.expNo,
      parameterSet: exp.parameterSet,
      parameters: exp.parameters,
      title: exp.title,
      archivedAt: exp.updatedAt
    }

    if (datasetIndex < 0) {
      const newDataSet = {
        instrument: exp.instrument,
        user: exp.user,
        group: exp.group,
        datasetName: exp.datasetName,
        key: exp.datasetName,
        solvent: exp.solvent,
        title: exp.title,
        submittedAt: exp.submittedAt,
        exps: [expObj]
      }
      datasets.push(newDataSet)
    } else {
      datasets[datasetIndex].exps.push(expObj)
    }
  })

  //sorting exps to get ascend for expNo
  const sortedDatasets = datasets.map(i => {
    i.exps.sort((a, b) => a.expNo - b.expNo)
    return i
  })

  res.send({ data: sortedDatasets, total })
}
