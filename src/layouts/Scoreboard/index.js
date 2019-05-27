/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Layout, Fixed, Flex } from 'react-layout-pane'
import { AuthConsumer } from '../../shared/components/AuthContext/context'

import './index.scss'

const ScoreboardLayout = ({ children }) => (
  <Layout type="column">
    <Fixed className="header">
      {/* <strong>Saigar</strong> */}
      <nav className="circle">
        <div style={{ float: 'left' }}>
          <ul>
            <li className="header-item" style={{ fontWeight: 600 }}>
              Saigar
            </li>
            <li>
              <Link to="/scoreboard">ScoreBoard</Link>
            </li>
            <li>
              <Link to="/rules">Rules</Link>
            </li>
            <li>
              <Link to="/resources">Resources</Link>
            </li>
            <li>
              <Link to="/teams">Teams</Link>
            </li>
            <li>
              <Link to="/categories">Categories</Link>
            </li>
          </ul>
        </div>
        <div style={{ float: 'right' }}>
          <AuthConsumer>
            {({ authenticated }) =>
              !authenticated ? (
                <ul>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                </ul>
              )
            }
          </AuthConsumer>
        </div>
      </nav>
    </Fixed>
    <Flex className="content">{children}</Flex>
    <Fixed className="footer">
      Powered by <a href="https://saigar.io">saigar.io</a> |{' '}
      <Link to="/terms-of-service" style={{ color: '#bfbfbf' }}>
        Terms of Service
      </Link>
    </Fixed>
  </Layout>
)

ScoreboardLayout.propTypes = {
  children: PropTypes.element.isRequired,
}

export default ScoreboardLayout
