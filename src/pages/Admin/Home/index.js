/* eslint-disable no-return-assign */
/* eslint-disable react/no-multi-comp */
/* eslint-disable class-methods-use-this, no-unused-expressions */
import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

// Styles
import { Tabs, Tab, Card, Elevation } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import ScoreGraph from '../../../features/ScoreGraph'
import { HOME_QUERY } from './graphql/adminQueries'
import Can from '../../../shared/components/AuthContext/Can'
import { AuthConsumer } from '../../../shared/components/AuthContext/context'

import './index.scss'

import CountdownClock from './components/CountdownClock'
import TeamsTab from './components/TeamsTab'
import CasesTab from './components/CasesTab'
import HistoryTab from './components/HistoryTab'

const HomePageData = () => (
  <Query query={HOME_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <div>Loading...</div>
      if (error) return <div>Error: `${error.message}`</div>

      if (!Array.isArray(data.event) || !data.event.length) {
        return <div>No Created Events</div>
      }

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
                  <CountdownClock date={startTime} />
                </Card>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginBttom: '10px' }}>
            <div className="col-xs">
              <div style={{ padding: '1em' }}>
                <Can
                  allowedRole={['ctf_admin']}
                  yes={() => (
                    <Tabs id="homePageTabs" renderActiveTabPanelOnly animate>
                      <Tab id="teams" title="Teams" panel={<TeamsTab />} />
                      <Tab id="cases" title="Cases" panel={<CasesTab />} />
                      <Tab id="scoreboard" title="Scoreboard" panel={<ScoreGraph dark={false} />} />
                      <Tab id="history" title="History" panel={<HistoryTab />} />
                    </Tabs>
                  )}
                />
                <Can
                  allowedRole={['judge']}
                  yes={() => (
                    <Tabs id="homePageTabs" renderActiveTabPanelOnly animate>
                      <Tab id="cases" title="Cases" panel={<CasesTab />} />
                      <Tab id="scoreboard" title="Scoreboard" panel={<ScoreGraph dark={false} />} />
                      <Tab id="history" title="History" panel={<HistoryTab />} />
                    </Tabs>
                  )}
                />
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
