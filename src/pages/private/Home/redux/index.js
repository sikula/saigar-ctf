import createReducer from '@utils/reduxHelpers'

// ==== Constants
const UPDATE_TEAM_FILTER = 'UPDATE_TEAM_FILTER'
const UPDATE_DIRECTION_FILTER = 'UPDATE_DIRECTION_FILTER'

// ==== Initial State
const initialState = {
  teamFilter: [],
  direction: 'asc',
}

// ==== Reducer
export default createReducer(initialState, {
  [UPDATE_TEAM_FILTER]: (state, payload) =>
    Object.assign({}, state, {
      teamFilter: payload.teamFilter,
    }),
  [UPDATE_DIRECTION_FILTER]: (state, payload) =>
    Object.assign({}, state, {
      direction: payload.direction,
    }),
})

// ==== Actions
export const actions = {
  updateFilter: teamFilter => ({
    type: UPDATE_TEAM_FILTER,
    payload: {
      teamFilter,
    },
  }),
  updateDirection: direction => ({
    type: UPDATE_DIRECTION_FILTER,
    payload: {
      direction,
    },
  }),
}
