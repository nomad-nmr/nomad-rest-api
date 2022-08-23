const moment = require('moment')

const Experiment = require('../../models/experiment')
const Group = require('../../models/group')
const User = require('../../models/user')
const Instrument = require('../../models/instrument')
const instrument = require('../../models/instrument')

exports.getCosts = async (req, res) => {
  const { groupId, dateRange } = req.query

  try {
    const searchParams = { $and: [{ status: 'Archived' }] }

    if (dateRange && dateRange !== 'undefined') {
      const datesArr = dateRange.split(',')
      searchParams.$and.push({
        updatedAt: {
          $gte: new Date(datesArr[0]),
          $lt: new Date(moment(datesArr[1]).add(1, 'd').format('YYYY-MM-DD'))
        }
      })
    }

    const resData = []
    const instrumentList = await Instrument.find({ isActive: true }, 'name')

    if (groupId === 'undefined') {
      //each entry of the table is group
      const groupList = await Group.find({ isActive: true }, 'groupName')

      await Promise.all(
        groupList.map(async entry => {
          const newEntry = { name: entry.groupName, costsPerInstrument: [] }

          //adding group or user into search parameters
          const entrySearchParams = {}
          entrySearchParams.$and = [...searchParams.$and, { 'group.id': entry._id }]

          const expArray = await Experiment.find(entrySearchParams, 'instrument totalExpTime')

          instrumentList.forEach(i => {
            const filteredExpArray = expArray.filter(exp => exp.instrument.name === i.name)
            newEntry.costsPerInstrument.push({
              instrument: i.name,
              expCount: filteredExpArray.length
            })
          })

          resData.push(newEntry)
        })
      )
    } else {
      //each entry of the table is user

      searchParams.$and = [...searchParams.$and, { 'group.id': groupId }]

      const expArray = await Experiment.find(searchParams, 'instrument totalExpTime user')

      const usrSet = new Set()

      expArray.forEach(exp => usrSet.add(exp.user.id.toString()))

      const usrArray = Array.from(usrSet).sort((a, b) => {
        if (a.username < b.username) {
          return -1
        }
        if (a.username > b.username) {
          return 1
        }
        return 0
      })

      await Promise.all(
        usrArray.map(async usrId => {
          const user = await User.findById(usrId)
          const usrInactive = !user.isActive || user.group.toString() !== groupId
          const newEntry = {
            name: `${user.username} - ${user.fullName} ${usrInactive ? '(Inactive)' : ''}`,
            costsPerInstrument: [],
            totalCost: 0
          }

          instrumentList.forEach(i => {
            const filteredExpArray = expArray.filter(
              exp => exp.instrument.name === i.name && exp.user.id.toString() === usrId
            )
            const expT = getExpTimeSum(filteredExpArray)
            const cost = moment.duration(expT).asHours().toFixed(3)
            newEntry.costsPerInstrument.push({
              instrument: i.name,
              expCount: filteredExpArray.length,
              expT,
              cost
            })
            newEntry.totalCost += Number(cost)
          })

          resData.push(newEntry)
        })
      )
    }

    res.send(resData)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

//Helper function to calculate sums of ExpT
const getExpTimeSum = expArr => {
  const expTimeSum = moment.duration()
  expArr.forEach(exp => {
    expTimeSum.add(exp.totalExpTime)
  })
  return expTimeSum.format('HH:mm:ss', { trim: false })
}
