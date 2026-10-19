import React from 'react';

const sections = [
  {
    title: '1. About the platform',
    content: [
      'thebrandsstory. provides an online platform where brands and agencies can discover creators, publish campaign briefs, and communicate about potential collaborations. Creators can create profiles, browse opportunities, and respond to briefs.',
      'Unless a separate written agreement says otherwise, thebrandsstory. is a platform provider and is not a party to agreements made directly between a brand and a creator.',
    ],
  },
  {
    title: '2. Eligibility and accounts',
    content: [
      'You must be legally able to enter into a binding agreement to use the platform. If you use it for a business or organization, you confirm that you are authorized to act for it.',
      'Keep your account details accurate, protect your login credentials, and promptly tell us if you suspect unauthorized account use. You are responsible for activity carried out through your account.',
    ],
  },
  {
    title: '3. Profiles, listings, and platform information',
    content: [
      'You are responsible for the accuracy and legality of information, images, campaign briefs, and other materials you submit. Do not impersonate another person or misrepresent your identity, audience, brand, or campaign.',
      'Profile checks, badges, metrics, and other platform indicators are provided for information only. They are not a guarantee of a user’s identity, performance, reach, quality, or suitability.',
    ],
  },
  {
    title: '4. Campaigns and collaborations',
    content: [
      'Submitting or responding to a campaign brief does not guarantee that a collaboration will be offered or accepted. Brands and creators are responsible for checking suitability and agreeing directly on deliverables, timelines, usage rights, revisions, cancellation terms, and other requirements.',
      'Before work begins, the parties should document their agreement, including fees, payment schedule, taxes, content approvals, disclosure requirements, and any exclusivity or licensing terms. thebrandsstory. does not guarantee payment or performance by another user unless expressly agreed in writing.',
    ],
  },
  {
    title: '5. Fees and payments',
    content: [
      'Any platform fees, if applicable, will be shown or agreed before the relevant paid service is used. Unless a platform checkout or written agreement states otherwise, payments for collaborations are arranged between the brand and creator.',
    ],
  },
  {
    title: '6. Content and intellectual property',
    content: [
      'You retain ownership of content you submit, subject to rights you already grant to others. You give thebrandsstory. a non-exclusive, worldwide, royalty-free permission to host, display, reproduce, and process that content as needed to operate, maintain, secure, and promote the platform.',
      'This permission does not transfer ownership of your content. Any rights to use campaign deliverables must be agreed directly between the brand and creator.',
    ],
  },
  {
    title: '7. Acceptable use',
    content: [
      'Do not use the platform to break the law, infringe another person’s rights, upload harmful or misleading material, send spam, interfere with the platform or its security, scrape data without permission, or harass, defraud, or endanger other users.',
      'We may review reported activity and restrict or suspend access where reasonably necessary to protect users, the platform, or comply with law.',
    ],
  },
  {
    title: '8. Third-party services',
    content: [
      'The platform may link to or rely on third-party websites and services. Those services are controlled by their own providers and terms; thebrandsstory. is not responsible for their availability or content.',
    ],
  },
  {
    title: '9. Availability and changes',
    content: [
      'We may update, suspend, or discontinue parts of the platform for operational, safety, or legal reasons. We will take reasonable steps to keep the platform available, but do not promise uninterrupted or error-free service.',
      'We may update these terms from time to time. The revised version will be posted on this page with an updated revision date. Continued use after the updated terms take effect means you accept them.',
    ],
  },
  {
    title: '10. Disclaimers and liability',
    content: [
      'To the extent permitted by applicable law, the platform is provided on an “as available” basis. We do not guarantee that a user, listing, campaign, or collaboration will meet your expectations.',
      'To the extent permitted by law, thebrandsstory. is not liable for indirect or consequential loss, or for disputes, acts, or omissions of users. Nothing in these terms excludes liability that cannot legally be excluded.',
    ],
  },
  {
    title: '11. Suspension and termination',
    content: [
      'You may stop using the platform at any time. We may suspend or terminate access for a breach of these terms, suspected fraud or misuse, safety concerns, or where required by law. Terms that by their nature should continue will remain effective after termination.',
    ],
  },
  {
    title: '12. Governing law and contact',
    content: [
      'These terms are governed by the laws of India, subject to applicable consumer protection laws. Courts with appropriate jurisdiction in India will hear disputes, unless applicable law requires otherwise.',
      'For questions about these terms, contact us through the Help & Support page on the website.',
    ],
  },
];

export const TermsAndConditionsView: React.FC = () => (
  <div className="min-h-screen bg-[#051126] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
    <main className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a1933] p-6 shadow-2xl sm:p-10">
      <header className="mb-8 border-b border-white/10 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A338]">Legal</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: October 17, 2026</p>
        <p className="mt-5 text-sm leading-7 text-slate-300">
          These terms apply to your access to and use of thebrandsstory. website and services. By using the platform, you agree to these terms.
        </p>
      </header>

      <div className="space-y-7">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
            {section.content.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-slate-300">{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  </div>
);
