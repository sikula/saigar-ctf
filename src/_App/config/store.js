import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'

import rootReducer from './reducer'
import history from './history'

const middleware = routerMiddleware(history)

const debugware = []
// if (process.env.NODE_ENV !== 'production') {
//   const createLogger = require('redux-logger')

//   debugware.push(
//     createLogger({
//       collapsed: true,
//     }),
//   )
// }

const configureStore = initialState => {
  const store = createStore(
    rootReducer(),
    initialState,
    applyMiddleware(middleware, ...debugware),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), // eslint-disable-line no-underscore-dangle, no-undef
  )

  if (module.hot) {
    module.hot.accept('./reducer', () => {
      const nextRootReducer = require('./reducer').default // eslint-disable-line global-require

      store.replaceReducer(nextRootReducer)
    })
  }

  // @NOTE(Peter):  Async reducers are used for code splitting
  // see here (https://medium.com/@svyat770/fast-as-never-before-code-splitting-with-react-suspense-lazy-router-redux-webpack-4-d55a95970d11)
  store.asyncReducers = {}

  return store
}

export default configureStore()
