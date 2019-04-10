import gql from 'graphql-tag'

export const updateVisibilityFilter = (_, { visibilityFilter }, { cache }) => {
  const data = { visibilityFilter, __typename: 'Filter' }
  cache.writeData({ data })
}

export const toggleFeedPanel = (_, variables, { cache }) => {
  const currentVisibility = cache.readQuery({
    query: gql`
      {
        isFeedVisible @client
      }
    `,
  })

  const isVisible = currentVisibility.isFeedVisible

  const data = { isFeedVisible: !isVisible }
  cache.writeData({ data })
}

export const toggleSettingsPanel = (_, variables, { cache }) => {
  const currentVisibility = cache.readQuery({
    query: gql`
      {
        isSettingsVisible @client
      }
    `,
  })

  const isVisible = currentVisibility.isSettingsVisible

  const data = { isSettingsVisible: !isVisible }
  cache.writeData({ data })
}
