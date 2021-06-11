import HttpServer from './net/server'
import 'dotenv/config'
import './socket/socket'
import './app/emitter'

const port = process.env.PORT || HttpServer.PORT

HttpServer.server.listen(port, function () {
  console.log('Server [OK]')
})
