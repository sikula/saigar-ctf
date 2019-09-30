/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag'

export const GET_SCOREBOARD = gql`
  subscription getScoreboard($eventID: uuid!) {
    scoreboard(order_by: { total_points: desc }, where: { event_id: { _eq: $eventID } }) {
      name
      total_points
      submission_count
    }
  }
`
