import { Client } from 'pg'

class DataBase {
  private client: Client

  constructor() {
    this.client = new Client({
      host: process.env.POSTGRESS_HOST,
      port: parseInt(process.env.POSTGRESS_PORT),
      user: process.env.POSTGRESS_USER,
      password: process.env.POSTGRESS_PASS,
      database: process.env.POSTGRESS_DB,
    })
    this.client
      .connect()
      .then(() => console.log('[DATABASE-POSTGRES] Connected!'))
      .catch((err) => console.log('[DATABASE-POSTGRES] Error connect: ' + err))
  }

  select<T>(table: string, type: 'ATIVO' | 'OPCAO'): Promise<T> {
    return new Promise((resolve, reject) => {
      this.client.query(
        `SELECT * from ${table} ${
          type === 'OPCAO'
            ? `WHERE familia is not null`
            : `WHERE familia is null`
        }`,
        (err, res) => {
          if (err) throw new Error(err.message)
          // @ts-ignore
          resolve(res.rows)
        }
      )
    })
  }
}

export default DataBase
