const { deleteInstance } = require('../lib/rundeck')
const { getFQDN } = require('../lib/url')
const toMattermost = require('../lib/mattermostFormatter')

const remove = async (args, postMessage) => {
  const instance = args.get('instance')
  const fqdn = getFQDN(instance)

  if (/^testauto/.test(fqdn)) {
    const instanceName = fqdn.split('.')[0]
    const instanceSuffix = instanceName.substr('testauto'.length)
    await postMessage(toMattermost(`⏳ About to delete instance ${instance}`))
    await deleteInstance({
      instanceSuffix
    })
    return toMattermost(`🗑 Deleted instance ${instance}`)
  } else {
    throw new Error('Not a test instance')
  }
}

module.exports = {
  name: 'remove',
  options: {
    help: 'Delete a test instance',
    aliases: ['delete']
  },
  arguments: [
    {
      name: 'instance',
      options: {
        help: 'URL of the instance'
      }
    }
  ],
  handler: remove
}
