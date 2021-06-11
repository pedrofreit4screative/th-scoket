import Ativo from '../interfaces/ativo'
import Opcao from '../interfaces/options'
import { Redis } from '../utils/redis'

const redis = new Redis()

export const ativoOuOpcao = async (
  item: Ativo | Opcao,
  callBackAtivo: (ativo: Ativo) => void,
  callBackOpcao: (opcao: Opcao) => void
) => {
  const ativos = await redis.getCache<Ativo[]>('ativos')
  const opcoes = await redis.getCache<Opcao[]>('opcao')

  ativos.forEach(async (ativo) => {
    if (ativo.cod === item.cod) {
      await callBackAtivo(item)
      return
    }
  })

  opcoes.forEach(async (opcao) => {
    if (opcao.cod === item.cod) {
      await callBackOpcao(opcao)
      return
    }
  })
}

//export const
