import React from 'react'
import URL from 'url-parse'

const SafeURL = ({ dangerousURL, text, ...rest }) => {
  const isSafe = dangerousURL => {
    const url = URL(dangerousURL, {})
    if (url.protocol === 'http:') return true
    if (url.protocol === 'https:') return true

    return false
  }

  const safeURL = isSafe(dangerousURL) ? dangerousURL : null
  return (
    <a target="_blank" rel="noopener noreferrer" href={safeURL} {...rest}>
      {text}
    </a>
  )
}

export default SafeURL
