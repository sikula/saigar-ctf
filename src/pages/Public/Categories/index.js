import React from 'react'

const Categories = () => (
  <div style={{ padding: 25, width: '85%', margin: '0 auto' }}>
    <div className="row center-xs">
      <div
        className="col-xs-5"
        style={{
          background: 'rgb(239, 237, 237)',
          borderRight: '1px solid #fff',
          borderBottom: '1px solid #fff',
          padding: 20,
          textAlign: 'left',
        }}
      >
        <strong>FRIENDS / 10 points</strong>
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
      <div
        className="col-xs-5"
        style={{ background: 'rgb(239, 237, 237)', borderBottom: '1px solid #fff', padding: 20, textAlign: 'left' }}
      >
        <strong>EMPLOYMENT / 15 points</strong>
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
    </div>

    <div className="row center-xs">
      <div
        className="col-xs-5"
        style={{
          background: 'rgb(239, 237, 237)',
          borderRight: '1px solid #fff',
          borderBottom: '1px solid #fff',
          padding: 20,
          textAlign: 'left',
        }}
      >
        <strong>FAMILY / 20 points</strong>
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
      <div
        className="col-xs-5"
        style={{ background: 'rgb(239, 237, 237)', borderBottom: '1px solid #fff', padding: 20, textAlign: 'left' }}
      >
        <strong>HOME / 25 points</strong>
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
    </div>

    <div className="row center-xs">
      <div
        className="col-xs-5"
        style={{
          background: 'rgb(239, 237, 237)',
          borderRight: '1px solid #fff',
          borderBottom: '1px solid #fff',
          padding: 20,
          textAlign: 'left',
        }}
      >
        <strong>BASIC SUBJECT INFO / 50 points</strong>
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
      <div
        className="col-xs-5"
        style={{ background: 'rgb(239, 237, 237)', borderBottom: '1px solid #fff', padding: 20, textAlign: 'left' }}
      >
        <strong>ADVANCED SUBJECT INFO / 150 points</strong>
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
    </div>

    <div className="row center-xs">
      <div
        className="col-xs-5"
        style={{
          background: 'rgb(239, 237, 237)',
          borderRight: '1px solid #fff',
          borderBottom: '1px solid #fff',
          padding: 20,
          textAlign: 'left',
        }}
      >
        <strong>DAY LAST SEEN / 500 points</strong>
        <p>
          Relevant information regarding the subject's last day seen. This can include but not
          limited to:
        </p>
        <ul>
          <li>pictures of subject on day last seen ( e.g. CCTV)</li>
          <li>details of subject on day last seen (mood, altercations, conversations, etc)</li>
          <li>person last seen with</li>
          <li>intent to meet with someone</li>
          <li>direction of travel</li>
          <li>other details that relate to the day last seen</li>
        </ul>
      </div>
      <div
        className="col-xs-5"
        style={{ background: 'rgb(239, 237, 237)', borderBottom: '1px solid #fff', padding: 20, textAlign: 'left' }}
      >
        <strong>DARK WEB / 1000 points</strong>
        <p>
          Relevant information found on the dark web about the subject.
        </p>
        <p style={{ color: 'red' }}>Your submission must originate from a .onion URL to be considered Dark Web - Eg. https://dsfjldsjflj.onion</p>
        <ul>
          <li>pictures or details of subject on human trafficking related dark web sites</li>
          <li>the sales of goods by the subject on dark web sites</li>
          <li>any activity or post by the subject on the dark web</li>
          <li>data breaches posted on the dark web that include the subject's personal information</li>
        </ul>
      </div>
    </div>

    <div className="row center-xs">
      <div
        className="col-xs-10"
        style={{ background: 'rgb(239, 237, 237)', borderTop: '1px solid #fff', padding: 20, textAlign: 'left' }}
      >
        <strong>LOCATION / 5000 points</strong>
        <p>
          Relevant information pertaining to the current location of the subject. This can include
          but not limited to: new information on location (this does not include a Police update
          saying the person was found or an obituary - this will get you 150 points and can be under
          the category Advanced Subject Info.)
        </p>
      </div>
    </div>
  </div>
)

export default Categories
