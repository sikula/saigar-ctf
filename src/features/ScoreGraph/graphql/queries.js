/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag'

export const GET_SCOREGRAPH = gql`
  subscription getScoreGraph {
    scoreGraph: score_graph(order_by: { submitted_at: asc }) {
      name
      points
      submitted_at
    }
  }
`
