const Faker = require('faker')

const categories = [
  'c4d7f7e2-970b-4b22-8d51-5ceb5a864abb',
  'e3a5dcc5-8923-40e0-8dec-6a17812fe224',
  'fd33d39f-3e17-4ac7-b681-87c08703bfec',
  '01cf495e-6572-4edf-a45a-274c74dfade6',
  '72560fcc-c411-4e68-9514-782260d9f379',
  '6b533e93-a1da-4673-8305-941e90d3654a',
  '102325e9-01e8-4909-8324-9135085cdb0a',
  'dfd242f9-8428-4585-b765-77c10739f08b',
  'a196ebfe-3425-461f-80ef-2b8a5d6844cf',
]

function generateRandomData(userContext, events, done) {
  const { url } = Faker.internet
  const explanation = Faker.lorem.sentence
  const category = categories[Math.floor(Math.random() * categories.length)]

  userContext.vars.url = url
  userContext.vars.explanation = explanation
  userContext.vars.category = category

  return done()
}

module.exports = {
  generateRandomData,
}
