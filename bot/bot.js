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

bot.onText(/confirm/, (msg) => {
  const chatId = msg.chat.id
  if (!userWhitelist.includes(chatId)) { return }

  const now = getDate()
  setLastConfirm(now)

  bot.sendMessage(PERSON_TO_WARN, '✅ She confirmed, you can hit it again safely!')
  bot.sendMessage(chatId, '✅ Confirmed, see you tomorrow!')
})

bot.onText(/last/, (msg) => {
  const chatId = msg.chat.id
  if (!userWhitelist.includes(chatId)) { return }

  const lastConfirm = getLastConfirm()
  const agoTime = moment(lastConfirm.toUTCString()).fromNow()

  bot.sendMessage(chatId, `⌚ The last time your confirmed was about ${agoTime}`, { parse_mode: 'MarkdownV2' })
})

/** Prachtig stukje clean code die gerefactored mag worden */
const job = new CronJob('0 21 * * *', () => {
  bot.sendMessage(PERSON_TO_REMIND, '⚠ Take your pill and /confirm it for me')
}, null, true, 'Europe/Amsterdam')

job.start()

const job2 = new CronJob('0 22 * * *', () => {
  const now = getDate()
  const last = getLastConfirm()

  const lastConfirmDay = moment(last).dayOfYear()
  const todayDay = moment(now).dayOfYear()

  if (lastConfirmDay === todayDay) { return }
  bot.sendMessage(PERSON_TO_REMIND, '⚠ Take your pill and /confirm it for me')
}, null, true, 'Europe/Amsterdam')

job2.start()

const job3 = new CronJob('0 23 * * *', () => {
  const now = getDate()
  const last = getLastConfirm()

  const lastConfirmDay = moment(last).dayOfYear()
  const todayDay = moment(now).dayOfYear()

  if (lastConfirmDay === todayDay) { return }
  bot.sendMessage(PERSON_TO_REMIND, '⚠ Take your pill and /confirm it for me')
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

function getLastConfirm () {
  const lastConfirm = chain.get('lastConfirm')
  return new Date(lastConfirm)
}
function setLastConfirm (time) {
  const utc = time.toUTCString()
  chain.set('lastConfirm', utc)
}

function getDate () {
  return new Date()
}
