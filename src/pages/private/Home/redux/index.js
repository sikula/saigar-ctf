import createReducer from '@utils/reduxHelpers'

// ==== Constants
const UPDATE_FILTER = 'UPDATE_FILTER'

// ==== Initial State
const initialState = {
  teamFilter: [],
}

// ==== Reducer
export default createReducer(initialState, {
  [UPDATE_FILTER]: (state, payload) =>
    Object.assign({}, state, {
      teamFilter: payload.teamFilter,
    }),
})

// ==== Actions
export const actions = {
  updateFilter: teamFilter => ({
    type: UPDATE_FILTER,
    payload: {
      teamFilter,
    },
  }),
}
