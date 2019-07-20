/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
import React from 'react'

// Styles
import { Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom imports
import { SlidingPanelConsumer } from '@shared/components/SlidingPane'
import { PanelProvider, PanelRoot } from '@shared/components/Panel'
import Can from '@shared/components/AuthContext/Can'
import SubmissionList from './Feed'
import SettingsPanel from './SettingsPanel'

import './index.scss'

/*
  @NOTE(peter):
    When the sliders are closed, the component is rerendered (this is intended functionality)
    so we need to use skip to ensure the query is not run whent he component unmounts
*/
const IncomingFeed = () => (
  <PanelProvider>
    <div className="incoming_feed_outer">
      <div className="incoming_feed_side">
        <div
          className="feed-header"
          style={{
            textAlign: 'center',
            padding: 25,
            borderBottom: '1px solid #ede4e4',
            background: '#efefef',
          }}
        >
          <div
            style={{
              fontWeight: 350,
              fontSize: '2em',
              alignItems: 'end',
              justifyContent: 'space-evenly',
              display: 'flex',
            }}
          >
            Incoming Feed
            <Can
              allowedRole="ctf_admin"
              yes={() => (
                <SlidingPanelConsumer>
                  {({ openSlider }) => (
                    <a onClick={() => openSlider(SettingsPanel)}>
                      <Icon intent="primary" icon={IconNames.SETTINGS} iconSize={20} />
                    </a>
                  )}
                </SlidingPanelConsumer>
              )}
            />
          </div>
        </div>
        <div className="case-data__content">
          <SubmissionList />
        </div>
      </div>
    </div>
    <PanelRoot />
  </PanelProvider>
)

export default IncomingFeed
