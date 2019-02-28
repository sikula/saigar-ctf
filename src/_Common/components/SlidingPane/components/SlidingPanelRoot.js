import React from 'react'
import { SlidingPanelConsumer } from '../context'

const SlidingPanelRoot = () => (
  <SlidingPanelConsumer>
    {({ component: Component, props, isSliderOpen, closeSlider }) =>
      Component && <Component isOpen={isSliderOpen} onRequestClose={closeSlider} {...props} />
    }
  </SlidingPanelConsumer>
)

export default SlidingPanelRoot
