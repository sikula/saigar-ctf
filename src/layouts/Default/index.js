import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Layout, Flex, Fixed } from 'react-layout-pane'
import { Icon, UL } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import '../../_Design/index.scss'
import { AuthConsumer } from '../../_Common/components/AuthContext/context'
import Can from '../../_Common/components/AuthContext/Can'

import './index.scss'

/*
  For tomorrow, get the IO side up and running with Auth0 login, and figure out
  how best to subscribe to an intel agencies cases (subscribe to one agency and
    get all the cases would be easiest).

  Once subscribed, list all the cases and start submissions
*/

const DefaultLayout = ({ children, pathname, showFeed, feed }) => (
  <Layout type="row">
    <Fixed className="sidebar">
      {/* Note from Stephanie; putting items in a div is easier to manage than FlexGrow/Shrink */}
      <div>
        <UL>
          <li>
            <a href="#">
              <Icon icon={IconNames.MENU} iconSize={20} />
            </a>
          </li>
        </UL>
        <UL>
          <li className={pathname === '/home' ? 'active' : ''}>
            <Link to="home">
              <Icon icon={IconNames.HOME} iconSize={20} />
            </Link>
          </li>
        </UL>
        <Can
          role="ctf_admin"
          yes={() => (
            <UL>
              <li className={pathname === '/create' ? 'active' : ''}>
                <Link to="create">
                  <Icon icon={IconNames.ADD} iconSize={20} />
                </Link>
              </li>
            </UL>
          )}
        />
        <UL>
          <li>
            <Link to="scoreboard">
              <Icon icon={IconNames.TIMELINE_LINE_CHART} iconSize={20} />
            </Link>
          </li>
        </UL>
      </div>
      <div>
        {/* <UL>
          <li>
            <a href="#">
              <Icon icon={IconNames.CHAT} iconSize={20} />
            </a>
          </li>
        </UL> */}
        <UL>
          <AuthConsumer>
            {({ logout }) => (
              <li>
                <a onClick={logout}>
                  <Icon icon={IconNames.LOG_OUT} iconSize={20} />
                </a>
              </li>
            )}
          </AuthConsumer>
        </UL>
        {/* <UL>
          <li>
            <a href="#">
              <Icon icon={IconNames.SETTINGS} iconSize={20} />
            </a>
          </li>
        </UL> */}
      </div>
    </Fixed>
    <Flex>
      <Layout type="column">
        <Flex className="content" style={{ background: '#F5F8FA' }}>
          {children}
        </Flex>
        <Fixed className="footer">
          Powered by <a href="https://saigar.io">saigar.io</a>
        </Fixed>
      </Layout>
    </Flex>
    {showFeed && (
      <Fixed
        className="rightSideBar"
        style={{
          width: 375,
        }}
      >
        <Layout type="column">
          <Flex>{feed}</Flex>
        </Layout>
      </Fixed>
    )}
    {/* <div
      style={{
        position: 'absolute',
        width: '300px',
        left: '78px',
        background: '#F5F8FA',
        top: 0,
        height: '100%',
        padding: 20,
        zIndex: 9999,
        borderRight: '1px solid #e6dddd',
        boxShadow: '-10px 0px 10px 1px rgba(0, 0, 0,0.08)',
      }}
    >
      <div style={{ float: 'right' }}>
        <Icon icon={IconNames.CROSS} iconSize={32} />
      </div>
      <div className="teamList">hi</div>
    </div> */}
  </Layout>
)

export default DefaultLayout
