import React from 'react'

import { ApolloProvider } from 'react-apollo'
import { Provider } from 'react-redux'
import { hot } from 'react-hot-loader'

import Auth from '@common/components/AuthContext'

import { SlidingPanelRoot, SlidingPanelProvider } from './_Common/components/SlidingPane'

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
      <Provider store={store}>
        <SlidingPanelProvider>
          {routes}
          <SlidingPanelRoot />
        </SlidingPanelProvider>
      </Provider>
    </ApolloProvider>
  </Auth>
)

export default hot(module)(App)
