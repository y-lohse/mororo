const ArgumentParser = require('argparse').ArgumentParser
const instance = require('../commands/instance')
const install = require('../commands/install')
const remove = require('../commands/remove')

const parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description: '',
  debug: true,
  prog: 'mororo'
})

const subparsers = parser.addSubparsers({
  title: 'subcommands',
  dest: 'command'
})

const subcommands = { instance, install, remove }
for (const [name, subcommand] of Object.entries(subcommands)) {
  const subparser = subparsers.addParser(subcommand.name, subcommand.options)
  subcommand.arguments.forEach(arg => {
    subparser.addArgument(arg.name, arg.options)
  })
  subparser.setDefaults({ handler: name })
}

module.exports = async (input, postMessage) => {
  const parsed = parser.parseArgs(input.split(' '))
  const command = parsed.get('handler')
  return await subcommands[command].handler(parsed, postMessage)
}
