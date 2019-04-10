/* eslint-disable jsx-a11y/no-static-element-interactions */
/*
    @NOTE:
        Heavily borrowed from (https://github.com/DimitryDushkin/sliding-pane/blob/master/src/index.js)
*/
import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'

import './index.scss'

const CLOSE_TIMEOUT = 300

const SlidingPaneHeaderMenu = ({ children }) => (
  <div className="slide-pane__header__menu">{children}</div>
)
SlidingPaneHeaderMenu.displayName = 'SlidingPaneHeaderMenu'
SlidingPaneHeaderMenu.propTypes = {
  children: PropTypes.element.isRequired,
}

const SlidingPaneHeaderTitle = ({ title, subtitle }) => (
  <div className="slide-pane__title-wrapper">
    <h2 className="slide-pane__title">{title}</h2>
    <div className="slide-pane__subtitle">{subtitle}</div>
  </div>
)
SlidingPaneHeaderTitle.displayName = 'SlidingPaneHeaderTitle'
SlidingPaneHeaderTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
}

const SlidingPaneHeaderActions = ({ children, onActionClick }) => (
  <div className="slide-pane__header__actions">
    <span onClick={onActionClick} onKeyDown={onActionClick}>
      {children}
    </span>
  </div>
)
SlidingPaneHeaderActions.displayName = 'SlidingPaneHeaderActions'
SlidingPaneHeaderActions.propTypes = {
  children: PropTypes.element.isRequired,
  onActionClick: PropTypes.func.isRequired,
}

const SlidingPaneHeader = ({ children }) => (
  <div className="slide-pane__header">
    {children}
    {React.Children.map(children, child => {
      if (child.type.displayName === 'SlidingPaneHeaderMenu') {
        React.cloneElement(child, child.props)
      }

      if (child.type.displayName === 'SlidingPaneHeaderTitle') {
        React.cloneElement(child, child.props)
      }

      if (child.type.displayName === 'SlidingPaneHeaderActions') {
        React.cloneElement(child, child.props)
      }
    })}
  </div>
)
SlidingPaneHeader.displayName = 'SlidingPaneHeader'
SlidingPaneHeader.propTypes = {
  children: PropTypes.element.isRequired,
}

SlidingPaneHeader.Title = SlidingPaneHeaderTitle
SlidingPaneHeader.Menu = SlidingPaneHeaderMenu
SlidingPaneHeader.Actions = SlidingPaneHeaderActions

const SlidingPaneContent = ({ children, className }) => (
  <div className={className || 'slide-pane__content'}>{children}</div>
)
SlidingPaneContent.displayName = 'SlidingPaneContent'
SlidingPaneContent.propTypes = {
  children: PropTypes.element.isRequired,
  className: PropTypes.string.isRequired,
}

const SlidingPaneActions = ({ children, onClick, form }) => (
  <div className="slide-pane__action">
    <button form={form} type="submit" onClick={onClick}>
      {children}
    </button>
  </div>
)
SlidingPaneActions.displayName = 'SlidingPaneActions'
SlidingPaneActions.propTypes = {
  children: PropTypes.element.isRequired,
  onClick: PropTypes.func.isRequired,
  form: PropTypes.string.isRequired,
}

const SlidingPane = ({
  isOpen,
  onRequestClose,
  onAfterOpen,
  children,
  className,
  overlayClassName,
  from = 'right',
  width,
}) => {
  const directionCls = `slide-pane_from_${from}`

  return (
    <Modal
      className={`slide-pane ${directionCls} ${className || ''}`}
      style={{ content: { width: width || '375px' } }}
      overlayClassName={`slide-pane__overlay ${overlayClassName || ''}`}
      closeTimeoutMS={CLOSE_TIMEOUT}
      isOpen={isOpen}
      onAfterOpen={onAfterOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
    >
      {React.Children.map(children, child => {
        if (child.type.displayName === 'SlidingPaneHeader') {
          return React.cloneElement(child, child.props)
        }

        if (child.type.displayName === 'SlidingPaneContent') {
          return React.cloneElement(child, child.props)
        }

        if (child.type.displayName === 'SlidingPaneActions') {
          return React.cloneElement(child, child.props)
        }

        return <div />
      })}
    </Modal>
  )
}
SlidingPane.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  onAfterOpen: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
  className: PropTypes.string.isRequired,
  overlayClassName: PropTypes.string.isRequired,
  from: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
}

SlidingPane.Header = SlidingPaneHeader
SlidingPane.Content = SlidingPaneContent
SlidingPane.Actions = SlidingPaneActions

export default SlidingPane
