import express from 'express'
import http, { createServer } from 'http'
import { Server } from 'socket.io'
import { checkHoliday } from '../app/filters'

const clients = []
let indexSend = 0

class App {
  public app: express.Application
  public server: http.Server
  public io: Server
  public PORT: number = 3000

  constructor() {
    this.routes()
    this.sockets()
  }

  routes() {
    this.app = express()
    this.app.route('/').get((req, res) => {
      res.sendFile(__dirname + '/index.html')
    })
  }

  send(room: string, data: { type: string; data: any }) {
    if (clients.length) {
      clients[indexSend].emit(room, data)
      if (indexSend === clients.length - 1) indexSend = 0
      else indexSend += 1
    }
  }

  private sockets(): void {
    this.server = createServer(this.app)
    this.io = new Server(this.server, {cors: {
      origin: '*'
    }})

    this.io.on('connection', (socket) => {
      console.log('New cliente connected: ' + socket.id)
      clients.push(socket)
    })

    this.io.on('close', (socket) => {
      const index = clients.findIndex((c) => c.id === socket.id)

      if (index !== -1) {
        clients.splice(index, 1)
      }
    })
  }
}

export default new App()
