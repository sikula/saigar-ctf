/* eslint-disable import/prefer-default-export */
import gql from 'graphql-tag'

export const GET_SCOREGRAPH = gql`
  query getScoreGraph($eventID: uuid!) {
    scoreGraph: score_graph(order_by: { submitted_at: asc }, where: { uuid: { _eq: $eventID } }) {
      name
      points
      submitted_at
    }
  }
`
