/* eslint-disable no-plusplus, no-param-reassign */
import React from 'react'
import PropTypes from 'prop-types'
import { H5 } from '@blueprintjs/core'
import { Query, Subscription } from 'react-apollo'
import gql from 'graphql-tag'

import Chart from 'react-apexcharts'

import { GET_SCOREGRAPH } from '../graphql/queries'

/* Example of the format required for the score graph:
  [
      {
          name: 'teamname1',
          data: [{ x: 'time', y: score}, { x: 'time', y: score}]
      },
      {
          name: 'teamname2',
          data: [{ x: 'time', y: score}, { x: 'time', y: score}]
      },
  ]
*/
const transformData = data => {
  const result = data.reduce((r, a) => {
    r[a.name] = r[a.name] || []
    r[a.name].push({ y: a.points, x: a.submitted_at })

    return r
  }, Object.create(null))

  const teamSeries = []
  Object.keys(result).forEach(key => {
    let teamTotal = 0
    for (let i = 0; i < result[key].length; i++) {
      teamTotal += result[key][i].y
      result[key][i].y = teamTotal
    }
    teamSeries.push({ name: key, data: result[key] })
  })

  return teamSeries
}

const createChartOptions = theme => ({
  chart: {
    id: 'line',
  },
  theme: {
    palette: theme === 'dark' ? 'palette4' : 'palette1',
  },
  toolbar: {
    show: false,
  },
  markers: {
    size: 4,
    hover: { size: 8 },
  },
  stroke: {
    curve: 'smooth',
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    labels: {
      colors: theme === 'dark' ? '#FFF' : undefined,
    },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: {
        colors: theme === 'dark' ? '#FFF' : undefined,
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        color: theme === 'dark' ? '#FFF' : undefined,
      },
    },
  },
  grid: {
    show: true,
    xaxis: {
      lines: { show: true },
    },
    yaxis: {
      lines: { show: true },
    },
    borderColor: theme === 'dark' ? '#365369' : '#cdcdcd',
  },
})


const EVENT_QUERY = gql`
  query eventQuery {
    event(order_by: { start_time: desc }, limit: 1) {
      uuid
    }
  }
`

const ScoreGraph = ({ dark }) => (
  <Query query={EVENT_QUERY}>
    {({ loading, error, data: eventData }) => !loading ? <Subscription subscription={GET_SCOREGRAPH} variables={{ eventID: eventData.event[0].uuid }}>
    {({ data, loading, error }) => {
      console.log(error)
      if (!data) return null
      if (loading) {
        return <div>Loading...</div>
      }

      if (error) return <div>`${error.message}`</div>

      const teamSeries = transformData(data.scoreGraph)

      return (
        <div
          style={{
            background: dark ? 'linear-gradient(#354450, #394B59)' : undefined,
          }}
        >
          <div style={{ padding: '1em' }}>
            <Chart
              options={createChartOptions(dark && 'dark')}
              series={teamSeries}
              type="line"
              width="100%"
              height={450}
            />
          </div>
        </div>
      )
    }}
  </Subscription> : null}
  </Query>
)

ScoreGraph.propTypes = {
  dark: PropTypes.bool.isRequired,
}

export default ScoreGraph
