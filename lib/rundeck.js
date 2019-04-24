const fetch = require('node-fetch')
const xml = require('fast-xml-parser')
const get = require('lodash/get')

const RUNDECK_TOKEN = process.env.RUNDECK_TOKEN
const RUNDECK_URL = process.env.RUNDECK_URL

const callRundeck = async (path, body) => {
  const result = await fetch(`${RUNDECK_URL}${path}`, {
    method: 'POST',
    headers: {
      'X-Rundeck-Auth-Token': RUNDECK_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (result.ok) {
    return result.text()
  } else {
    throw new Error(await result.text())
  }
}

const createInstance = async ({
  instanceSuffix,
  environment = 'stg',
  locale = 'en'
}) => {
  const jobId = '7170b8bc-10d2-4099-b424-8e194a5d5884'
  const result = await callRundeck(`/api/27/job/${jobId}/run`, {
    argString: `-commitid ${instanceSuffix} -environment ${environment} -locale ${locale}`
  })
  const parsed = xml.parse(result, {
    ignoreAttributes: false
  })
  const execId = get(parsed, 'executions.execution.@_id')

  if (!execId) throw new Error('No execution id in job response')

  const executionLogs = await waitForExecutionEnd(execId)
  const fqdn = executionLogs
    .find(log => /^instance_fqdn/.test(log))
    .match(/\s.+$/)[0]
    .trim()
  const passphrase = executionLogs
    .find(log => /^passphrase/.test(log))
    .match(/\s.+$/)[0]
    .trim()

  return { fqdn, passphrase }
}

const deleteInstance = async ({ instanceSuffix, environment = 'stg' }) => {
  const jobId = 'c11109ae-6690-4b9f-9471-e8d74e0e0b3c'
  const result = await callRundeck(`/api/27/job/${jobId}/run`, {
    argString: `-commitid ${instanceSuffix} -environment ${environment}`
  })
  const parsed = xml.parse(result, {
    ignoreAttributes: false
  })
  const execId = get(parsed, 'executions.execution.@_id')

  if (!execId) throw new Error('No execution id in job response')

  return waitForExecutionEnd(execId)
}

const upgradeApp = async ({ instance, slug, source }) => {
  const jobId = '8d452c26-5a39-4162-b3b8-4da5efdf0b76'
  const result = await callRundeck(`/api/27/job/${jobId}/run`, {
    argString: `-instance ${instance} -slug ${slug} -source ${source}`
  })
  const parsed = xml.parse(result, {
    ignoreAttributes: false
  })
  const execId = get(parsed, 'executions.execution.@_id')

  if (!execId) throw new Error('No execution id in job response')

  return waitForExecutionEnd(execId, { ignoreSubErrors: true })
}

const checkJobStatus = async executionId => {
  const result = await callRundeck(`/api/27/execution/${executionId}/output`)
  const parsed = xml.parse(result, {
    ignoreAttributes: false
  })
  return parsed
}

const sleep = duration => new Promise(resolve => setTimeout(resolve, duration))

const waitForExecutionEnd = async (
  executionId,
  { ignoreSubErrors, retry } = { ignoreSubErrors: false, retry: 7 }
) => {
  const result = await checkJobStatus(executionId)
  const status = get(result, 'output.execState')
  if (status === 'succeeded') {
    const entry = get(result, 'output.entries.entry')
    const logs = entry.map(log => get(log, '@_log'))
    const hasErrors = entry.find(log => get(log, '@_level') === 'ERROR')

    if (hasErrors && !ignoreSubErrors)
      throw new Error(`Execution failed (${logs.join('\n')})`)
    else return logs
  } else if (status === 'failed') {
    console.warn('job failed')
    console.log(require('util').inspect(result, { depth: null }))
    throw new Error('Execution failed (top level)')
  } else if (retry <= 0) {
    throw new Error('Execution did not finish in time')
  } else {
    await sleep(1000 * 2)
    retry--
    return waitForExecutionEnd(executionId, { ignoreSubErrors, retry })
  }
}

module.exports = {
  createInstance,
  deleteInstance,
  upgradeApp
}
