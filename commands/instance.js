const Sentencer = require('sentencer')
const { createInstance } = require('../lib/rundeck')
const toMattermost = require('../lib/mattermostFormatter')

const commandHandler = async (args, postMessage) => {
  const instanceName = Sentencer.make('{{ adjective }}{{ noun }}')
  await postMessage(toMattermost(`⏳ Creating instance ${instanceName}`))
  const { fqdn, passphrase } = await createInstance({
    instanceSuffix: instanceName
  })
  const instanceWithProtocol = `https://${fqdn}`
  const r = await postMessage(
    toMattermost({
      text: `✅ Now yours: ${instanceWithProtocol} | \`${passphrase}\``,
      attachments: {
        text: `Remember to delete the instance once you're done with it. Use \`/mororo remove ${instanceWithProtocol}\` or click the button below.`,
        actions: [
          {
            name: `Delete ${fqdn}`,
            integration: {
              url: 'https://mororo.now.sh/test',
              context: {
                action: 'do_something_ephemeral'
              }
            }
          }
        ]
      }
    })
  )
  console.log(await r.text());

  return `✅ Now yours: ${instanceWithProtocol} | \`${passphrase}\``
}

module.exports = {
  name: 'instance',
  options: {
    help: 'Creates a new test instance.'
  },
  arguments: [],
  handler: commandHandler
}
