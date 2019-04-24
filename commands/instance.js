const Sentencer = require('sentencer')
const { createInstance } = require('../lib/rundeck')

const commandHandler = async (args, postMessage) => {
  const instanceName = Sentencer.make('{{ adjective }}{{ noun }}')
  await postMessage(`⏳ Creating instance ${instanceName}`)
  const { fqdn, passphrase } = await createInstance({
    instanceSuffix: instanceName
  })
  return `✅ Now yours: https://${fqdn} | \`${passphrase}\``
}

module.exports = {
  name: 'instance',
  options: {
    help: 'Creates a new test instance.'
  },
  arguments: [],
  handler: commandHandler
}
