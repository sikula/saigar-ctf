import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { NavLink, Link } from 'react-router-dom'
import { Layout, Flex, Fixed } from 'react-layout-pane'
import { Icon, UL } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import '../../_Design/index.scss'
import { AuthConsumer } from '../../shared/components/AuthContext/context'
import Can from '../../shared/components/AuthContext/Can'
import gql from 'graphql-tag'
import { useSubscription } from '@apollo/react-hooks'

import './index.scss'
import logoWhite from './logo-white.png'
import { AuthContext } from '@shared/components/AuthContext/context'


/*
  For tomorrow, get the IO side up and running with Auth0 login, and figure out
  how best to subscribe to an intel agencies cases (subscribe to one agency and
    get all the cases would be easiest).

  Once subscribed, list all the cases and start submissions
*/

const DefaultLayout = ({ children, pathname, showFeed, feed }) => (
  <Layout type="row">
    <Fixed className="sidebar">
      <div>
        <UL>
          <li id="logo">
            <img src={logoWhite} width="60%" height="60%" />
          </li>
        </UL>
        <Can
          allowedRole={['ctf_admin', 'super_admin', 'judge']}
          yes={() => (
            <UL>
              <NavLink to="home" activeClassName="active">
                <li className={pathname === '/home' ? 'active' : ''}>
                  <Icon icon={IconNames.HOME} iconSize={20} />
                </li>
              </NavLink>
            </UL>
          )}
        />
        <Can
          allowedRole="contestant"
          yes={() => (
            <UL>
              <NavLink to="challenges">
                <li className={pathname === '/challenges' ? 'active' : ''}>
                  <a>
                    <Icon icon={IconNames.FOLDER_OPEN} iconSize={20} />
                  </a>
                </li>
              </NavLink>
              <BanCheck></BanCheck>
            </UL>
          )}
        />
        <Can
          allowedRole={["super_admin", "ctf_admin"]}
          yes={() => (
            <UL>
              <NavLink to="create">
                <li className={pathname === '/create' ? 'active' : ''}>
                  <Icon icon={IconNames.ADD} iconSize={20} />
                </li>
              </NavLink>
            </UL>
          )}
        />
        <UL>
          <NavLink to="scoreboard">
            <li>
              <Icon icon={IconNames.TIMELINE_LINE_CHART} iconSize={20} />
            </li>
          </NavLink>
        </UL>
      </div>
      <div>
        <UL>
          <AuthConsumer>
            {({ logout }) => (
              <li onClick={logout}>
                <a>
                  <Icon icon={IconNames.LOG_OUT} iconSize={20} />
                </a>
              </li>
            )}
          </AuthConsumer>
        </UL>
      </div>
    </Fixed>
    <Flex>
      <Layout type="column">
        <Flex
          className="content"
          style={{
            background: '#F5F8FA',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </Flex>
        <Fixed className="footer">
          Powered by Saigar Technologies |{' '}
          <a href="https://saigar.io" target="_blank">
            saigar.io
          </a>
          |{' '}
          <a href="https://twitter.com/@saigar_to" target="_blank">
            @saigar_to
          </a>{' '}
          |{' '}
          <Link to="/terms-of-service" style={{ color: '#bfbfbf' }}>
            Terms of Service
          </Link>
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
  </Layout>
)

const BanCheck = () => {
  const GET_BANNED_STATUS = gql`
    subscription getBannedStatus($auth0id: String!) {
      user_team(where: {user: {auth0id: {_eq: $auth0id}}}) {
        team {
          banned
        }
      }
    }
  `
  const { user, logout } = useContext(AuthContext)  
  const { loading, data } = useSubscription(GET_BANNED_STATUS, {
    variables: { auth0id: user.id }
  })
  if (!loading && data.user_team.length && data.user_team[0].team.banned) {
    logout()
  }
  
  return null
}

DefaultLayout.propTypes = {
  children: PropTypes.element.isRequired,
  pathname: PropTypes.string.isRequired,
  showFeed: PropTypes.bool,
  feed: PropTypes.element,
}

DefaultLayout.defaultProps = {
  showFeed: false,
  feed: null,
}

export default DefaultLayout
