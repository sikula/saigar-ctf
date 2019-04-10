import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import history from './history'

// this really could use a better name
import teamReducer from '../../pages/Admin/Home/redux'

/*
    @Note[Peter]:
        Instead of importing each of the reducers manually, and because
        we have a reliable project structure, we can just grab and import
        the reducers by searching the Feature/Redux paths
*/
// const CONTEXT = require.context('../../features', true, /\.\/(.*)\/redux\/index.js?$/i)

// const importReducer = req => (obj, path) => {
//   const [, componentName] = path.match(/\.\/(.*)\/redux\/index.js?$/i)
//   const reducer = {
//     [componentName]: req(path).default,
//   }

//   return Object.assign({}, obj, reducer)
// }

// const getReducers = ctx => ctx.keys().reduce(importReducer(ctx), {})

// const rootReducer = reduceReducers(
//   combineReducers({
//     // ...getReducers(CONTEXT),
//     routing: routerReducer,
//   }),
// )

const rootReducer = asyncReducers =>
  combineReducers({
    ...asyncReducers,
    router: connectRouter(history),
    filter: teamReducer,
  })

export const injectAsyncReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer // eslint-disable-line no-param-reassign
  store.replaceReducer(rootReducer(store.asyncReducers))
}

export default rootReducer
