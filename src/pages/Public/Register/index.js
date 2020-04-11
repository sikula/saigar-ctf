import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import useAxios from 'axios-hooks'
import gql from 'graphql-tag'
import * as Yup from 'yup'
import { Formik } from 'formik'

// Styles
import { Button, FormGroup, InputGroup } from '@blueprintjs/core'
import { Wizard, Steps, Step } from 'react-albus'
import { Line } from 'rc-progress'

const FormValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Required!'),
  username: Yup.string()
    .required('Required!')
    .notOneOf([Yup.ref('email'), null], 'Username cannot be the same as email')
    .matches(/^((?! ).)*$/, 'Username cannot contain any spaces')
    .max(15, 'Username too long, needs to be less than 16 characters'),
  password: Yup.string()
    .matches(
      /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character',
    )
    .min(8, 'Password too short, needs to be 8 characters minimum')
    .max(30, 'Password too long, needs to be less than 30 characters')
    .required('Required!'),
})

const SET_USED_CODE = gql`
  mutation setUsedCode {
    update_eventbrite(_set: { used: true }, where: {}) {
      affected_rows
    }
  }
`

const EventOrderStep = ({ onNextClick }) => {
  const [orderNumber, setOrderNumber] = useState()
  const [message, setMessage] = useState()

  const [{ data, loading, error }, executeFetch] = useAxios(
    {
      url:
        process.env.NODE_ENV === 'production'
          ? `${process.env.AUTH_API_ENDPOINT}/verify_code`
          : `http://localhost:8080/verify_code`,
      method: 'POST',
      data: {
        EventCode: orderNumber,
      },
    },
    { manual: true },
  )

  const handleConfirmClick = () => {
    executeFetch()
      .then(() => {
        onNextClick(orderNumber)
      })
      .catch(({ response }) => {
        if (response.status === 400) {
          setMessage('Invalid Registration Code')
        } else if (response.status === 403) {
          setMessage('Registration Code already in use')
        }
      })
  }

  return (
    <>
      <FormGroup label="Registration Code" labelFor="text-input">
        <InputGroup
          id="text-input"
          name="orderNumber"
          placeholder="Enter your Registration Code"
          large
          values={orderNumber}
          onChange={e => setOrderNumber(e.target.value)}
        />
      </FormGroup>
      {message}
      {/* <Button fill large onClick={handleConfirmClick}>Confirm</Button> */}
      <Button fill large onClick={handleConfirmClick}>
        Confirm
      </Button>
    </>
  )
}

const UserCreationStep = ({ onNextClick, orderNumber }) => {
  const [updateCode] = useMutation(SET_USED_CODE, {
    context: {
      headers: {
        'X-Hasura-Register-Code': orderNumber,
      },
    },
  })

  const [{ data, loading, error }, executePost] = useAxios(
    {
      // url: 'http://localhost:8080/register',
      url:
        process.env.NODE_ENV === 'production'
          ? `${process.env.AUTH_API_ENDPOINT}/register`
          : `http://localhost:8080/register`,
      method: 'POST',
    },
    { manual: true },
  )

  const handleFormSubmit = values => {
    executePost({
      data: {
        ...values,
      },
    }).then(() => {
      updateCode()
      onNextClick()
    })
  }

  if (loading) return 'loading'

  return (
    <Formik
      initialValues={{
        email: '',
        username: '',
        password: '',
      }}
      validationSchema={FormValidationSchema}
      onSubmit={handleFormSubmit}
      render={({ values, errors, handleSubmit, handleChange }) => (
        <form id="addUserForm" onSubmit={handleSubmit}>
          <FormGroup label="Email (required)" labelFor="text-input">
            <InputGroup
              id="text-input"
              name="email"
              placeholder="Enter your email"
              large
              values={values.email}
              // onChange={e => setEmail(e.target.value)}
              onChange={handleChange}
            />
            {errors.email && <span>{errors.email}</span>}
          </FormGroup>
          <FormGroup label="Username (required)" labelFor="text-input">
            <InputGroup
              id="text-input"
              name="username"
              placeholder="Enter your username"
              large
              values={values.username}
              // onChange={e => setUsername(e.target.value)}
              onChange={handleChange}
            />
            {errors.username && <span>{errors.username}</span>}
          </FormGroup>
          <FormGroup label="Password (required)" labelFor="text-input">
            <InputGroup
              id="text-input"
              name="password"
              type="password"
              placeholder="Enter your password"
              large
              values={values.password}
              // onChange={e => setPassword(e.target.value)}
              onChange={handleChange}
            />
          </FormGroup>
          {errors.password && (
            <div style={{ margin: '0.3rem 0rem' }}>
              <ul>
                <li>Must be between 8 and 30 characters</li>
                <li>Must contain one or more uppercase letters</li>
                <li>Must contain one or more lowercase letters</li>
                <li>Must contain one or more numbers</li>
                <li>Must contain one or more of the following special characters (!@#$%^&amp;*)</li>
              </ul>
            </div>
          )}
          <Button fill large type="submit">
            Confirm
          </Button>
        </form>
      )}
    />
  )
}

const RegisterPage = () => {
  const [orderNumber, setOrderNumber] = useState()

  const onOrderNextClick = next => on => {
    console.log(next, on)
    setOrderNumber(on)
    next()
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'rgb(239, 243, 245)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '35%', margin: '0 auto' }}>
        <Wizard
          render={({ steps, step }) => (
            <>
              <Line
                percent={((steps.indexOf(step) + 1) / steps.length) * 100}
                style={{ marginBottom: 10 }}
              />
              <Steps key={step.id} step={step}>
                <Step
                  id="order"
                  render={({ next }) => <EventOrderStep onNextClick={onOrderNextClick(next)} />}
                />
                <Step
                  id="user"
                  render={({ next }) => (
                    <UserCreationStep orderNumber={orderNumber} onNextClick={next} />
                  )}
                />
                <Step
                  id="login"
                  render={({ next }) => (
                    <div>
                      Registration finished! Proceed to <Link to="/login">Login</Link>
                    </div>
                  )}
                />
              </Steps>
            </>
          )}
        />
        <div style={{ color: '#000', padding: 10, marginTop: 30 }}>
          Powered by <span style={{ fontWeight: 600 }}>Saigar Technologies</span> |{' '}
          <a href="https://saigar.io" target="_blank">
            saigar.io
          </a>{' '}
          |{' '}
          <a href="https://twitter.com/@saigar_to" target="_blank">
            @saigar_to
          </a>{' '}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
