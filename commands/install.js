const { upgradeApp } = require('../lib/rundeck')
const { getFQDN, insertSluginUrl } = require('../lib/url')

const commandHandler = async (args, postMessage) => {
  const source = args.get('source')
  const slug = args.get('slug')
  const instance = args.get('instance')
  const fqdn = getFQDN(instance)

  await postMessage(`⏳ Installing ${slug} on ${instance}`)
  await upgradeApp({
    instance: fqdn,
    slug,
    source
  })
  const appURL = insertSluginUrl(instance, slug)
  return `✅ Ready to test: ${appURL}`
}

module.exports = {
  name: 'install',
  options: {
    help: 'Installs or updates an app on an instance'
  },
  arguments: [
    {
      name: 'source',
      options: {
        help: 'Can be a link to an archive or a registry version'
      }
    },
    {
      name: 'instance',
      options: {
        help: 'URL of the instance to install the app on'
      }
    },
    {
      name: '--slug',
      options: {
        required: true,
        help: 'Slug to use for the app'
      }
    }
  ],
  handler: commandHandler
}
