import React from 'react'

const RulesPage = () => (
  <div style={{ padding: 25, width: '85%', margin: '0 auto' }}>
    <p>
      Please follow the rules. While we know there may be misunderstandings, our CTF involves real
      people with real families.
    </p>

    <ul>
      <li>
        Do not submit information found on media/news, law enforcement or missing persons websites.
        This is known information and not worth points.
      </li>
      <li>Only registered teams/individuals can participate in the contest.</li>
      <li>
        The event organizers may or may not allow virtual participation. Please check with the event
        organizer on this.
      </li>
      <li>
        Attacking any Trace Labs or hosting group&rsquo;s infrastructure will result in immediate
        disqualification.
      </li>
      <li>Attempting to exploit any other players will result in immediate disqualification.</li>
      <li>
        Contacting the subject, family of the subject or friends of the subject will result in
        immediate disqualification (this includes tagging, friending, liking or any other
        interaction). Basically, performing anything but OSINT will result in disqualification. This
        means you don&rsquo;t &ldquo;friend&rdquo; or comment on any social media related to the
        subject.
      </li>
      <li>
        Using passwords from publicly available data breaches will result in immediate
        disqualification. While the data is public, the use of that data is illegal, immoral and not
        in the spirit of Trace Labs mission. Using tools to see which of their accounts have been
        breached is acceptable and encouraged.
      </li>
      <li>
        To score points, your intel must be verifiable. This means a link to the public information
        you discovered. A screenshot followed by a destination/source URL works perfectly.
      </li>
      <li>
        Information that is published by either the police or the media is not helpful and will not
        score points. We will therefore ignore submitted flags with links to law enforcement or
        media domains.
      </li>
      <li>
        Only open source intelligence is used for flags. No points are awarded if you cannot show
        the URL.
      </li>
      <li>
        If you have public data (such as meta data) that is not available via link, show us the
        process for discovering and it &ldquo;may&rdquo; be allowed.
      </li>
      <li>You cannot create (fake) the intelligence. We will be checking this.</li>
      <li>
        Do not engage the law enforcement or media. At the end, the contest organizers will send
        local law enforcement everything we collect.
      </li>
      <li>
        Do not try to &ldquo;game&rdquo; the system. This includes repeatedly submitting the same
        information or trying to use categories with higher point values when the intel is not in
        that category. This may not get you disqualified immediately as we will try to talk to you
        about it first. However it will greatly reduce the speed at which we process your data which
        will mean your team&rsquo;s progress will not be shown on the leader board.
      </li>
    </ul>
  </div>
)

export default RulesPage
