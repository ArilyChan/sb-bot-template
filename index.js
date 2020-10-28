require('dotenv').config()
const path = require('path')
const appDir = path.dirname(require.main.filename)
const { express, http } = require('sb-qq-bot-framework/lib/WebServer')

const config = require(`${appDir}/config`)

const app = require('sb-qq-bot-framework/lib/Bot')(config.koishi)

try {
  const pluginLoader = require('sb-qq-bot-framework/lib/ContextPluginApply')
  const Loaded = pluginLoader(app, config.contextPlugins)
  Loaded.webViews.map(async v => {
    const middleware = v.expressApp(v.options, await v.pluginData, http)
    if (!middleware) return
    console.log(v.name, 'installed on', v.path)
    express.use(v.path, middleware)
  })
  const port = process.env.PORT || 3005
  http.listen(port, () => console.log(`Bot web app listening on port ${port}!`))
} catch (error) {
  console.log(error)
}

let count = 0
const maxTries = 3
try {
  while (count++ <= maxTries) {
    try {
      app.start()
    } catch (e) {
      console.log('⚠️Uncatched Exception!!')
      console.log(e.stack)
      if (count >= maxTries) throw e
    }
  }
} catch (e) {
  console.log('Max retries exceed. Quit now.')
  console.log(e)
}
process.on('unhandledRejection', async (error) => {
  try {
    const bot = app.bots.find(bot => bot)
    if (!bot) return
    console.warn(error)
  } catch (err) {
    console.error(error)
  }
})
