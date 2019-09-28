import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'


export default class CountdownClock extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const { date: dateProp } = this.props
      const date = this.calculateCountdown(dateProp)
      date ? this.setState(date) : this.stop()
    }, 1000)
  }

  componentWillUmount() {
    this.stop()
  }

  calculateCountdown(endDate) {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000

    // clear countdown when date is reached
    if (diff <= 0) return false

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
      millisec: 0,
    }

    // calculate time difference between now and expected date
    if (diff >= 365.25 * 86400) {
      // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400))
      diff -= timeLeft.years * 365.25 * 86400
    }
    if (diff >= 86400) {
      // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400)
      diff -= timeLeft.days * 86400
    }
    if (diff >= 3600) {
      // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600)
      diff -= timeLeft.hours * 3600
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60)
      diff -= timeLeft.min * 60
    }
    timeLeft.sec = diff

    return timeLeft
  }

  stop() {
    clearInterval(this.interval)
  }

  addLeadingZeros(value) {
    let newValue = String(value)
    while (newValue.length < 2) {
      newValue = `0${newValue}`
    }
    return newValue
  }

  render() {
    const countDown = this.state

    return (
      <div className="Countdown" style={{ textAlign: 'center' }}>
        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.days)}
            </span>
            <span>{countDown.days === 1 ? 'Day' : 'Days'}</span>
          </span>
        </span>

        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.hours)}
            </span>
            <span>Hours</span>
          </span>
        </span>

        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.min)}
            </span>
            <span>Min</span>
          </span>
        </span>

        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <span style={{ fontWeight: 350, fontSize: '2.5em', color: 'rgb(92, 112, 128)' }}>
              {this.addLeadingZeros(countDown.sec)}
            </span>
            <span>Sec</span>
          </span>
        </span>
      </div>
    )
  }
}

CountdownClock.propTypes = {
  date: PropTypes.objectOf(Date).isRequired,
}