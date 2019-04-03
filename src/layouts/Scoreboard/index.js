import React from 'react'
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
              <a href="#">Rules</a>
            </li>
            <li>
              <a href="#">Resources</a>
            </li>
          </ul>
        </div>
        <div style={{ float: 'right' }}>
          <AuthConsumer>
            {({ authenticated }) =>
              !authenticated ? (
                <ul>
                  <li>
                    <a href="#">Login</a>
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <a href="#">Home</a>
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
      Powered by <a href="https://saigar.io">saigar.io</a>
    </Fixed>
  </Layout>
)

export default ScoreboardLayout
