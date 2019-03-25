import React from 'react'
import { Query } from 'react-apollo'
import { Tabs, Tab, Card, Elevation } from '@blueprintjs/core'

import ScoreGraph from '../../../features/ScoreGraph'
import { HOME_QUERY } from './graphql/adminQueries'
import Can from '../../../_Common/components/AuthContext/Can'

import './index.scss'

class Countdown extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const date = this.calculateCountdown(this.props.date)
      date ? this.setState(date) : this.stop()
    }, 1000)
  }

  componentWillUmount() {
    this.stop()
  }

  calculateCountdown(endDate) {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000

    // clear countdown when date is reached
    if (diff <= 0) return false

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
      millisec: 0,
    }

    // calculate time difference between now and expected date
    if (diff >= 365.25 * 86400) {
      // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400))
      diff -= timeLeft.years * 365.25 * 86400
    }
    if (diff >= 86400) {
      // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400)
      diff -= timeLeft.days * 86400
    }
    if (diff >= 3600) {
      // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600)
      diff -= timeLeft.hours * 3600
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60)
      diff -= timeLeft.min * 60
    }
    timeLeft.sec = diff

    return timeLeft
  }

  stop() {
    clearInterval(this.interval)
  }

  addLeadingZeros(value) {
    value = String(value)
    while (value.length < 2) {
      value = `0${value}`
    }
    return value
  }

  render() {
    const countDown = this.state

    return (
      <div className="Countdown" style={{ textAlign: 'center' }}>
        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.days)}
            </span>
            <span>{countDown.days === 1 ? 'Day' : 'Days'}</span>
          </span>
        </span>

        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.hours)}
            </span>
            <span>Hours</span>
          </span>
        </span>

        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.min)}
            </span>
            <span>Min</span>
          </span>
        </span>

        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.sec)}
            </span>
            <span>Sec</span>
          </span>
        </span>
      </div>
    )
  }
}

const HomePageData = () => (
  <Query query={HOME_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <div>Loading...</div>
      if (error) return <div>Error: `${error.message}`</div>

      const eventName = data.event[0].name
      const startTime = new Date(data.event[0].start_time)

      return (
        <div>
          <div className="row" style={{ marginBottom: '10px' }}>
            <div style={{ padding: '1rem', display: 'inline-flex', flexGrow: 1 }}>
              <div className="col-xs">
                <Card
                  elevation={Elevation.ONE}
                  style={{ backgroundColor: '#FFFFFF', color: '#394B59', height: '100%' }}
                >
                  <h1 style={{ color: '#5C7080', fontWeight: '350', textAlign: 'center' }}>
                    Welcome, Admin!
                  </h1>
                  {/* <h3 style={{ color: '#738694', fontWeight: 'normal', textAlign: 'center' }}>
                    Please review the following cases
                  </h3> */}
                </Card>
              </div>

              <div className="col-xs">
                <Card
                  elevation={Elevation.ONE}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#394B59',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    flexDirection: 'column',
                  }}
                >
                  <h1 style={{ color: '#5C7080', fontWeight: '350', textAlign: 'center' }}>
                    {eventName}
                  </h1>
                  <Countdown date={startTime} />
                </Card>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginBttom: '10px' }}>
            <div className="col-xs">
              <div style={{ padding: '1em' }}>
                <Tabs id="homePageTabs" animate>
                  <Tab id="scoreboard" title="Scoreboard" panel={<ScoreGraph dark={false} />} />
                  <Tab id="statistics" title="Statistics" panel={<div>nothing yet</div>} />
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      )
    }}
  </Query>
)

const HomePage = () => <Can role={'ctf_admin' || 'judge'} yes={() => <HomePageData />} />

export default HomePage
