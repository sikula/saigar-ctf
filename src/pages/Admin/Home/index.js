/* eslint-disable class-methods-use-this, no-unused-expressions */
import React from 'react'
import PropTypes from 'prop-types'
import { Query, Mutation, Subscription } from 'react-apollo'
import { Tabs, Tab, Card, Elevation, Tag, Button, H5, HTMLSelect } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

import ScoreGraph from '../../../features/ScoreGraph'
import { HOME_QUERY, SUBMISSION_HISTORY, PROCESS_SUBMISSION } from './graphql/adminQueries'
import Can from '../../../shared/components/AuthContext/Can'
import { AuthConsumer } from '../../../shared/components/AuthContext/context'

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
      const { date: dateProp } = this.props
      const date = this.calculateCountdown(dateProp)
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
    let newValue = String(value)
    while (newValue.length < 2) {
      newValue = `0${newValue}`
    }
    return newValue
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

Countdown.propTypes = {
  date: PropTypes.objectOf(Date).isRequired,
}

const HistoryData = () => (
  <Subscription subscription={SUBMISSION_HISTORY}>
    {({ data, loading, error }) => {
      if (loading) return <div> Loading... </div>
      if (error) return <div>Error: `${error.message}`</div>

      return data.event[0].submissions.map(submission => (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ width: '100%', display: 'inline-flex' }}>
            <div style={{ flexGrow: 1 }}>
              <H5>{submission.processed}</H5>
              {/* <Tag>
                <strong>Submitted By: </strong>
                {submission.teamByteamId.name}
              </Tag>
              <Tag>{submission.submissionConfigurationByconfigId.category}</Tag> */}
              {/* {submission.case.name} */}
            </div>
            <div>
              <HTMLSelect>
                <option>Hi</option>
              </HTMLSelect>
            </div>
          </div>
          <code style={{ background: '#cdcdcd' }}>
            <p>{submission.content}</p>
            <p>{submission.explanation}</p>
          </code>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Tag large style={{ marginRight: 10 }}>
                <strong>Team: </strong>
                {submission.teamByteamId.name}
              </Tag>
              <Tag large style={{ marginRight: 10 }}>
                <strong>Case: </strong>
                {submission.case.name}
              </Tag>
              <Tag large>
                <strong>Category: </strong>
                {submission.submissionConfigurationByconfigId.category}
              </Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Mutation mutation={PROCESS_SUBMISSION}>
                {updateSubmission => (
                  <Button
                    intent="success"
                    large
                    icon={IconNames.TICK}
                    style={{ marginRight: 10 }}
                    onClick={() =>
                      updateSubmission({
                        variables: {
                          submissionID: submission.uuid,
                          value: 'ACCEPTED',
                          processedAt: new Date(),
                        },
                      })
                    }
                  >
                    Approve
                  </Button>
                )}
              </Mutation>
              <Mutation mutation={PROCESS_SUBMISSION}>
                {updateSubmission => (
                  <Button
                    intent="danger"
                    large
                    icon={IconNames.CROSS}
                    onClick={() =>
                      updateSubmission({
                        variables: {
                          submissionID: submission.uuid,
                          value: 'REJECTED',
                          processedAt: new Date(),
                        },
                      })
                    }
                  >
                    Reject
                  </Button>
                )}
              </Mutation>
            </div>
          </div>
        </Card>
      ))
    }}
  </Subscription>
)

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
                  <AuthConsumer>
                    {({ user }) => (
                      <h1 style={{ color: '#5C7080', fontWeight: '350', textAlign: 'center' }}>
                        Welcome, {user.nickname}!
                      </h1>
                    )}
                  </AuthConsumer>
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

          <div className="row" style={{ marginBttom: '10px', overflowY: 'scroll' }}>
            <div className="col-xs">
              <div style={{ padding: '1em' }}>
                <Tabs id="homePageTabs" renderActiveTabPanelOnly animate>
                  <Tab id="scoreboard" title="Scoreboard" panel={<ScoreGraph dark={false} />} />
                  <Tab id="history" title="History" panel={<HistoryData />} />
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      )
    }}
  </Query>
)

const HomePage = () => <Can allowedRole={['ctf_admin', 'judge']} yes={() => <HomePageData />} />

export default HomePage