import React from 'react'

// Styles
import { Tabs, Tab } from '@blueprintjs/core'

// Custom Components
import EventsPanel from './EventsPanel'
import CasesPanel from './CasesPanel'
import UsersPanel from './UsersPanel'

import Can from '../../../shared/components/AuthContext/Can'

import './index.scss'

const CreatePage = () => (
  <Can
    allowedRole="ctf_admin"
    yes={() => (
      <div className="row">
        <div className="col-xs-12">
          <div style={{ padding: '1rem', display: 'inline-flex', marginTop: 65, width: '100%' }}>
            <Tabs large animate renderActiveTabPanelOnly className="eventsTabs">
              <Tab
                id="eventsTab"
                title={<div style={{ fontSize: '1.5em' }}>Events</div>}
                panel={<EventsPanel />}
                style={{ width: '100%' }}
              />
              <Tab
                id="casesTab"
                title={<div style={{ fontSize: '1.5em' }}>Cases</div>}
                panel={<CasesPanel />}
              />
              <Tab
                id="userTab"
                title={<div style={{ fontSize: '1.5em' }}>Admins & Judges</div>}
                panel={<UsersPanel />}
              />
            </Tabs>
          </div>
        </div>
      </div>
    )}
  />
)

export default CreatePage
