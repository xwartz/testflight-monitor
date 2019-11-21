import https from 'https'

interface Options {
  readonly data: any
  readonly headers: any
  readonly hostname: string
  readonly method: string
  readonly path: string
  readonly port: number
}

const request = (options: Options) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (data) => {
        body += data
      })

      res.on('end', () => {
        resolve(body)
      })
    })

    req.on('error', (e) => {
      reject(e)
    })

    if (options.method === 'POST') {
      req.write(options.data)
    }
    req.end()
  })
}

export default request
