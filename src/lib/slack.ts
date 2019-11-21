import request from './request'

interface Params {
  readonly channel: string
  readonly reachedNum: number
  readonly removedNum: number
  readonly webhookUrl: string
}

const slack = (data: Params) => {
  const attachments = [{
    author_icon: 'https://developer.apple.com/assets/elements/icons/testflight/testflight-64x64.png',
    author_link: 'https://developer.apple.com/testflight/',
    author_name: 'Monitor',
    color: 'warning',
    fallback: `TestFlight - The number of testers reached ${data.reachedNum}`,
    fields: [{
      short: false,
      title: '🌚 what should we do?',
      value: `🌝 we deleted ${data.removedNum} guys!`,
    }],
    pretext: `TestFlight - The number of testers reached ${data.reachedNum}`,
    ts: Date.now(),
  }]

  const options = {
    data: `{'channel': ${data.channel}, 'username': 'Monitor', 'attachments': ${JSON.stringify(attachments)}}`,
    headers: {
      'Content-Type': 'application/json'
    },
    hostname: 'hooks.slack.com',
    method: 'POST',
    path: data.webhookUrl,
    port: 443,
  }

  console.log('slack', options)

  return request(options)
}

export default slack
