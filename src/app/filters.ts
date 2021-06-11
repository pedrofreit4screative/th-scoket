import Ativo from '../interfaces/ativo'
import Opcao from '../interfaces/options'
import { send } from '../socket/socket'
import db from '../utils/db'
import { Redis, RedisIn } from '../utils/redis'

const DataBase = new db()

export const writeEnfoque = async (
  ativosCall: (item: Ativo) => {},
  opcoesCall: (item: Opcao) => {}
) => {
  const ativos = await DataBase.select<Ativo[]>('ativos_enfoque', 'ATIVO')
  const opcoes = await DataBase.select<Opcao[]>('ativos_enfoque', 'OPCAO')

  // Redis
  const redis = new Redis()

  redis.setCache<Ativo[]>('ativos', ativos)
  redis.setCache<Opcao[]>('opcao', opcoes)

  ativos.forEach((item) => ativosCall(item))
  opcoes.forEach((item) => opcoesCall(item))
}

export const checkHoliday = async (): Promise<boolean> => {
  return true
}
const toHour = (value: number) => {
  console.log(value)
  return value ? value : null
}
const toDecimal = (value: string): number => {
  return value ? Number(value.replace(',', '.')) : null
}
const toNumber = (value: string): number => {
  return value ? Number(value) : null
}
const toCode = (value: string) => {
  return value.replace('T:', '')
}

// const colarDados = async (
//   ticker,
//   data,
//   cacheShares,
//   cacheOptions,
//   cacheFamilys
// ) => {
//   if (!isNaN(data[11]) && data[11] > 0 && cacheShares[ticker.toUpperCase()]) {
//     const p = cacheShares[ticker.toUpperCase()]

//     if (data[2]) {
//       p.ult = parseFloat(data[2].replace(',', '.'))
//     }

//     p.hora = parseFloat(data[3])

//     if (data[4]) {
//       p.vard = parseFloat(data[4].replace(',', '.'))
//     }

//     if (data[5]) {
//       p.max = parseFloat(data[5].replace(',', '.'))
//     }

//     if (data[6]) {
//       p.min = parseFloat(data[6].replace(',', '.'))
//     }

//     if (data[7]) {
//       p.fechant = parseFloat(data[7].replace(',', '.'))
//     }

//     if (data[8]) {
//       p.abe = parseFloat(data[8].replace(',', '.'))
//     }

//     if (data[9]) {
//       p.ocp = parseFloat(data[9].replace(',', '.'))
//     }

//     if (data[10]) {
//       p.ovd = parseFloat(data[10].replace(',', '.'))
//     }

//     p.neg = parseFloat(data[11])

//     if (data[13]) {
//       p.med = parseFloat(data[13].replace(',', '.'))
//     }

//     p.qtt = parseFloat(data[16])
//     ;(async () => {
//       await redisClient.redis.set(
//         `papel_final_inicio${ticker.toUpperCase()}`,
//         JSON.stringify(p)
//       )
//     })()
//   }

//   if (!isNaN(data[11]) && data[11] > 0 && cacheOptions[ticker.toUpperCase()]) {
//     const o = cacheOptions[ticker.toUpperCase()]
//     const f = cacheFamilys[o.familia]

//     if (!o.neg) {
//       if (data[2]) {
//         o.ult = parseFloat(data[2].replace(',', '.'))
//       }

//       f.hora = f.hora
//         ? Math.max(parseFloat(data[3]), f.hora)
//         : parseFloat(data[3])
//       o.hora = parseFloat(data[3])

//       if (data[4]) {
//         o.vard = parseFloat(data[4].replace(',', '.'))
//       }

//       if (data[5]) {
//         o.max = parseFloat(data[5].replace(',', '.'))
//       }

//       if (data[6]) {
//         o.min = parseFloat(data[6].replace(',', '.'))
//       }

//       if (data[7]) {
//         o.fechant = parseFloat(data[7].replace(',', '.'))
//       }

//       if (data[8]) {
//         o.abe = parseFloat(data[8].replace(',', '.'))
//       }

//       if (data[9]) {
//         o.ocp = parseFloat(data[9].replace(',', '.'))
//       }

//       if (data[10]) {
//         o.ovd = parseFloat(data[10].replace(',', '.'))
//       }

//       if (data[11]) {
//         o.neg = parseFloat(data[11])
//       }

//       if (data[13]) {
//         o.med = parseFloat(data[13].replace(',', '.'))
//       }

//       if (data[16]) {
//         o.qtt = parseFloat(data[16])
//       }

//       if (data[13]) {
//         o.vtt = o.qtt * o.med
//       }

//       f.neg = f.neg + o.neg
//       f.qtt = f.qtt + o.qtt

//       if (data[13]) {
//         f.vtt = f.vtt + o.vtt
//       }
//     } else {
//       const negAnt = o.neg
//       const qttAnt = o.qtt
//       const vttAnt = o.vtt

//       if (data[2]) {
//         o.ult = parseFloat(data[2].replace(',', '.'))
//       }

//       f.hora = f.hora
//         ? Math.max(parseFloat(data[3]), f.hora)
//         : parseFloat(data[3])
//       o.hora = parseFloat(data[3])

//       if (data[4]) {
//         o.vard = parseFloat(data[4].replace(',', '.'))
//       }

//       if (data[5]) {
//         o.max = parseFloat(data[5].replace(',', '.'))
//       }

//       if (data[6]) {
//         o.min = parseFloat(data[6].replace(',', '.'))
//       }

//       if (data[7]) {
//         o.fechant = parseFloat(data[7].replace(',', '.'))
//       }

//       if (data[8]) {
//         o.abe = parseFloat(data[8].replace(',', '.'))
//       }

//       if (data[9]) {
//         o.ocp = parseFloat(data[9].replace(',', '.'))
//       }

//       if (data[10]) {
//         o.ovd = parseFloat(data[10].replace(',', '.'))
//       }

//       if (data[11]) {
//         o.neg = parseFloat(data[11])
//       }

//       if (data[13]) {
//         o.med = parseFloat(data[13].replace(',', '.'))
//       }

//       if (data[16]) {
//         o.qtt = parseFloat(data[16])
//       }

//       if (data[13]) {
//         o.vtt = o.qtt * o.med
//       }

//       f.neg = f.neg - negAnt + o.neg
//       f.qtt = f.qtt - qttAnt + o.qtt

//       if (data[13]) {
//         f.vtt = f.vtt - vttAnt + o.vtt
//       }
//     }
//     //console.log(o)
//     return o
//     // await redisClient.redis.set(`opcopc${ticker.toUpperCase()}`, JSON.stringify(o));
//     // await redisClient.redis.set(`famfam${f.familia.toUpperCase()}`, JSON.stringify(f));
//   }
// }

export const filterData = (data: string) => {
  const values = data.split(/[\t]+/)

  const o: any = {
    cod: toCode(values[0]),
    ult: toDecimal(values[1]),
    hora: Number(values[2]),
    vard: toDecimal(values[3]),
    max: toDecimal(values[4]),
    min: toDecimal(values[5]),
    fechant: toDecimal(values[6]),
    abe: toDecimal(values[7]),
    ocp: toDecimal(values[8]),
    ovd: toDecimal(values[9]),
    neg: toNumber(values[10]),
    qult: toNumber(values[11]),
    med: toDecimal(values[12]),
    vov: toNumber(values[13]),
    voc: toNumber(values[14]),
    qtt: toNumber(values[15]),
    vtt: toNumber(values[15]) * toDecimal(values[12]),
  }

  return o
}

let redisMediaVolume: any = []
let redisMinEMax: any = []
let redisDadosFechs: any = []
let redisEstocastico: any = []

let mediaVolume: any = []
let minEMax: any = []
let dadosFechs: any = []
let dadosEstocs: any = []

let redisMediaVolumeOpcao: any = []
let mediasVolumeOpcoes: any = []

const redisClient = new RedisIn()

let cacheMediasVolumeOpcoes = {}

export const keysArrays = async () => {
  console.log('Pegando chaves e setando arrays')

  redisMediaVolume = await redisClient.redis.get('redis_medias_volumes')
  redisMinEMax = await redisClient.redis.get('redis_min_max')
  redisDadosFechs = await redisClient.redis.get('redis_fechamentos_pregao')
  redisEstocastico = await redisClient.redis.get('redis_estocastico')

  redisMediaVolumeOpcao = await redisClient.redis.get(
    'redis_medias_volumes_opcoes'
  )

  mediaVolume = JSON.parse(redisMediaVolume)
  minEMax = JSON.parse(redisMinEMax)
  dadosFechs = JSON.parse(redisDadosFechs)
  dadosEstocs = JSON.parse(redisEstocastico)
  mediasVolumeOpcoes = JSON.parse(redisMediaVolumeOpcao)

  console.log('Arrays setados')

  mediasVolumeOpcoes.forEach(async (m) => {
    const mo = {
      familia: m.familia,
      mmneg: m.mmneg,
      mmqtt: m.mmqtt,
      mmvtt: m.mmvtt,
      hora: '0:',
      neg: 0,
      npr: 0,
      nprmmneg: 0,
      qtt: 0,
      qpr: 0,
      qprmmqtt: 0,
      vtt: 0,
      vpr: 0,
      vprmmvtt: 0,
    }
    cacheMediasVolumeOpcoes[m.familia] = mo
  })

  return {
    mediaVolume,
    minEMax,
    dadosFechs,
    dadosEstocs,
    mediasVolumeOpcoes: cacheMediasVolumeOpcoes,
  }
}
