import React from 'react'
import { Layout, Fixed, Flex } from 'react-layout-pane'

import './index.scss'

const ScoreboardLayout = ({ children }) => (
  <Layout type="column">
    <Fixed className="header"><strong>Saigar</strong></Fixed>
    <Flex className="content">{children}</Flex>
    <Fixed className="footer">
      Powered by <a href="https://saigar.io">saigar.io</a>
    </Fixed>
  </Layout>
)

export default ScoreboardLayout
