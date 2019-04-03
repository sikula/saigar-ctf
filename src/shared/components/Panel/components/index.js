import React from 'react'
import { PanelConsumer } from '../context'

const PanelRoot = () => (
  <PanelConsumer>
    {({ component: Component, props, hideModal }) =>
      Component ? <Component {...props} onClose={hideModal} /> : null
    }
  </PanelConsumer>
)

export default PanelRoot
