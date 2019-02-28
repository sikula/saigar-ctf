import { ApolloClient } from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
// import { withClientState } from 'apollo-link-state'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { ApolloLink, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'

// import {
//   updateVisibilityFilter,
//   toggleFeedPanel,
//   toggleSettingsPanel,
// } from '@pages/Home/graphql/Resolvers/visibilityFilter'

const cache = new InMemoryCache({
  addTypename: false,
})

const GRAPHQL_ENDPOINT = 'https://saigar-ctf-heroku.herokuapp.com/v1alpha1/graphql'
const WEBSOCKET_ENDPOINT = 'wss://saigar-ctf-heroku.herokuapp.com/v1alpha1/graphql'

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
})

const wsLink = new WebSocketLink(
  new SubscriptionClient(WEBSOCKET_ENDPOINT, {
    reconnect: true,
    timeout: 30000,
    lazy: true,
    connectionParams: {
      headers: {
        authorization: `Bearer ${localStorage.getItem('id_token') || ''}`,
      },
    },
  }),
)

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: `Bearer ${localStorage.getItem('id_token') || ''}`,
  },
}))

// const stateLink = withClientState({
//   cache,
//   defaults: {
//     visibilityFilter: 'SHOW_ALL',
//     isFeedVisible: false,
//     isSettingsVisible: false,
//   },
//   resolvers: {
//     Mutation: {
//       updateVisibilityFilter,
//       toggleFeedPanel,
//       toggleSettingsPanel,
//     },
//   },
// })

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
