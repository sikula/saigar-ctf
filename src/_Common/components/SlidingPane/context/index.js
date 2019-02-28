import React, { createContext } from 'react'
import SlidingPane from '../components'

// const SlidingPanelContext = createContext({
//   component: null,
//   props: {},
//   openSlider: () => {},
//   closeSlider: () => {},
// })

// export class SlidingPanelProvider extends React.Component {
//   openSlider = (component, props = {}) => {
//     this.setState({ component, props })
//   }

//   closeSlider = () => {
//     this.setState({ component: null, props: {} })
//   }

//   state = {
//     component: null,
//     props: {},
//     openSlider: this.openSlider,
//     closeSlider: this.closeSlider,
//   }

//   render() {
//     const { children } = this.props
//     return (
//       <SlidingPanelContext.Provider value={this.state}>{children}</SlidingPanelContext.Provider>
//     )
//   }
// }

const SlidingPanelContext = createContext({
  props: {},
  component: null,
  isSliderOpen: false,
  openSlider: () => {},
  closeSlider: () => {},
})

class SlidingPanelProvider extends React.Component {
  openSlider = (component, props = {}) => {
    this.setState({ component, props, isSliderOpen: true })
  }

  closeSlider = () => {
    this.setState({ isSliderOpen: false, props: {} })
  }

  state = {
    isSliderOpen: false,
    component: null,
    props: {},
    openSlider: this.openSlider,
    closeSlider: this.closeSlider,
  }

  render() {
    const { children } = this.props
    return (
      <SlidingPanelContext.Provider value={this.state}>{children}</SlidingPanelContext.Provider>
    )
  }
}

const SlidingPanelConsumer = SlidingPanelContext.Consumer
export { SlidingPanelConsumer, SlidingPanelProvider }
