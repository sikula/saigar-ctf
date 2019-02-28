import React from 'react'
import { Subscription } from 'react-apollo'
import FlipMove from 'react-flip-move'

import { GET_SCOREBOARD } from '../graphql/queries'

const TeamList = ({ teams }) => (
  <FlipMove typeName="tbody" leaveAnimation="accordionVertical" duration={500}>
    {teams.map((team, index) => {
      const team_name = team.name
      const team_points = team.total_points
      const team_submissions = team.submission_count
      return (
        <tr key={`${team.name}-${index}`}>
          <td>{index + 1}</td>
          <td>{team_name}</td>
          <td>{team_submissions}</td>
          <td>{team_points}</td>
        </tr>
      )
    })}
  </FlipMove>
)

const ScoreBoard = () => (
  <Subscription subscription={GET_SCOREBOARD}>
    {({ data, loading, error }) => {
      if (!data) return null
      if (loading) {
        return <div>Loading...</div>
      }

      if (error) return <div>`${error.message}`</div>

      return (
        <table style={{ width: '100%', marginTop: 20 }}>
          <thead>
            <tr>
              <th>Place</th>
              <th>Team Name</th>
              <th>Submissions</th>
              <th>Points</th>
            </tr>
          </thead>
          <TeamList teams={data.scoreboard} />
        </table>
      )
    }}
  </Subscription>
)

export default ScoreBoard
