const isString = require('lodash/isString')

module.exports = fieldsOrText => {
  const fields = isString(fieldsOrText) ? { text: fieldsOrText } : fieldsOrText
  return {
    mattermost: {
      ...fields
    }
  }
}
