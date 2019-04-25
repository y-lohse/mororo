const Sentencer = require('sentencer')
const { createInstance } = require('../lib/rundeck')
const toMattermost = require('../lib/mattermostFormatter')

const commandHandler = async (args, postMessage) => {
  const instanceName = Sentencer.make('{{ adjective }}{{ noun }}')
  await postMessage(toMattermost(`⏳ Creating instance ${instanceName}`))
  const { fqdn, passphrase } = await createInstance({
    instanceSuffix: instanceName
  })
  return toMattermost(`✅ Now yours: https://${fqdn} | \`${passphrase}\``)
}

module.exports = {
  name: 'instance',
  options: {
    help: 'Creates a new test instance.'
  },
  arguments: [],
  handler: commandHandler
}
