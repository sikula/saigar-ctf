import React from 'react'
import { Mutation } from 'react-apollo'
import { Formik } from 'formik'
import gql from 'graphql-tag'

//  Styles
import { HTMLSelect, FormGroup, InputGroup, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'

// Custom Components
import { SlidingPanelConsumer, SlidingPane } from '../../../../../../shared/components/SlidingPane'

const ADD_ADMIN = gql`
  mutation insertUser($role: String!, $name: String!, $email: String!, $username: String!) {
    insert_user(
      objects: { role: $role, nickname: $name, email: $email, username: $username, avatar: "" }
    ) {
      affected_rows
    }
  }
`
const UserControl = ({ handleSubmit, handleChange, values }) => (
  <form id="addAdminForm" onSubmit={handleSubmit}>
    <FormGroup label="Role" labelInfo="(required)" labelFor="text-input">
      <HTMLSelect name="role" value={values.role} onChange={handleChange} fill large>
        <option value="JUDGE">Judge</option>
        <option value="ADMIN">Admin</option>
      </HTMLSelect>
    </FormGroup>
    <FormGroup label="Name" labelInfo="(required)" labelFor="text-input">
      <InputGroup id="text-input" name="name" value={values.name} onChange={handleChange} large />
    </FormGroup>
    <FormGroup label="Email" labelInfo="(required)" labelFor="text-input">
      <InputGroup id="text-input" name="email" value={values.email} onChange={handleChange} large />
    </FormGroup>
    <FormGroup label="Username" labelInfo="(required)" labelFor="text-input">
      <InputGroup
        id="text-input"
        name="username"
        value={values.username}
        onChange={handleChange}
        large
      />
    </FormGroup>
  </form>
)

const AddAdmin = ({ isOpen, onRequestClose }) => (
  <SlidingPane
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    closeIcon={<Icon icon={IconNames.MENU_CLOSED} iconSize={20} />}
    width="375px"
  >
    <SlidingPane.Header>
      <SlidingPane.Header.Title title="Add an Administrator" subtitle="Fill out the form" />
      <SlidingPane.Header.Actions onActionClick={onRequestClose}>
        <a>Cancel</a>
      </SlidingPane.Header.Actions>
    </SlidingPane.Header>

    <SlidingPane.Content>
      <SlidingPanelConsumer>
        {({ closeSlider }) => (
          <Mutation
            mutation={ADD_ADMIN}
            refetchQueries={[
              {
                query: gql`
                  query {
                    user(where: { role: { _in: ["JUDGE", "ADMIN"] } }) {
                      uuid
                      email
                      role
                      nickname
                    }
                  }
                `,
              },
            ]}
            onCompleted={() => closeSlider()}
          >
            {insertUser => (
              <Formik
                initialValues={{
                  role: 'JUDGE',
                  email: '',
                  name: '',
                  username: '',
                }}
                onSubmit={values => {
                  insertUser({
                    variables: {
                      role: values.role,
                      name: values.name,
                      email: values.email,
                      username: values.username,
                    },
                  })
                }}
                render={formikProps => <UserControl {...formikProps} />}
              />
            )}
          </Mutation>
        )}
      </SlidingPanelConsumer>
    </SlidingPane.Content>
    <SlidingPane.Actions form="addAdminForm">ADD USER</SlidingPane.Actions>
  </SlidingPane>
)

export default AddAdmin
