import React from 'react'

import { ApolloProvider } from 'react-apollo'
import { Provider } from 'react-redux'
import { hot } from 'react-hot-loader'

import Auth from '@shared/components/AuthContext'

import configureRoutes from '@app/config/routes'
import configureClient from '@app/config/client'
import configureStore from '@app/config/store'

import './App.css'

const routes = configureRoutes()
const client = configureClient()
const store = configureStore

const App = () => (
  <Auth>
    <ApolloProvider client={client}>
      <Provider store={store}>{routes}</Provider>
    </ApolloProvider>
  </Auth>
)

export default hot(module)(App)
