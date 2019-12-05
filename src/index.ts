import { v1 } from 'appstoreconnect'
import { readFileSync } from 'fs'
// appstore config
import appstoreConfig from './config/appstore'
import config from './config/index'
// slack config
import slackConfig from './config/slack'
import slack from './lib/slack'

const privateKey = readFileSync(appstoreConfig.privateKey)
const keyId = appstoreConfig.keyId
const issuerId = appstoreConfig.issuerId
const groupId = appstoreConfig.groupId

const maxTesterNum = config.maxTesterNum
const removeTesterNum = config.removeTesterNum

const freq = config.freq || 1 * 1000 * 60 // 1min

let isSlacked = false

function start(): void {
  let timer = null
  const polling = async () => {
    try {
      const token = v1.token(privateKey, issuerId, keyId)
      const api = v1(token)

      // get testers info
      const limit = 200
      const testers = await v1.testflight.getAllBetaTesterIDsForBetaGroup(api, groupId, { limit })
      const total = testers.meta.paging.total

      console.log('testers', testers)

      // we need delete some testers
      if (total >= maxTesterNum) {
        const maxNum = removeTesterNum > limit ? limit : removeTesterNum
        const removeTesters = testers.data.slice(0, maxNum)
        await v1.testflight.removeBetaTestersFromBetaGroup(api, groupId, {
          data: removeTesters
        }).catch(err => {
          // handle error
          if (err.message !== 'Unexpected end of JSON input') {
            throw err
          }
        })
        const removedNum = removeTesters.length
        console.log('🌝', `we deleted ${removedNum} guys!`)
        await slack({ ...slackConfig, reachedNum: total, removedNum })
      }

      // slack every day
      if (slackConfig.reminderHour !== undefined) {
        const hours = (new Date()).getHours()
        if (hours !== slackConfig.reminderHour) {
          isSlacked = false
          return
        }
        if (isSlacked) {
          return
        }
        if (hours === slackConfig.reminderHour) {
          await slack({ ...slackConfig, reachedNum: total, removedNum: 0 })
          isSlacked = true
        }
      }

    } catch (err) {
      console.log('🌚', err)
    }

    // tslint:disable-next-line: no-unused-expression
    timer && clearTimeout(timer)
    timer = setTimeout(polling, freq)
  }
  polling()
}

start()
