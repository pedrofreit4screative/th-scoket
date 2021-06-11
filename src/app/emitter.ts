import net from 'net'
import Ativo from '../interfaces/ativo'
import Opcao from '../interfaces/options'
import { send } from '../socket/socket'
import { Redis } from '../utils/redis'
const { calculos, calculosOpcoes } = require('./count')
import { filterData, keysArrays, writeEnfoque } from './filters'
import { ativoOuOpcao } from './mount'
import cron from 'node-cron'
import { calculaTempo } from './time'

// Socket Enfoque
let clients: net.Socket

const closeConnection = () => {
  console.log('Conexão com a enfoque fechada!')
}

const HOST = process.env.ENFOQUE_HOST?.toString() || 'socket3.enfoque.com.br'
const PORT = parseInt(process.env.ENFOQUE_PORT) || 8090
const credentials = 'L:TRADEHUNTER_FEED:HUNTER:NTM:NTB:TRD'

const ativos = {}
const opcoes = {}
let testCount = 0

const removeFromArray = (array: Array<any>, item: Object) => {
  const index = array.indexOf(item)
  if (index > -1) {
    array.splice(index, 1)
  }
}

const openConnection = async () => {
  // Conectar com o enfoque
  const { mediaVolume, minEMax, dadosFechs, dadosEstocs, mediasVolumeOpcoes } =
    await keysArrays()

  clients = net.connect({ host: HOST, port: PORT }, () => {
    console.log('[Enfoque] - Conexão realizada com sucesso!')
    clients.write(`${credentials}\r\n`)

    writeEnfoque(
      (ativos) => {
        //setTimeout(() => clients.write(`S:${ativos.cod}\r\n`), 100)
        //clients.write(`S:AALR3\r\n`)
        //clients.write(`S:PETR4\r\n`)
        return null
      },
      (opcoes) => {
        clients.write(`S:${opcoes.cod}\r\n`)
        testCount = testCount + 1
        return null
      }
    )
  })

  let dataFilter: Ativo[] | Opcao[] = []
  let ativosMontados = {}
  let opcoesMontadas = {}

  clients.on('data', (data) => {
    const d = data.toString('utf-8')

    const quoteT = d.match(/([T]:)[^\r]*/g) || []
    quoteT.forEach(async (q) => {
      const dataFiltered = filterData(q)
      dataFilter.push(dataFiltered)
      //console.log(testCount)
      ativoOuOpcao(
        dataFiltered,
        async (ativo) => {
          const parseAtivo = await calculos(
            {
              ...ativo,
              volumes: {},
              minmax: {},
              estocastico: {},
              pivotpoint: {},
              larry: {},
              didi: {},
              ifr: {},
              mediasmoveis: {},
              cruzamentomedias: {},
              trix: {},
              dr: {},
              adl: {},
              macd: {},
              obv: {},
              candleStick: {},
            },
            mediaVolume,
            minEMax,
            dadosFechs,
            dadosEstocs
          )

          if (!ativosMontados[parseAtivo.cod]) {
            ativosMontados[parseAtivo.cod] = parseAtivo
            send('ativo', Object.values(ativosMontados))
          } else {
            if (ativosMontados[parseAtivo.cod] !== parseAtivo) {
              send('ativo', Object.values(ativosMontados))
              ativosMontados[parseAtivo.cod] = parseAtivo
            }
          }
        },
        async (opcao) => {}
      )
    })
  })
  const redis = new Redis()
  const opcoes = await redis.getCache<Opcao[]>('opcao')

  let familiasUpdate = mediasVolumeOpcoes
  const lastOpcoes = {}

  setInterval(async () => {
    const filter = dataFilter

    dataFilter = []

    filter.forEach((item) => {
      opcoes.map(async (opcao) => {
        if (item.cod === opcao.cod) {
          if (lastOpcoes[item.cod]) {
            await calculosOpcoes(
              item,
              lastOpcoes[item.cod],
              familiasUpdate[opcao.familia],
              (familia) => {
                lastOpcoes[item.cod] = familia

                opcoesMontadas[opcao.familia] = familia
                send('opcao', Object.values(opcoesMontadas))
              }
            )
            lastOpcoes[item.cod] = item
          } else {
            await calculosOpcoes(
              item,
              null,
              familiasUpdate[opcao.familia],
              (familia) => {
                lastOpcoes[item.cod] = item
                opcoesMontadas[opcao.familia] = familia
                send('opcao', Object.values(opcoesMontadas))
              }
            )
          }
        }
      })
    })
  }, 1000)

  clients.on('close', (hadError) => {
    // TODO gravar log
    console.log('close', hadError)
  })

  clients.on('error', (err) => {
    // TODO gravar log
    console.log('error', err)
  })

  clients.on('end', () => {
    // TODO gravar log
    console.log('disconnected from server')
  })
}

// Cria conexão com a enfoque
cron.schedule('01 00 13 * * 1-5', async () => {
  const mercadoAberto = (await calculaTempo()).mercadoAberto
  if (!mercadoAberto) return
  console.log('Conectando com o enfoque..')
  openConnection()
})

// Fechar conexão com a enfoque
cron.schedule('01 00 21 * * 1-5', async () => {
  console.log('Fechando conexão com o enfoque..')
  closeConnection()
})

// Cron semanal
cron.schedule('00 30 12 * * 1', async () => {
  // Pedro pediu pra deixar essa parte com ele, Att, Pedro Freitas
})

openConnection()