const Faker = require('faker')

const categories = [
  'bb4550ea-3217-4c47-a225-4e95d06e5cf8',
  'b4fbf505-2a03-47e4-b9c3-ce4c7d94bc3d',
  '70e2096f-2517-4c36-baef-79a651ff5cd9',
  'c5303458-aef7-4013-ba09-248edbd40c49',
  'e5b16aad-de59-4b75-8299-30b9c49f4004',
  'ee9fecc8-1959-4b21-9843-e841aa540b8f',
  '2721aa5f-4b5a-4a99-a20d-f6ef50cfcdfa',
  '222a8e35-de0a-436c-9a9a-438c7b5a7c3b',
  '0f576cf8-c942-4015-8cbc-d8862d42389c',
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
