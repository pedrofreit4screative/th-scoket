const calculator = require('business-days-calculator')
const calendar = require('holidays-calendar-brazil')
calculator.SetCalendar(calendar)

let tempoDecorrido = 1
let minutosDecorridos = 1
let leilao = false
let datacompleta = null
let mercadoAberto = false

const timeUso = {
  horaLeilao: '12:45:00',
  horaAbre: '13:00:00',
  horaFecha: '20:00:00',
  horaFechaLeilao: '21:00:00',
  atualizaSemana: '22:00:00',
}

async function calculaTempo() {
  let hoje = new Date()
  const diaUtil = calculator.IsBusinessDay(hoje)

  const dia = hoje.getDate()
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()

  datacompleta =
    mes.toString().length === 1 && dia.toString().length !== 1
      ? ano + '-' + 0 + mes + '-' + dia
      : mes.toString().length !== 1 && dia.toString().length === 1
      ? ano + '-' + mes + '-' + 0 + dia
      : mes.toString().length === 1 && dia.toString().length === 1
      ? ano + '-' + 0 + mes + '-' + 0 + dia
      : ano + '-' + mes + '-' + dia

  const horaAgora = Date.parse(hoje) + 10800000
  //console.log(format(horaAgora, "HH':'mm"));

  const hojeLeilao = Date.parse(datacompleta + 'T' + timeUso.horaLeilao)
  const hojeAbre = Date.parse(datacompleta + 'T' + timeUso.horaAbre)
  const hojeFecha = Date.parse(datacompleta + 'T' + timeUso.horaFecha)
  const hojeFechaLeilao = Date.parse(
    datacompleta + 'T' + timeUso.horaFechaLeilao
  )
  const horaAtualizaSemana = Date.parse(
    datacompleta + 'T' + timeUso.atualizaSemana
  )

  tempoDecorrido =
    horaAgora < hojeAbre || horaAgora > hojeFecha || !diaUtil
      ? 1
      : (Math.min(horaAgora, hojeFecha) - hojeAbre) / 25200000
  //console.log('TD', tempoDecorrido);
  minutosDecorridos = hoje.getMinutes() / 60

  if (horaAgora >= hojeLeilao && horaAgora <= hojeAbre && diaUtil) {
    leilao = true
  } else {
    leilao = false
  }

  if (horaAgora <= hojeAbre || horaAgora >= hojeFechaLeilao || !diaUtil) {
    mercadoAberto = false
  } else {
    mercadoAberto = true
  }

  return {
    tempoDecorrido,
    minutosDecorridos,
    leilao,
    mercadoAberto,
  }
}

calculaTempo()

module.exports = {
  calculaTempo,
  tempoDecorrido,
  minutosDecorridos,
  leilao,
}
