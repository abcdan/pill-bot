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

  // const lastConfirm = getLastConfirm()

  const now = getDate()
  setLastConfirm(now)

  bot.sendMessage(chatId, '✅ Confirmed, see you tomorrow!')
})

bot.onText(/last/, (msg) => {
  const chatId = msg.chat.id

  const lastConfirm = getLastConfirm()
  const agoTime = moment(lastConfirm.toUTCString()).fromNow()

  bot.sendMessage(chatId, `⌚ The last time your confirmed was which was about ${agoTime}`, { parse_mode: 'MarkdownV2' })
})

const job = new CronJob('0 20 * * *', () => {
  bot.sendMessage(PERSON_TO_REMIND, '⚠ Take your pill and /confirm it for me')
}, null, true, 'Europe/Amsterdam')

job.start()

bot.on('message', (msg) => {
  const chatId = msg.chat.id

  if (!userWhitelist.includes(msg.chat.id)) {
    try {
      // bot.sendMessage(chatId, 'You cannot use me. It\'s a private bot owned by @useless')
    } catch (_) { }
    return
  }

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
