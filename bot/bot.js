require('dotenv').config()

const Chainson = require('chainson')
const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')
const CronJob = require('cron').CronJob

const chain = new Chainson()

const token = process.env.TOKEN
const bot = new TelegramBot(token, { polling: true })

const PERSON_TO_REMIND = parseInt(process.env.PERSON_TO_REMIND_ID)
const PERSON_TO_WARN = parseInt(process.env.PERSON_TO_WARN_ID)

const userWhitelist = [PERSON_TO_REMIND, PERSON_TO_WARN]

/**
 * Initialize the chain to ensure it's always filled in
 */
function init () {
  console.log('Initializing chainfile')
  if (!chain.has('lastConfirm')) {
    chain.set('lastConfirm', getDate())
  }

  if (!chain.has('day')) {
    chain.set('day', 0)
  }

  console.log('Chain initialized')
}
init()

/**
 * Confirm that the pill was taken
 */
bot.onText(/confirm/, (msg) => {
  const chatId = msg.chat.id
  if (!userWhitelist.includes(chatId)) { return }

  const now = getDate()
  setLastConfirm(now)

  const yesterday = getCurrentDay()
  const today = yesterday + 1

  if (today > 27) {
    setCurrentDay(0)
  } else {
    setCurrentDay(today)
  }

  bot.sendMessage(PERSON_TO_WARN, '✅ She confirmed, will update you tomorrow!\n\n📅 This was day ' + today)
  bot.sendMessage(chatId, '✅ Confirmed, see you tomorrow!\n\n📅 This was day ' + today)

  if (today + 1 === 22) {
    bot.sendMessage(PERSON_TO_REMIND, '💡 Heads up! Tomorrow you\'ll start your pause week!')
  } else if (today + 1 > 28) {
    bot.sendMessage(PERSON_TO_REMIND, '💡 Heads up! Tomorrow you\'ll have to start again with the pill!')
  }
})

/**
 * The last time the pill was taken
 */
bot.onText(/last/, (msg) => {
  const chatId = msg.chat.id
  if (!userWhitelist.includes(chatId)) { return }

  const lastConfirm = getLastConfirm()
  const agoTime = moment(lastConfirm.toUTCString()).fromNow()

  const day = getCurrentDay()

  bot.sendMessage(chatId, `⌚ The last time you confirmed was about ${agoTime}. That was day ${day === 0 ? 28 : day}`)
})

/**
 * Set the current day of the pill
 */
bot.onText(/\/set (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  if (!userWhitelist.includes(chatId)) { return }

  const newDay = match[1]

  if (!newDay) {
    return bot.sendMessage(chatId, '❌ You didn\'t use the command properly. Please do something along the lines of /set <day of pill>')
  }

  setCurrentDay(parseInt(newDay))

  const currentDay = getCurrentDay()

  bot.sendMessage(chatId, '✅ Gotcha! Your new day is set to: ' + currentDay)
})
/**
 * Crons
 */
// 0 22 * * *
const job = new CronJob('* * * * *', () => {
  const currentDay = getCurrentDay() + 1
  console.log(currentDay)
  const takePill = takeOrPause(currentDay)

  if (takePill) {
    bot.sendMessage(PERSON_TO_REMIND, '💊 Take your pill and /confirm it for me.\n\n📅 Today is day ' + currentDay + ' of your pill')
  } else {
    const pauseDay = parseInt(currentDay) - 21
    bot.sendMessage(PERSON_TO_REMIND, `⚠ You don't have to take your pill today. /confirm that you've seen this message.\n\n📅 Today is day ${pauseDay} of your break.`)
  }
}, null, true, 'Europe/Amsterdam')

job.start()

const job2 = new CronJob('0 22 * * *', () => {
  const now = getDate()
  const last = getLastConfirm()

  const lastConfirmDay = moment(last).dayOfYear()
  const todayDay = moment(now).dayOfYear()

  if (lastConfirmDay === todayDay) { return }
  const currentDay = getCurrentDay() + 1
  console.log(currentDay)
  const takePill = takeOrPause(currentDay)

  if (takePill) {
    bot.sendMessage(PERSON_TO_REMIND, '💊 Take your pill and /confirm it for me.\n\n📅 Today is day ' + currentDay + ' of your pill')
  } else {
    const pauseDay = parseInt(currentDay) - 21
    bot.sendMessage(PERSON_TO_REMIND, `⚠ You don't have to take your pill today. /confirm that you've seen this message.\n\n📅 Today is day ${pauseDay} of your break.`)
  }
}, null, true, 'Europe/Amsterdam')

job2.start()

const job3 = new CronJob('0 23 * * *', () => {
  const now = getDate()
  const last = getLastConfirm()

  const lastConfirmDay = moment(last).dayOfYear()
  const todayDay = moment(now).dayOfYear()

  if (lastConfirmDay === todayDay) { return }
  const currentDay = getCurrentDay() + 1
  console.log(currentDay)
  const takePill = takeOrPause(currentDay)

  if (takePill) {
    bot.sendMessage(PERSON_TO_REMIND, '💊 Take your pill and /confirm it for me.\n\n📅 Today is day ' + currentDay + ' of your pill')
  } else {
    const pauseDay = parseInt(currentDay) - 21
    bot.sendMessage(PERSON_TO_REMIND, `⚠ You don't have to take your pill today. /confirm that you've seen this message.\n\n📅 Today is day ${pauseDay} of your break.`)
  }
}, null, true, 'Europe/Amsterdam')

job3.start()

const job4 = new CronJob('50 23 * * *', () => {
  const now = getDate()
  const last = getLastConfirm()

  const lastConfirmDay = moment(last).dayOfYear()
  const todayDay = moment(now).dayOfYear()

  if (lastConfirmDay === todayDay) return

  const warning = '🚨 OH NO, LAST REMINDER 🚨'
  bot.sendMessage(PERSON_TO_REMIND, warning)
  bot.sendMessage(PERSON_TO_WARN, warning)
  bot.sendMessage(PERSON_TO_REMIND, warning)
  bot.sendMessage(PERSON_TO_WARN, warning)
  bot.sendMessage(PERSON_TO_REMIND, warning)
  bot.sendMessage(PERSON_TO_WARN, warning)
}, null, true, 'Europe/Amsterdam')

job4.start()

bot.on('message', (msg) => {
  const chatId = msg.chat.id
  if (!userWhitelist.includes(chatId)) { return }

  console.log(msg.chat.id)
})

bot.on('polling_error', (error) => {
  console.log(error) // => 'EFATAL'
})

/**
 * Check if you need to pause
 * @argument day
 * @returns if pause
 */
function takeOrPause (day) {
  return day <= 21
}

function getLastConfirm () {
  const lastConfirm = chain.get('lastConfirm')
  return new Date(lastConfirm)
}

function setLastConfirm (time) {
  const utc = time.toUTCString()
  chain.set('lastConfirm', utc)
}

function setCurrentDay (day) {
  if (isNaN(day)) { throw Error('Doesn\'t work') }
  chain.set('day', day)
}

function getCurrentDay () {
  return parseInt(chain.get('day'))
}

function getDate () {
  return new Date()
}
