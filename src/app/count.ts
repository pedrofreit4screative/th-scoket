import { calculaTempo } from './time'

var { ma, ema } = require('moving-averages')
var BB = require('technicalindicators').BollingerBands
var RSI = require('technicalindicators').RSI
let TRIX = require('technicalindicators').TRIX
const ADL = require('technicalindicators').ADL
var MACD = require('technicalindicators').MACD
var OBV = require('technicalindicators').OBV

let cacheResult = {}

async function calculos(ativo, mv, mm, df, de) {
  const tempoNovo = (await calculaTempo()).tempoDecorrido
  const resultParse = ativo
  //console.log(ativo)

  let filtro = mv.filter((v) => v.cod === resultParse.cod)
  let filtroB = mm.filter((m) => m.cod === resultParse.cod)
  let filtroC = df.filter((m) => m.cod === resultParse.cod)
  let filtroD = de.filter((m) => m.cod === resultParse.cod)

  Promise.all([
    calcVolume(resultParse, filtro[0]),
    calcVolumeProjetado(resultParse, tempoNovo),
    calcMinEMax(resultParse, filtroB[0]),
    estocastico(resultParse, filtroD[0]),
    bandasBollinger(resultParse, filtroC[0]),
    pontoDePivot(resultParse),
    larryWilliams(resultParse, filtroC[0]),
    agulhadaDidi(resultParse, filtroC[0]),
    ifr(resultParse, filtroC[0]),
    mediasMoveis(resultParse, filtroC[0]),
    trix(resultParse, filtroC[0]),
    duploRompimento(resultParse),
    macd(resultParse, filtroC[0]),
    candleStick(resultParse),
    acumDistAdl(resultParse, filtroC[0]),
    obv(resultParse, filtroC[0]),
  ])

  return resultParse
}

async function calculosOpcoes(opcao, opAnt = null, familia, callback) {
  const tempoNovo = (await calculaTempo()).tempoDecorrido

  const antNeg = opAnt ? opAnt.neg : 0
  const antQtt = opAnt ? opAnt.qtt : 0
  const antVtt = opAnt ? opAnt.vtt : 0
  const antHora = opAnt ? opAnt.hora : 0

  if (opcao.neg === 0) {
    return null
  }

  if (!familia || familia.neg === undefined) {
    console.log('Sem fam', opcao)
    return null
  }

  if (familia.neg === 0) {
    // se não +
    familia.neg = familia.neg + opcao.neg
  } else if (opcao.neg !== null && antNeg !== null) {
    // se negociou +-
    // Hora --> Verificar se a da opção é mais alta que a
    // familia se sim, setar a da familia a hora da opção
    familia.hora = familia.hora
      ? Math.max(opcao.hora, familia.hora)
      : opcao.hora
    //--
    familia.neg = familia.neg + opcao.neg - antNeg
    familia.npr = familia.neg / tempoNovo
    familia.nprmmneg = familia.npr / familia.mmneg
    familia.qtt = familia.qtt + opcao.qtt - antQtt
    familia.qpr = familia.qtt / tempoNovo
    familia.qprmmqtt = familia.qpr / familia.mmqtt
    familia.vtt = familia.vtt + opcao.vtt - antVtt
    familia.vpr = familia.vtt / tempoNovo
    familia.vprmmvtt = familia.vpr / familia.mmvtt

    if (familia.familia === 'BBAS3CALL') {
      //console.log(opcao.hora, familia)
    }

    callback(familia)
  }
}

async function calculosOpcao(opcao, mvo) {
  const tempoNovo = (await calculaTempo()).tempoDecorrido
  const resultParse = opcao
  let familia = mvo[resultParse.familia]

  if (!familia) {
    //familia.neg = 1000
  }

  // mvo.forEach((itemMvo) => {
  //   if (itemMvo.familia === resultParse.familia) {

  //   }
  // })
  if (mvo[resultParse.familia]) {
    mvo[resultParse.familia].hora = resultParse.hora
    mvo[resultParse.familia].neg = resultParse.neg
    mvo[resultParse.familia].npr = resultParse.neg / tempoNovo
    mvo[resultParse.familia].nprmmneg =
      resultParse.neg / tempoNovo / mvo[resultParse.familia].mmneg
    mvo[resultParse.familia].qtt = resultParse.qtt
    mvo[resultParse.familia].qpr = resultParse.qtt / tempoNovo
    mvo[resultParse.familia].qprmmqtt =
      resultParse.qtt / tempoNovo / mvo[resultParse.familia].mmqtt

    // ---
    mvo[resultParse.familia].vtt = resultParse.vtt
    mvo[resultParse.familia].vpr = resultParse.vtt / tempoNovo
    mvo[resultParse.familia].vprmmvtt =
      resultParse.vtt / tempoNovo / mvo[resultParse.familia].mmvtt
    //console.log(mvo[resultParse.familia])
  }
}

function calcVolume(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (dados && conjunto) {
      dados.volumes.mmneg = (Number(conjunto.mmneg) * 59 + dados.neg) / 60
      dados.volumes.mmqtt = (Number(conjunto.mmqtt) * 59 + dados.qtt) / 60
      dados.volumes.mmvtt =
        (Number(conjunto.mmvtt) * 59 + dados.qtt * dados.med) / 60

      resolve(dados)
    }
  })
}

function calcVolumeProjetado(dados, newTime) {
  return new Promise((resolve, reject) => {
    if (dados && dados.volumes) {
      dados.volumes.vtt = dados.qtt * dados.med
      dados.volumes.npr = dados.neg / newTime
      dados.volumes.nprmmneg = Number(
        (dados.volumes.npr / dados.volumes.mmneg).toFixed(4)
      )
      dados.volumes.vpr = dados.volumes.vtt / newTime
      dados.volumes.vprmmvtt = Number(
        (dados.volumes.vpr / dados.volumes.mmvtt).toFixed(4)
      )

      resolve(dados)
    }
  })
}

function calcMinEMax(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (dados && conjunto && dados.minmax) {
      dados.minmax.minant = Number(conjunto.minant)
      dados.minmax.min14 = Math.min(conjunto.min13, dados.min)
      dados.minmax.min60 = Math.min(conjunto.min59, dados.min)
      dados.minmax.maxant = Number(conjunto.maxant)
      dados.minmax.max14 = Math.max(conjunto.max13, dados.max)
      dados.minmax.max60 = Math.max(conjunto.max59, dados.max)
      dados.minmax.estoc60 = Number(
        (
          (100 * (dados.ult - dados.minmax.min60)) /
          (dados.minmax.max60 - dados.minmax.min60)
        ).toFixed(2)
      )
      dados.minmax.maxmaxant = Number(
        (dados.max / dados.minmax.maxant - 1).toFixed(4)
      )
      dados.minmax.minminant = Number(
        (dados.min / dados.minmax.minant - 1).toFixed(4)
      )
      if (dados.min !== dados.max) {
        dados.minmax.estochoje = Number(
          ((100 * (dados.ult - dados.min)) / (dados.max - dados.min)).toFixed(2)
        )
        dados.minmax.amp = Number(
          ((dados.max - dados.min) / dados.ult).toFixed(4)
        )
        dados.minmax.candle = Number(
          ((100 * (dados.ult - dados.abe)) / (dados.max - dados.min)).toFixed(2)
        )
      }
      dados.minmax.ultmed = Number((dados.ult / dados.med - 1).toFixed(4))
      dados.minmax.gapalta =
        dados.minmax.minant > 0 &&
        dados.minmax.maxant > 0 &&
        dados.min > dados.minmax.maxant
          ? Number((dados.min / dados.minmax.maxant - 1).toFixed(4))
          : 0
      dados.minmax.gapbaixa =
        dados.minmax.minant > 0 &&
        dados.minmax.maxant > 0 &&
        dados.max < dados.minmax.minant
          ? Number((dados.max / dados.minmax.minant - 1).toFixed(4))
          : 0

      resolve(dados)
    }
  })
}

function estocastico(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.estocd0 &&
      conjunto.estocl0 &&
      conjunto.soma2k &&
      conjunto.soma2d
    ) {
      dados.estocastico.estoc14 = Number(
        (
          (100 * (dados.ult - dados.minmax.min14)) /
          (dados.minmax.max14 - dados.minmax.min14)
        ).toFixed(2)
      )
      dados.estocastico.estocD = Number(
        ((dados.estocastico.estoc14 + conjunto.soma2k) / 3).toFixed(2)
      )
      dados.estocastico.estocD1 = Number(conjunto.estocd0.toFixed(2))
      dados.estocastico.estocLento = Number(
        ((conjunto.soma2d + dados.estocastico.estocD) / 3).toFixed(2)
      )
      dados.estocastico.estocLento1 = Number(conjunto.estocl0.toFixed(2))

      if (
        dados.estocastico.estocD > dados.estocastico.estocLento &&
        dados.estocastico.estocD1 < dados.estocastico.estocLento1
      ) {
        dados.estocastico.cruzaEstoc = 3
      } else if (
        dados.estocastico.estocD < dados.estocastico.estocLento &&
        dados.estocastico.estocD1 > dados.estocastico.estocLento1
      ) {
        dados.estocastico.cruzaEstoc = 1
      }

      resolve(dados)
    }
  })
}

function bandasBollinger(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (dados && conjunto) {
      dados.bollingerBands = BB.calculate({
        period: 20,
        values: conjunto.fechs.concat(dados.ult),
        stdDev: 2,
      }).pop()
      if (dados.bollingerBands) {
        dados.bollingerBands.tdp =
          (dados.bollingerBands.upper - dados.bollingerBands.middle) /
          2 /
          dados.bollingerBands.middle
      }

      resolve(dados)
    }
  })
}

function pontoDePivot(dados) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      dados.minmax.minant > 0 &&
      dados.minmax.maxant > 0 &&
      dados.pivotpoint
    ) {
      dados.pivotpoint.ppivot = Number(
        (
          (dados.minmax.minant + dados.minmax.maxant + dados.fechant) /
          3
        ).toFixed(2)
      )
      dados.pivotpoint.ppivotd = Number(
        (dados.minmax.maxant - dados.minmax.minant).toFixed(4)
      )
      dados.pivotpoint.supum = Number(
        (2 * dados.pivotpoint.ppivot - dados.minmax.maxant).toFixed(2)
      )
      dados.pivotpoint.supdois = Number(
        (
          dados.pivotpoint.ppivot -
          dados.minmax.maxant +
          dados.minmax.minant
        ).toFixed(2)
      )
      dados.pivotpoint.suptres = Number(
        (
          dados.minmax.minant -
          2 * (dados.minmax.maxant - dados.pivotpoint.ppivot)
        ).toFixed(2)
      )
      dados.pivotpoint.resum = Number(
        (2 * dados.pivotpoint.ppivot - dados.minmax.minant).toFixed(2)
      )
      dados.pivotpoint.resdois = Number(
        (
          dados.pivotpoint.ppivot +
          dados.minmax.maxant -
          dados.minmax.minant
        ).toFixed(2)
      )
      dados.pivotpoint.restres = Number(
        (
          dados.minmax.maxant +
          2 * (dados.pivotpoint.ppivot - dados.minmax.minant)
        ).toFixed(2)
      )

      dados.pivotpoint.supumf = Number(
        (dados.pivotpoint.ppivot - 0.382 * dados.pivotpoint.ppivotd).toFixed(2)
      )
      dados.pivotpoint.supdoisf = Number(
        (dados.pivotpoint.ppivot - 0.618 * dados.pivotpoint.ppivotd).toFixed(2)
      )
      dados.pivotpoint.resumf = Number(
        (dados.pivotpoint.ppivot + 0.382 * dados.pivotpoint.ppivotd).toFixed(2)
      )
      dados.pivotpoint.resdoisf = Number(
        (dados.pivotpoint.ppivot + 0.618 * dados.pivotpoint.ppivotd).toFixed(2)
      )

      dados.pivotpoint.ultsupum = Number(
        (dados.ult / dados.pivotpoint.supum - 1).toFixed(4)
      )
      dados.pivotpoint.ultsupdois = Number(
        (dados.ult / dados.pivotpoint.supdois - 1).toFixed(4)
      )
      dados.pivotpoint.ultsuptres = Number(
        (dados.ult / dados.pivotpoint.suptres - 1).toFixed(4)
      )
      dados.pivotpoint.ultresum = Number(
        (dados.ult / dados.pivotpoint.resum - 1).toFixed(4)
      )
      dados.pivotpoint.ultresdois = Number(
        (dados.ult / dados.pivotpoint.resdois - 1).toFixed(4)
      )
      dados.pivotpoint.ultrestres = Number(
        (dados.ult / dados.pivotpoint.restres - 1).toFixed(4)
      )

      dados.pivotpoint.ultsupumf = Number(
        (dados.ult / dados.pivotpoint.supumf - 1).toFixed(4)
      )
      dados.pivotpoint.ultsupdoisf = Number(
        (dados.ult / dados.pivotpoint.supdoisf - 1).toFixed(4)
      )
      dados.pivotpoint.ultsuptresf = Number(
        (dados.ult / dados.pivotpoint.supdois - 1).toFixed(4)
      )
      dados.pivotpoint.ultresumf = Number(
        (dados.ult / dados.pivotpoint.resumf - 1).toFixed(4)
      )
      dados.pivotpoint.ultresdoisf = Number(
        (dados.ult / dados.pivotpoint.resdoisf - 1).toFixed(4)
      )
      dados.pivotpoint.ultrestresf = Number(
        (dados.ult / dados.pivotpoint.resdois - 1).toFixed(4)
      )

      resolve(dados)
    }
  })
}

function larryWilliams(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      conjunto.fechs.length >= 20 &&
      dados.larry
    ) {
      dados.larry.mme9 = Number(
        ema(conjunto.fechs.concat(dados.ult), 9).pop().toFixed(2)
      )
      dados.larry.mme9d1 = Number(ema(conjunto.fechs, 9).pop().toFixed(2))
      dados.larry.mme9d2 = Number(
        ema(conjunto.fechs, 9)[conjunto.fechs.length - 2].toFixed(2)
      )
      dados.larry.mme9d3 = Number(
        ema(conjunto.fechs, 9)[conjunto.fechs.length - 3].toFixed(2)
      )
      if (
        dados.larry.mme9d2 > dados.larry.mme9d3 &&
        dados.larry.mme9d1 < dados.larry.mme9d2
      ) {
        dados.larry.viradaontem = 'Virou pra baixo'
        dados.larry.start91Venda = dados.minmax.minant - 0.01
        dados.larry.statusVenda =
          dados.min < dados.larry.start91Venda ? 'Ativou' : 'Aguardando'
        dados.larry.distAtivacao91V = Number(
          (dados.ult / dados.larry.start91Venda - 1).toFixed(4)
        )
      } else if (
        dados.larry.mme9d2 < dados.larry.mme9d3 &&
        dados.larry.mme9d1 > dados.larry.mme9d2
      ) {
        dados.larry.viradaontem = 'Virou pra cima'
        dados.larry.start91Compra = dados.minmax.maxant + 0.01
        dados.larry.statusCompra =
          dados.max > dados.larry.start91Compra ? 'Ativou' : 'Aguardando'
        dados.larry.distAtivacao91C = Number(
          (dados.ult / dados.larry.start91Compra - 1).toFixed(4)
        )
      }
      if (
        dados.larry.mme9d1 > dados.larry.mme9d2 &&
        dados.larry.mme9 < dados.larry.mme9d1
      ) {
        dados.larry.virada = 'Virando pra baixo'
      } else if (
        dados.larry.mme9d1 < dados.larry.mme9d2 &&
        dados.larry.mme9 > dados.larry.mme9d1
      ) {
        dados.larry.virada = 'Virando pra cima'
      }

      resolve(dados)
    }
  })
}

function agulhadaDidi(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      conjunto.fechs.length >= 20 &&
      dados.didi
    ) {
      dados.didi.med3d1 = Number(ma(conjunto.fechs, 3).pop().toFixed(4))
      dados.didi.med8d1 = Number(ma(conjunto.fechs, 8).pop().toFixed(4))
      dados.didi.med20d1 = Number(ma(conjunto.fechs, 20).pop().toFixed(4))
      dados.didi.med3 = Number(
        ma(conjunto.fechs.concat(dados.ult), 3).pop().toFixed(4)
      )
      dados.didi.med8 = Number(
        ma(conjunto.fechs.concat(dados.ult), 8).pop().toFixed(4)
      )
      dados.didi.med20 = Number(
        ma(conjunto.fechs.concat(dados.ult), 20).pop().toFixed(4)
      )

      if (dados.fechant !== dados.abeant) {
        if (
          (dados.didi.med3d1 > dados.abeant &&
            dados.didi.med3d1 < dados.fechant &&
            dados.didi.med8d1 > dados.abeant &&
            dados.didi.med8d1 < dados.fechant &&
            dados.didi.med20d1 > dados.abeant &&
            dados.didi.med20d1 < dados.fechant) ||
          (dados.didi.med3d1 < dados.abeant &&
            dados.didi.med3d1 > dados.fechant &&
            dados.didi.med8d1 < dados.abeant &&
            dados.didi.med8d1 > dados.fechant &&
            dados.didi.med20d1 < dados.abeant &&
            dados.didi.med20d1 > dados.fechant)
        ) {
          dados.didi.agulhadaOntem = 1
          if (
            dados.didi.med3 > dados.didi.med8 &&
            dados.didi.med8 > dados.didi.med20
          ) {
            dados.didi.operaDidi = 'Compra'
          } else if (
            dados.didi.med3 < dados.didi.med8 &&
            dados.didi.med8 < dados.didi.med20
          ) {
            dados.didi.operaDidi = 'Venda'
          } else {
            dados.didi.operaDidi = 'Aguardando'
          }
        }
      }
      if (dados.abe !== dados.ult) {
        if (
          (dados.didi.med3 > dados.abe &&
            dados.didi.med3 < dados.ult &&
            dados.didi.med8 > dados.abe &&
            dados.didi.med8 < dados.ult &&
            dados.didi.med20 > dados.abe &&
            dados.didi.med20 < dados.ult) ||
          (dados.didi.med3 < dados.abe &&
            dados.didi.med3 > dados.ult &&
            dados.didi.med8 < dados.abe &&
            dados.didi.med8 > dados.ult &&
            dados.didi.med20 < dados.abe &&
            dados.didi.med20 > dados.ult)
        ) {
          dados.didi.agulhandoHoje = 1
        }
      }

      resolve(dados)
    }
  })
}

function ifr(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      conjunto.fechs.length > 30 &&
      dados.ifr
    ) {
      dados.ifr.ifr2 = Number(
        RSI.calculate({ values: conjunto.fechs.concat(dados.ult), period: 2 })
          .pop()
          .toFixed(4)
      )
      dados.ifr.mme5 = Number(
        ma(conjunto.fechs.concat(dados.ult), 5).pop().toFixed(4)
      )
      dados.ifr.max2 = Number(
        Math.max(
          conjunto.maxs[conjunto.maxs.length - 1],
          conjunto.maxs[conjunto.maxs.length - 2]
        ).toFixed(4)
      )
      dados.ifr.min2 = Number(
        Math.min(
          conjunto.mins[conjunto.mins.length - 1],
          conjunto.mins[conjunto.mins.length - 2]
        ).toFixed(4)
      )
      if (dados.ifr.ifr2 < 20) {
        dados.ifr.ifr2stop = Number(
          (dados.ult - 1.3 * (dados.max - dados.min)).toFixed(2)
        )
      } else if (dados.ifr.ifr2 > 80) {
        dados.ifr.ifr2stop = Number(
          (dados.ult + 1.3 * (dados.max - dados.min)).toFixed(2)
        )
      }
      dados.ifr.ifr14 = Number(
        RSI.calculate({ values: conjunto.fechs.concat(dados.ult), period: 14 })
          .pop()
          .toFixed(4)
      )
      dados.ifr.ifr21 = Number(
        RSI.calculate({ values: conjunto.fechs.concat(dados.ult), period: 21 })
          .pop()
          .toFixed(4)
      )
    }

    resolve(dados)
  })
}

function mediasMoveis(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (dados && conjunto && conjunto.cod === dados.cod && dados.mediasmoveis) {
      dados.mediasmoveis.mme9 =
        conjunto.fechs.length > 9
          ? Number(ema(conjunto.fechs.concat(dados.ult), 9).pop().toFixed(4))
          : null
      dados.mediasmoveis.mma21 =
        conjunto.fechs.length > 21
          ? Number(ma(conjunto.fechs.concat(dados.ult), 21).pop().toFixed(4))
          : null
      dados.mediasmoveis.mma60 =
        conjunto.fechs.length > 60
          ? Number(ma(conjunto.fechs.concat(dados.ult), 60).pop().toFixed(4))
          : null
      dados.mediasmoveis.mma120 =
        conjunto.fechs.length > 120
          ? Number(ma(conjunto.fechs.concat(dados.ult), 120).pop().toFixed(4))
          : null
      dados.mediasmoveis.mma200 =
        conjunto.fechs.length > 200
          ? Number(ma(conjunto.fechs.concat(dados.ult), 200).pop().toFixed(4))
          : null
      dados.mediasmoveis.ultmme9 = dados.mediasmoveis.mme9
        ? Number((dados.ult / dados.mediasmoveis.mme9 - 1).toFixed(4))
        : null
      dados.mediasmoveis.ultmm21 = dados.mediasmoveis.mma21
        ? Number((dados.ult / dados.mediasmoveis.mma21 - 1).toFixed(4))
        : null
      dados.mediasmoveis.ultmm60 = dados.mediasmoveis.mma60
        ? Number((dados.ult / dados.mediasmoveis.mma60 - 1).toFixed(4))
        : null
      dados.mediasmoveis.ultmm120 = dados.mediasmoveis.mma120
        ? Number((dados.ult / dados.mediasmoveis.mma120 - 1).toFixed(4))
        : null
      dados.mediasmoveis.ultmm200 = dados.mediasmoveis.mma200
        ? Number((dados.ult / dados.mediasmoveis.mma200 - 1).toFixed(4))
        : null

      resolve(dados)
    }
  })
}

function trix(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      dados.trix &&
      conjunto.fechs
    ) {
      let arrayTrix = conjunto.fechs.slice(
        conjunto.fechs.length - 60,
        conjunto.fechs.length
      )
      let arrayTrixEma = TRIX.calculate({
        values: arrayTrix.concat(dados.ult),
        period: 7,
      })
      dados.trix.trixsete = Number(
        arrayTrixEma.slice(arrayTrixEma.length - 1, arrayTrixEma.length)
      )
      dados.trix.trix74 = Number(ma(arrayTrixEma, 4).pop())
      if (dados.trix.trixsete > dados.trix.trix74) {
        dados.trix.sinal = 'Comprado'
      } else if (dados.trix.trixsete < dados.trix.trix74) {
        dados.trix.sinal = 'Vendido'
      }

      resolve(dados)
    }
  })
}

function duploRompimento(dados) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      dados.dr &&
      dados.didi.med8 &&
      dados.didi.med20 &&
      dados.trix &&
      dados.estocastico
    ) {
      if (
        dados.min < dados.didi.med8 &&
        dados.min < dados.didi.med20 &&
        dados.max > dados.didi.med8 &&
        dados.max > dados.didi.med20 &&
        dados.ult > dados.didi.med8 &&
        dados.ult > dados.didi.med20
      ) {
        dados.dr.rompimento = 'Rompeu pra cima'
      } else if (
        dados.max > dados.didi.med8 &&
        dados.max > dados.didi.med20 &&
        dados.min < dados.didi.med8 &&
        dados.min < dados.didi.med20 &&
        dados.ult < dados.didi.med8 &&
        dados.ult < dados.didi.med20
      ) {
        dados.dr.rompimento = 'Rompeu pra baixo'
      }
      if (dados.dr.rompimento === 'Rompeu pra cima') {
        dados.dr.estocastico =
          dados.estocastico.estocD > dados.estocastico.estocLento
            ? 'Autoriza'
            : 'Aguarde'
      } else if (dados.dr.rompimento === 'Rompeu pra baixo') {
        dados.dr.estocastico =
          dados.estocastico.estocD < dados.estocastico.estocLento
            ? 'Autoriza'
            : 'Aguarde'
      }
      if (dados.dr.rompimento === 'Rompeu pra cima') {
        dados.dr.trix = dados.trix.sinal === 'Comprado' ? 'Autoriza' : 'Aguarde'
      } else if (dados.dr.rompimento === 'Rompeu pra baixo') {
        dados.dr.trix = dados.trix.sinal === 'Vendido' ? 'Autoriza' : 'Aguarde'
      }

      resolve(dados)
    }
  })
}

function acumDistAdl(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      dados.adl &&
      conjunto.fechs
    ) {
      let input = {
        high: conjunto.maxs.concat(dados.max),
        low: conjunto.mins.concat(dados.min),
        close: conjunto.fechs.concat(dados.ult),
        volume: conjunto.volume.concat(dados.volumes.vtt),
      }
      //console.log(conjunto.maxs.length);
      dados.adl.valores = ADL.calculate(input)
      dados.adl.ult = dados.adl.valores[dados.adl.valores.length - 1]
      dados.adl.maior = Math.max.apply(Math, dados.adl.valores)
      dados.adl.menor = Math.min.apply(Math, dados.adl.valores)
      if (
        dados.adl.menor < 0 &&
        dados.adl.maior > 0 &&
        dados.adl.menor !== dados.adl.ult
      ) {
        dados.adl.estocadl =
          100 *
          (((dados.adl.menor - dados.adl.ult) * -1) /
            (dados.adl.maior - dados.adl.menor))
      } else {
        dados.adl.estocadl =
          100 *
          ((dados.adl.ult - dados.adl.menor) /
            (dados.adl.maior - dados.adl.menor))
      }
      dados.adl.minprice120 = Math.min.apply(Math, input.low)
      dados.adl.maxprice120 = Math.max.apply(Math, input.high)
      dados.adl.estocPrice =
        100 *
        ((dados.ult - dados.adl.minprice120) /
          (dados.adl.maxprice120 - dados.adl.minprice120))
      dados.adl.estoc_price_adl = dados.adl.estocPrice - dados.adl.estocadl
      ////Ver quando média é negativa
      //a.adl.mediaadl = a.adl.reduce((t, n) => t + n, 0) / a.adl.length;
      //a.adl.medprice = input.close.reduce((t, n) => t + n, 0) / input.close.length;

      resolve(dados)
    }
  })
}

function macd(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      dados.macd &&
      conjunto.fechs.length > 30
    ) {
      let macdInput = {
        values: conjunto.fechs.concat(dados.ult),
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      }
      dados.macd.macd =
        MACD.calculate(macdInput)[MACD.calculate(macdInput).length - 1].MACD
      dados.macd.signal =
        MACD.calculate(macdInput)[MACD.calculate(macdInput).length - 1].signal
      dados.macd.histogram =
        MACD.calculate(macdInput)[
          MACD.calculate(macdInput).length - 1
        ].histogram
      dados.macd.histogramd1 =
        MACD.calculate(macdInput)[
          MACD.calculate(macdInput).length - 2
        ].histogram
      dados.macd.hist_ult = (dados.macd.histogram / dados.ult) * 100
      if (dados.macd.histogram > 0 && dados.macd.histogramd1 < 0) {
        dados.macd.viradaHistogram = 'Virou pra cima'
      } else if (dados.macd.histogram < 0 && dados.macd.histogramd1 > 0) {
        dados.macd.viradaHistogram = 'Virou pra baixo'
      }

      resolve(dados)
    }
  })
}

function obv(dados, conjunto) {
  return new Promise((resolve, reject) => {
    if (
      dados &&
      conjunto &&
      conjunto.cod === dados.cod &&
      dados.obv &&
      conjunto.fechs
    ) {
      let input = {
        close: conjunto.fechs.concat(dados.ult),
        volume: conjunto.volume.concat(dados.volumes.vtt),
      }
      dados.obv.valores = OBV.calculate(input)
      dados.obv.ult = dados.obv.valores[dados.obv.valores.length - 1]
      dados.obv.maior = Math.max.apply(Math, dados.obv.valores)
      dados.obv.menor = Math.min.apply(Math, dados.obv.valores)
      if (dados.obv.menor !== dados.obv.maior) {
        if (
          dados.obv.menor < 0 &&
          dados.obv.maior > 0 &&
          dados.obv.menor !== dados.obv.ult
        ) {
          dados.obv.estocobv =
            100 *
            (((dados.obv.menor - dados.obv.ult) * -1) /
              (dados.obv.maior - dados.obv.menor))
        } else {
          dados.obv.estocobv =
            100 *
            ((dados.obv.ult - dados.obv.menor) /
              (dados.obv.maior - dados.obv.menor))
        }
      }
      dados.obv.minprice120 = Math.min.apply(
        Math,
        conjunto.mins.slice(conjunto.mins.length - 119).concat(dados.min)
      )
      dados.obv.maxprice120 = Math.max.apply(
        Math,
        conjunto.maxs.slice(conjunto.maxs.length - 119).concat(dados.max)
      )
      dados.obv.estocPrice =
        100 *
        ((dados.ult - dados.obv.minprice120) /
          (dados.obv.maxprice120 - dados.obv.minprice120))
      dados.obv.estoc_price_obv = dados.obv.estocPrice - dados.obv.estocobv

      resolve(dados)
    }
  })
}

function candleStick(dados) {
  return new Promise((resolve, reject) => {
    if (dados) {
      dados.candleStick = {
        abe: dados.abe,
        ult: dados.ult,
        max: dados.max,
        min: dados.min,
      }

      resolve(dados)
    }
  })
}

module.exports = { calculos, calculosOpcao, calculosOpcoes }
