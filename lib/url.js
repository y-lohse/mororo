const url = require('url')

const parseURL = input => {
  if (!/^http(s):\/\//.test(input)) input = `https://${input}`

  return url.parse(input)
}

const getFQDN = instance => {
  const parsed = parseURL(instance)
  return parsed.host
}

const insertSluginUrl = (instance, slug) => {
  const parsed = parseURL(instance)
  const segments = parsed.host.split('.')
  segments[0] += `-${slug}`

  return `${parsed.protocol}//${segments.join('.')}`
}

module.exports = {
  parseURL,
  getFQDN,
  insertSluginUrl
}
