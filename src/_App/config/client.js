import { ApolloClient } from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { ApolloLink, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'

import cookie from 'react-cookies'

const cache = new InMemoryCache({
  addTypename: false,
})

const GRAPHQL_ENDPOINT = `${process.env.HASURA_HTTP_ENDPOINT}`
const WEBSOCKET_ENDPOINT = `${process.env.HASURA_WSS_ENDPOINT}`

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
})

export const wsClient = new SubscriptionClient(WEBSOCKET_ENDPOINT, {
  reconnect: true,
  timeout: 30000,
  connectionParams: () => {
    return {
      headers: {
        ...(cookie.load('saigar:id_token') && {
          Authorization: `Bearer ${cookie.load('saigar:id_token')}`,
        }),
      },
    }
  },
})

const wsLink = new WebSocketLink(wsClient)

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...(cookie.load('saigar:id_token') && {
      Authorization: `Bearer ${cookie.load('saigar:id_token')}`,
    }),
  },
}))

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)

    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink),
)

const link = ApolloLink.from([terminatingLink])

const configureClient = () =>
  new ApolloClient({
    link,
    cache,
  })

export default configureClient
