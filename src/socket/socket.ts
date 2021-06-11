import Ativo from '../interfaces/ativo'
import Opcao from '../interfaces/options'
import NetHttp from '../net/server'

export const send = (
  type: string,
  ac: Ativo | Opcao | Ativo[] | Opcao[] | {}
): void => {
  NetHttp.io.emit(type, ac)
}
