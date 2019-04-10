/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag'

export const GET_SCOREBOARD = gql`
  subscription getScoreboard {
    scoreboard(order_by: { total_points: desc }) {
      name
      total_points
      submission_count
    }
  }
`
