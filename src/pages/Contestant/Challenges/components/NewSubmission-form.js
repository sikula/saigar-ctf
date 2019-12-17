/* eslint-disable react/no-unescaped-entities */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/react-hooks'

import { isWithinInterval } from 'date-fns'
import { FormGroup, HTMLSelect, TextArea } from '@blueprintjs/core'

import { AuthContext } from '@shared/components/AuthContext/context'
import { SUBMISION_INFO } from '../graphql/queries'

const SUBMISSION_INFO = {
  LOCATION: {
    name: 'LOCATION',
    text: (
      <div>
        <strong>LOCATION</strong>
        <p>
          Relevant information pertaining to the current location of the subject. This can include
          but not limited to: new information on location (this does not include a Police update
          saying the person was found or an obituary - this will get you 150 points and can be under
          the category Advanced Subject Info.)
        </p>
      </div>
    ),
  },
  DARK_WEB: {
    name: 'Home',
    text: (
      <div>
        <strong>DARK WEB</strong>
        <p>
          Relevant information found on the dark web about the subject. 
        </p>
        <strong style={{ color: "red" }}>
          Your submission must originate from a .onion URL to be considered Dark Web - Eg. https://dsfjldsjflj.onion
        </strong>
        <ul>
          <li>pictures or details of subject on human trafficking related dark we sites</li>
          <li>the sales of goods by the subject on the dark web</li>
          <li>any activity or post by the subject on the dark web</li>
          <li>data breaches posted on the dark web that include the subject's personal information</li>
        </ul>
        <strong style={{ color: 'red' }}>
          Please use caution when exploring the dark web as you are likely see graphic pictures.
        </strong>
      </div>
    ),
  },
  DAY_LAST_SEEN: {
    name: 'Day Last Seen',
    text: (
      <div>
        <strong>DAY LAST SEEN</strong>
        <p>
          Relevant information regarding the subject's last day seen. This can include but not
          limited to:
        </p>
        <ul>
          <li>pictures of subject on day last seen ( e.g. CCTV)</li>
          <li>details of subject on day last seen (mood, altercations, conversations, etc)</li>
          <li>peron last seen with</li>
          <li>intent to meet with someone</li>
          <li>direction of travel</li>
          <li>other details that relate to the day last seen</li>
        </ul>
      </div>
    ),
  },
  ADVANCED_SUBJECT_INFO: {
    name: 'Advanced Subject Info',
    text: (
      <div>
        <strong>ADVANCED SUBJECT INFO</strong>
        <p>
          Advanced relevant information regarding the subject. This can include but not limited to:
        </p>
        <ul>
          <li>unique identifiers (e.g. tattoos, scars, piercings)</li>
          <li>medical issues</li>
          <li>habits (e.g. smoking, drinking, hitch hiking, hangouts)</li>
          <li>previous missing persons history</li>
          <li>brand of cell phones</li>
          <li>model of cell phones</li>
          <li>cell phone carriers</li>
          <li>make of vehicles</li>
          <li>year of vehicles</li>
          <li>color of vehicles</li>
          <li>license plate of vehicles</li>
          <li>video game handles (e.g. xbox)</li>
          <li>IP Address</li>
          <li>Any other information about where the subject might be headed</li>
        </ul>
      </div>
    ),
  },
  BASIC_SUBJECT_INFO: {
    name: 'Basic Subject Info',
    text: (
      <div>
        <strong>BASIC SUBJECT INFO</strong>
        <p>Basic relevant information regarding subject. This can include but not limited to:</p>
        <ul>
          <li>name</li>
          <li>aliases</li>
          <li>birth date</li>
          <li>pictures</li>
          <li>IDs (e.g. drivers license, passport, library card)</li>
          <li>emails</li>
          <li>social media handles/accounts</li>
          <li>blogs or forum profile and relevant posts</li>
          <li>personal websites</li>
          <li>dating site profiles and relevant posts</li>
          <li>Craigslist or Kijii profile and relevant posts</li>
          <li>
            Reddit accounts or sites of similar nature, online resume and physical description
          </li>
        </ul>
      </div>
    ),
  },
  HOME: {
    name: 'Home',
    text: (
      <div>
        <strong>HOME</strong>
        <p>
          Information that is relevant regarding the subject's home. This can include but not
          limited to:
        </p>
        <ul>
          <li>address</li>
          <li>landlord's name</li>
          <li>landlord's phone number</li>
          <li>recent accommodations</li>
          <li>any meaningful interactions with the landlord</li>
          <li>risks in the immediate area (e.g sex offenders)</li>
          <li>Habits (e.g. couch surfing)</li>
        </ul>
      </div>
    ),
  },
  FAMILY: {
    name: 'Family',
    text: (
      <div>
        <strong>FAMILY</strong>
        <p>Relevant information on family. This can include but not limited to:</p>
        <ul>
          <li>name</li>
          <li>aliases</li>
          <li>birth date</li>
          <li>IDs (e.g. drivers license, passport, library card)</li>
          <li>home address</li>
          <li>home phone number</li>
          <li>work address</li>
          <li>work phone number</li>
          <li>email</li>
          <li>social media handle</li>
          <li>any insightful information from family's comments</li>
        </ul>
      </div>
    ),
  },
  EMPLOYMENT: {
    name: 'Employment',
    text: (
      <div>
        <strong>EMPLOYMENT</strong>
        <p>Relevant information on Employment. This can include but not limited to:</p>
        <ul>
          <li>business name</li>
          <li>aliases</li>
          <li>manager name</li>
          <li>start date</li>
          <li>end date</li>
          <li>IDs (badge, license, etc)</li>
          <li>business address</li>
          <li>business phone</li>
          <li>email</li>
          <li>social media</li>
          <li>any insightful information from employer's comments</li>
        </ul>
      </div>
    ),
  },
  FRIENDS: {
    name: 'Friends',
    text: (
      <div>
        <strong>FRIENDS</strong>
        <p>Relevant information on Friends. This can include but not limited to:</p>
        <ul>
          <li>name</li>
          <li>aliases</li>
          <li>birthdate</li>
          <li>IDs (drivers license, passport, library card, etc)</li>
          <li>home address</li>
          <li>home phone number</li>
          <li>work address</li>
          <li>work phone number</li>
          <li>email</li>
          <li>social media handle (e.g. Facebook, Twitter, etc)</li>
          <li>any insightful information from friends's comments</li>
        </ul>
      </div>
    ),
  },
  CLOSED: {
    name: 'Closed',
    text: (
      <div>
        <strong>CLOSED SOURCE</strong>
        <p>Any closed source intelligence obtained from special access tools from your day job or research. Because it's closed source, we will not be able to verify it so please be sure about the intel you submit.</p>
      </div>
    ),
  },
}

const NewSubmissionForm = ({ handleSubmit, handleChange, values, errors, touched }) => {
  // State Layer
  const { user } = useContext(AuthContext)

  //  GraphQL Layer
  const { data, loading, error } = useQuery(SUBMISION_INFO, {
    variables: {
      auth0id: user.id,
    },
  })

  // ============================================================
  //  RENDER
  // ============================================================
  if (loading) return null
  if (error) return null

  const canCreateSubmission = isWithinInterval(
    new Date(),
    {
      start: new Date(data.event[0].start_time),
      end: new Date(data.event[0].end_time)
    }
  )

  return canCreateSubmission ? (
    <form id="newSubmissionForm" onSubmit={handleSubmit}>
      <FormGroup label="Category" labelInfo="(required)" labelFor="text-input">
        <HTMLSelect name="category" value={values.category} onChange={handleChange} fill large>
          {data.submission_configuration.map(config => (
            <option
              key={config.uuid}
              id={config.category}
              value={config.uuid}
            >{`${config.category} (${config.points} pts.)`}</option>
          ))}
        </HTMLSelect>
      </FormGroup>
      <FormGroup label="URL" labelInfo="(required)" labelFor="text-input">
        <TextArea
          name="proof"
          placeholder="The URL where this intelligence can be found."
          fill
          value={values.proof}
          onChange={handleChange}
        />
        {errors.proof && touched.proof ? <div style={{ color: 'red' }}>{errors.proof}</div> : null}
      </FormGroup>
      <FormGroup label="Relevance" labelInfo="(required)" labelFor="text-input">
        <TextArea
          name="explanation"
          placeholder="Reasons why this intelligence is relevant to the case."
          fill
          value={values.explanation}
          onChange={handleChange}
        />
        {errors.explanation && touched.explanation ? (
          <div style={{ color: 'red' }}>{errors.explanation}</div>
        ) : null}
      </FormGroup>
      <FormGroup label="Supporting Evidence" labelInfo="(required)" labelFor="text-input">
        <TextArea
          name="supporting_evidence"
          placeholder="How did you come to the conclusion that this intelligence is valuable. You are permitted to add additional supporting URLs here."
          fill
          value={values.supporting_evidence}
          onChange={handleChange}
        />
        {errors.supporting_evidence && touched.supporting_evidence ? (
          <div style={{ color: 'red' }}>{errors.supporting_evidence}</div>
        ) : null}
      </FormGroup>
      <FormGroup label="Supporting File" labelInfo="(images files only)">
        <input 
          name="supporting_file"
          type="file"
          accept="image/*"
          ref={values.supporting_fileRef}
          onChange={handleChange}
        />
        {errors.supporting_file && touched.supporting_file ? (
          <div style={{ color: 'red' }}>{errors.supporting_file}</div>
        ) : null}
      </FormGroup>
      <div>
        {
          SUBMISSION_INFO[
            data.submission_configuration.filter(item => item.uuid === values.category)[0].category
          ].text
        }
      </div>
    </form>
  ) : (
    <div>Competition is over</div>
  )
}

NewSubmissionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.any.isRequired,
}

export default React.memo(NewSubmissionForm)
