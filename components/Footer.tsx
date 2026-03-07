'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Twitter, Facebook, Instagram, Youtube, X, Github } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

// ─── Footer link data is now derived from translations inside the component ──

// ─── Custom SVG icons ────────────────────────────────────────────────────────

const TikTokIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.51a8.18 8.18 0 004.78 1.53V7.59a4.85 4.85 0 01-1.01-.9z" />
  </svg>
)

const WhatsAppIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

// ─── Social links ────────────────────────────────────────────────────────────

const socials = [
  { icon: <Facebook size={15} />, href: 'https://www.facebook.com/progrex.tech', label: 'Facebook' },
  { icon: <Instagram size={15} />, href: 'https://www.instagram.com/progrex.tech', label: 'Instagram' },
  { icon: <Twitter size={15} />, href: 'https://x.com/progrex_tech', label: 'X / Twitter' },
  { icon: <TikTokIcon size={15} />, href: 'https://www.tiktok.com/@progrex.tech', label: 'TikTok' },
  { icon: <Youtube size={15} />, href: 'https://www.youtube.com/@progrex.technologies', label: 'YouTube' },
  { icon: <WhatsAppIcon size={15} />, href: 'https://wa.me/639565934460', label: 'WhatsApp' },
  { icon: <Github size={15} />, href: 'https://github.com/progrex-tech', label: 'GitHub' },
  { icon: <MapPin size={15} />, href: 'https://maps.app.goo.gl/obdsRKxLpNnmu2Bd8', label: 'Maps' },
]

// ─── Modal content ───────────────────────────────────────────────────────────

const PRIVACY_POLICY = `PRIVACY POLICY

Effective Date: March 1, 2026
Last Updated: March 6, 2026

This Privacy Policy describes how PROGREX Technologies ("PROGREX", "we", "us", or "our"), a software development company based in Calauan, Laguna, Philippines, collects, uses, discloses, and safeguards your personal information when you visit our website at progrex.cloud, use our services, or otherwise interact with us. Please read this policy carefully. If you disagree with its terms, please discontinue use of our website and services.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. INFORMATION WE COLLECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We collect information in the following ways:

1.1 Information You Provide Directly
When you fill out our contact form, request a quote, engage in a project discussion, or otherwise communicate with us, we may collect: your full name, email address, phone number, company or organization name, the nature of your inquiry or project requirements, budget range, and any documents or files you choose to share with us.

1.2 Information Collected Automatically
When you visit our website, we may automatically collect certain technical data, including: your IP address, browser type and version, operating system, referring URLs, pages viewed, time and date of access, and other analytics data. This information is collected using cookies, web beacons, and similar tracking technologies.

1.3 Information from Third Parties
We may receive information about you from third-party sources such as social media platforms (Facebook, Instagram, X/Twitter, TikTok, YouTube, GitHub) if you interact with our official accounts, or from referral partners and collaborators as part of ongoing business engagements.

1.4 Communications Data
If you contact us via email, WhatsApp, or any messaging platform, we retain the contents of those communications to facilitate our business relationship and provide support.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. HOW WE USE YOUR INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We use the personal information we collect for the following purposes:

2.1 Service Delivery — To provide, operate, and maintain our software development and IT consulting services, including custom software, web development, mobile app development, and ready-made enterprise solutions.

2.2 Communication — To respond to your inquiries, provide project updates, send invoices, and communicate necessary service-related information.

2.3 Project Management — To manage ongoing projects, coordinate with team members, and fulfill our contractual obligations to clients.

2.4 Marketing and Promotions — With your consent, we may send newsletters, service announcements, and promotional content. You may opt out at any time by contacting us or using the unsubscribe link provided.

2.5 Analytics and Improvement — To analyze how visitors use our website, understand user behavior, identify areas for improvement, and enhance the overall user experience.

2.6 Legal Compliance — To comply with applicable laws and regulations, resolve disputes, enforce agreements, and protect the rights, property, or safety of PROGREX, our clients, or others.

2.7 Security — To detect, investigate, and prevent fraudulent transactions, unauthorized access, and other illegal activities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. LEGAL BASIS FOR PROCESSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We process your personal data under the following legal bases as recognized by the Republic of the Philippines Data Privacy Act of 2012 (R.A. 10173):

• Consent — You have given us clear and informed consent to process your data for specific purposes.
• Contractual Necessity — Processing is required to fulfill a contract with you or take steps at your request before entering into a contract.
• Legitimate Interests — Processing is necessary for our legitimate business interests, provided these do not override your fundamental rights.
• Legal Obligation — Processing is necessary to comply with a legal obligation to which PROGREX is subject.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. DATA SHARING AND DISCLOSURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:

4.1 Service Providers — We may engage trusted third-party companies and individuals to perform functions on our behalf, such as cloud hosting providers, email delivery services, analytics platforms, and payment processors. These parties are bound by confidentiality obligations and are prohibited from using your data for any purpose other than providing the requested services.

4.2 Business Partners — In cases where a project requires collaboration with a third-party partner (e.g., freelancers, design agencies, technology vendors), we will share only the minimum information necessary and ensure they are bound by appropriate data protection agreements.

4.3 Legal Requirements — We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.

4.4 Business Transfers — In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website of any change in ownership or uses of your information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. DATA RETENTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We retain your personal data only for as long as necessary to fulfill the purposes described in this Policy, or as required by law. Specifically:

• Client project records and communications are retained for a minimum of five (5) years from the completion of a project, unless a longer retention period is required by law or contract.
• Contact form submissions and general inquiries are retained for up to two (2) years.
• Website analytics data is retained in aggregated, anonymized form indefinitely.

When your data is no longer needed, we will securely delete or anonymize it in accordance with industry best practices.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. COOKIES AND TRACKING TECHNOLOGIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our website uses cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device.

Types of cookies we use:
• Essential Cookies — Necessary for the website to function correctly. These cannot be disabled.
• Analytics Cookies — Help us understand how visitors interact with our website (e.g., Google Analytics).
• Preference Cookies — Remember your settings and preferences for future visits.
• Marketing Cookies — Used to deliver relevant advertisements and track campaign effectiveness (only with consent).

You may control cookie settings through your browser preferences. Note that disabling certain cookies may affect the functionality of our website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. DATA SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We implement a variety of administrative, technical, and physical security measures to protect your personal information. These include: SSL/TLS encryption for data in transit, access controls and authentication mechanisms for internal systems, regular security assessments and vulnerability testing, and employee training on data privacy and cybersecurity best practices.

While we take every reasonable precaution, no method of electronic transmission or storage is completely secure. We cannot guarantee absolute security and encourage you to take steps to protect your own information, such as using strong passwords and being cautious about the information you share online.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. YOUR RIGHTS UNDER PHILIPPINE DATA PRIVACY LAW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Under the Data Privacy Act of 2012 (R.A. 10173) and its implementing rules, you have the following rights:

• Right to Be Informed — You have the right to know how your personal data is being collected and processed.
• Right to Access — You may request a copy of the personal data we hold about you.
• Right to Rectification — You may request corrections to inaccurate or incomplete data.
• Right to Erasure — You may request the deletion of your data in certain circumstances (e.g., if it is no longer necessary for the purpose for which it was collected).
• Right to Restrict Processing — You may request that we limit how we use your data under certain conditions.
• Right to Data Portability — You may request a copy of your data in a structured, commonly used, machine-readable format.
• Right to Object — You may object to the processing of your data for direct marketing or other purposes.
• Right to Lodge a Complaint — You have the right to lodge a complaint with the National Privacy Commission (NPC) of the Philippines if you believe your rights have been violated.

To exercise any of these rights, please contact us at info@progrex.cloud. We will respond to your request within thirty (30) days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. CHILDREN'S PRIVACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a child without verifiable parental consent, we will take steps to delete that information promptly. If you believe we have inadvertently collected information from a minor, please contact us immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. THIRD-PARTY LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our website may contain links to third-party websites, social media platforms, or external resources. This Privacy Policy does not apply to those sites. We encourage you to review the privacy policies of any third-party websites you visit. PROGREX is not responsible for the content, privacy practices, or security of external sites.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. INTERNATIONAL DATA TRANSFERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your information may be processed and stored on servers located outside the Philippines. When we transfer your data internationally, we take steps to ensure that it is protected by appropriate safeguards, including contractual arrangements that provide equivalent protection to that afforded under Philippine law.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. CHANGES TO THIS PRIVACY POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We reserve the right to update or modify this Privacy Policy at any time. When we do, we will revise the "Last Updated" date at the top of this page and, where appropriate, notify you by email or through a prominent notice on our website. We encourage you to review this Policy periodically to stay informed about how we are protecting your information.

Your continued use of our website or services following the posting of changes constitutes your acceptance of those changes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. CONTACT US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For questions, concerns, or requests related to this Privacy Policy or the handling of your personal data, please contact our Data Privacy Officer:

PROGREX Technologies
Calauan, Laguna, Philippines
Email: info@progrex.cloud
Contact: contact@progrex.cloud
Support: support@progrex.cloud
Phone / WhatsApp: +63 956 593 4460`

const TERMS_OF_SERVICE = `TERMS OF SERVICE

Effective Date: March 1, 2026
Last Updated: March 6, 2026

These Terms of Service ("Terms") constitute a legally binding agreement between you ("Client", "User", or "you") and PROGREX Technologies ("PROGREX", "we", "us", or "our"), a software development company based in Calauan, Laguna, Philippines. By accessing our website at progrex.cloud, engaging our services, or entering into a project agreement with us, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, please discontinue use of our website and services immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ABOUT PROGREX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROGREX Technologies is a full-service technology solutions company specializing in custom software development, web application development, mobile application development (iOS and Android), IT consulting and infrastructure, system integration, and ready-made enterprise software systems (ProSchool, ProInventory, ProHRIS, and more). We serve businesses, organizations, academic institutions, and individuals across the Philippines and internationally, providing tailored technology solutions designed to drive efficiency, growth, and digital transformation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. ACCEPTANCE OF TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By using this website or engaging PROGREX for any service, you confirm that:

• You are at least 18 years of age or have the legal capacity to enter into binding contracts under applicable law.
• If acting on behalf of a company or organization, you have the authority to bind that entity to these Terms.
• You have read and understood these Terms in their entirety.
• Your continued use of our website or services following any updates to these Terms constitutes acceptance of the revised Terms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. SCOPE OF SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3.1 Service Description
PROGREX offers the following primary services:

• Custom Software Development — Bespoke software applications designed and built to meet specific client requirements, business processes, and workflows.
• Web Development — Design and development of websites, web applications, landing pages, e-commerce platforms, and web portals.
• Mobile App Development — Native and cross-platform mobile applications for iOS and Android platforms.
• IT Consulting and Infrastructure — Technology advisory, system architecture planning, cloud infrastructure setup, and IT management services.
• System Integration — Integration of third-party systems, APIs, and enterprise platforms into existing client infrastructure.
• Ready-Made Enterprise Systems — Deployment, configuration, and licensing of pre-built systems including ProSchool (school management), ProInventory (inventory management), ProHRIS (human resources information system), and other proprietary products.
• Academic and Capstone Systems — Development support for thesis, capstone, and academic software projects.

3.2 Project Agreements
All services are governed by individual project agreements, proposals, or contracts that define the scope of work, deliverables, timelines, pricing, and specific terms applicable to that engagement. In the event of a conflict between these Terms and a project agreement, the project agreement shall prevail with respect to that specific engagement.

3.3 Service Availability
PROGREX strives to maintain operational continuity but does not guarantee uninterrupted availability of its website or services. We reserve the right to modify, suspend, or discontinue any service at any time with reasonable notice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. CLIENT RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

As a client or user, you agree to:

4.1 Accurate Information — Provide complete, accurate, and up-to-date information when submitting project inquiries, entering contracts, or communicating with our team. Misrepresentation of information may result in termination of services.

4.2 Timely Cooperation — Respond promptly to requests for feedback, approvals, assets, or clarifications. Project timelines are contingent on timely client cooperation. Delays caused by the client may result in revised timelines and additional costs.

4.3 Lawful Use — Use PROGREX's website and services only for lawful purposes and in compliance with all applicable laws and regulations of the Philippines and the jurisdiction in which you operate.

4.4 Non-Interference — You must not attempt to gain unauthorized access to any part of our systems, networks, or servers; introduce malicious code, viruses, or harmful data; or interfere with the operation of our website or services in any way.

4.5 Content Ownership — You warrant that any content, data, logos, images, or materials you provide to PROGREX for use in your project are owned by you or that you have the legal right to use them, and that their use does not infringe any third-party intellectual property rights.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. INTELLECTUAL PROPERTY RIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5.1 PROGREX Proprietary Materials
All content on this website, including but not limited to text, graphics, logos, icons, images, software code, UI/UX designs, and the PROGREX brand identity, are the exclusive property of PROGREX Technologies and are protected by applicable intellectual property laws. Unauthorized reproduction, distribution, or modification of any PROGREX materials is strictly prohibited.

5.2 Client-Commissioned Work
Upon full receipt of payment for a completed project, PROGREX transfers ownership of the custom deliverables to the client, unless otherwise specified in the project agreement. PROGREX retains the right to:
• Use general methodologies, concepts, and non-confidential techniques developed during the project for future engagements.
• Display the completed work in our portfolio and marketing materials, unless a Non-Disclosure Agreement (NDA) prohibits this.
• Retain a license to any reusable components or frameworks included in the deliverables.

5.3 Ready-Made Products
Licensing of PROGREX's proprietary ready-made products (e.g., ProSchool, ProInventory, ProHRIS) does not transfer ownership of the underlying source code or intellectual property. Clients receive a non-exclusive, non-transferable license to use the software as specified in the respective product license agreement.

5.4 Open-Source Components
Where PROGREX incorporates open-source software into deliverables, such components remain subject to their respective open-source licenses. PROGREX will disclose the use of open-source components upon request.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. PAYMENT TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6.1 Pricing
Pricing for PROGREX services is determined on a project-by-project basis and is outlined in the project proposal or quotation. All prices are in Philippine Peso (PHP) unless otherwise stated.

6.2 Payment Schedule
Payments are typically structured as follows, unless agreed otherwise:
• Downpayment (50%) upon project commencement
• Progress payment upon milestone delivery (as applicable)
• Final payment upon project completion and delivery

6.3 Late Payments
Late or overdue payments may result in suspension of work, delayed deliveries, or additional charges. PROGREX reserves the right to charge interest on overdue balances at a rate consistent with applicable Philippine law.

6.4 Refund Policy
Payments made for services already rendered are non-refundable. Refund requests for downpayments or deposits will be evaluated on a case-by-case basis and are subject to the terms of the individual project agreement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. CONFIDENTIALITY AND NON-DISCLOSURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7.1 Mutual Confidentiality
Both PROGREX and the client agree to treat all proprietary information shared during the course of a project as strictly confidential. This includes business processes, technical specifications, trade secrets, financial information, and any other sensitive data designated as confidential by either party.

7.2 Exclusions
Confidentiality obligations do not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was already known to the receiving party prior to disclosure; (c) is received from a third party without restriction; or (d) is required to be disclosed by law or court order.

7.3 Duration
Confidentiality obligations shall survive the termination of any project agreement or these Terms for a period of three (3) years, unless a separate NDA specifies a longer term.

7.4 Non-Disclosure Agreements
For projects involving highly sensitive information, PROGREX is willing to enter into a formal Non-Disclosure Agreement (NDA) prior to project commencement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. WARRANTIES AND REPRESENTATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8.1 PROGREX Warranties
PROGREX warrants that:
• Services will be performed by qualified professionals in a workmanlike manner.
• Deliverables will substantially conform to the agreed specifications.
• We will use commercially reasonable efforts to meet agreed project timelines.
• We will not knowingly incorporate infringing third-party intellectual property into deliverables.

8.2 Post-Delivery Support
Unless a separate maintenance and support agreement is in place, PROGREX provides a limited warranty period of thirty (30) days from project delivery, during which we will address defects or bugs attributable to our work at no additional charge.

8.3 Disclaimer of Warranties
Except as expressly stated above, all services and deliverables are provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. LIMITATION OF LIABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9.1 Exclusion of Consequential Damages
To the maximum extent permitted by applicable law, PROGREX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, loss of business opportunity, or business interruption, arising out of or in connection with our services or these Terms.

9.2 Cap on Liability
In the event PROGREX is found liable for any damages in connection with a specific project or service, our total aggregate liability shall not exceed the total fees paid by the client to PROGREX for that specific project in the twelve (12) months preceding the claim.

9.3 Force Majeure
PROGREX shall not be liable for delays or failure to perform its obligations due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, government actions, internet or telecommunications failures, labor disputes, or pandemics.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. TERMINATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10.1 Termination by Client
Clients may terminate a project engagement by providing written notice to PROGREX. Termination does not entitle the client to a refund of amounts already paid. The client shall pay for all work completed up to the date of termination.

10.2 Termination by PROGREX
PROGREX may terminate or suspend services immediately and without notice if: (a) the client breaches any material term of these Terms or a project agreement; (b) the client fails to make timely payment; (c) the client engages in conduct that PROGREX determines, in its sole discretion, to be harmful, illegal, or unethical; or (d) continuing the engagement would cause PROGREX to violate applicable law.

10.3 Effect of Termination
Upon termination, all outstanding amounts become immediately due. PROGREX will deliver to the client all completed work and work-in-progress upon receipt of full payment. Each party's confidentiality obligations shall survive termination.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. INDEMNIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You agree to indemnify, defend, and hold harmless PROGREX Technologies, its officers, directors, employees, agents, and contractors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of our website or services; (b) your violation of these Terms; (c) your infringement of any third-party rights, including intellectual property rights; or (d) any content or materials you provide to PROGREX.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. WEBSITE USE AND PROHIBITED CONDUCT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When using our website, you agree not to:
• Scrape, crawl, or use automated tools to extract data from our website without express written permission.
• Attempt to probe, scan, or test the vulnerability of our systems.
• Submit false or misleading information through any form or communication channel.
• Impersonate any person or entity or misrepresent your affiliation with any person or entity.
• Use our website for any fraudulent, deceptive, or unlawful purpose.
• Post or transmit any harmful, offensive, defamatory, or otherwise objectionable content.

Violations of these prohibitions may result in immediate termination of access to our website and services, and may be reported to appropriate authorities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. THIRD-PARTY SERVICES AND INTEGRATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Some of our services may involve integration with or use of third-party platforms, APIs, or services (e.g., cloud providers, payment gateways, social media platforms). PROGREX is not responsible for the performance, availability, or terms of such third-party services. Your use of third-party services integrated into PROGREX deliverables may be subject to the respective third-party's terms and conditions and privacy policies.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14. GOVERNING LAW AND DISPUTE RESOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

14.1 Governing Law
These Terms and any disputes arising from or related to them shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to conflict of law principles.

14.2 Amicable Resolution
In the event of a dispute, the parties agree to first attempt to resolve the matter amicably through good-faith negotiations. Either party may initiate this process by providing written notice of the dispute.

14.3 Jurisdiction
If the dispute cannot be resolved amicably within thirty (30) days of written notice, the parties agree to submit the matter to the appropriate courts of the Philippines, with venue in the relevant Regional Trial Court having jurisdiction over Laguna, Philippines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15. SEVERABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If any provision of these Terms is found to be invalid, unlawful, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, or if modification is not possible, severed from these Terms. The remaining provisions shall continue in full force and effect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
16. ENTIRE AGREEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These Terms, together with any applicable project agreements, quotations, or NDAs, constitute the entire agreement between you and PROGREX with respect to the subject matter hereof, and supersede all prior and contemporaneous agreements, representations, and understandings, whether written or oral.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
17. CHANGES TO THESE TERMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROGREX reserves the right to update, modify, or replace these Terms at any time. We will provide notice of material changes by updating the "Last Updated" date above and, where appropriate, by notifying clients via email. Your continued use of our website or services after changes are posted constitutes your acceptance of the revised Terms. It is your responsibility to review these Terms periodically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18. CONTACT US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For any questions, concerns, or legal inquiries regarding these Terms of Service, please contact us:

PROGREX Technologies
Calauan, Laguna, Philippines
Email: info@progrex.cloud
Contact: contact@progrex.cloud
Support: support@progrex.cloud
Phone / WhatsApp: +63 956 593 4460
Website: https://progrex.cloud`

// ─── Modal component ──────────────────────────────────────────────────────────

function LegalModal({
  title,
  content,
  onClose,
  closeLabel = 'CLOSE',
}: {
  title: string
  content: string
  onClose: () => void
  closeLabel?: string
}) {
  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(5,5,20,0.98)',
          border: '1px solid rgba(103,232,249,0.18)',
          boxShadow: '0 0 60px rgba(103,232,249,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(103,232,249,0.1)' }}
        >
          <h2 className="font-mono text-sm font-semibold text-nebula-300 uppercase tracking-widest">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <pre
            className="text-white/55 text-sm leading-relaxed whitespace-pre-wrap font-sans text-justify"
          >
            {content.trim()}
          </pre>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 shrink-0 flex justify-end"
          style={{ borderTop: '1px solid rgba(103,232,249,0.08)' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-mono font-semibold rounded-lg text-nebula-300 transition-all hover:bg-nebula-400/10"
            style={{ border: '1px solid rgba(103,232,249,0.25)' }}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const { t, translations } = useTranslation()
  const [modal, setModal] = useState<'privacy' | 'terms' | null>(null)

  const companyHrefs = ['/about', '/about#team', '/projects', '/contact']
  const servicesHrefs = ['/services/custom-software-development', '/services/web-development', '/services/mobile-app-development', '/services']
  const productsHrefs = ['/ready-made-systems', '/ready-made-systems', '/ready-made-systems', '/ready-made-systems']
  const resourcesHrefs = ['/blogs', '/projects', 'modal:privacy', 'modal:terms']

  const tFooter = translations.footer
  const footerLinks = {
    [tFooter.companyHeading]: companyHrefs.map((href, i) => ({ label: (tFooter.companyLinks as unknown as string[])[i] ?? '', href })),
    [tFooter.servicesHeading]: servicesHrefs.map((href, i) => ({ label: (tFooter.servicesLinks as unknown as string[])[i] ?? '', href })),
    [tFooter.productsHeading]: productsHrefs.map((href, i) => ({ label: (tFooter.productsLinks as unknown as string[])[i] ?? '', href })),
    [tFooter.resourcesHeading]: resourcesHrefs.map((href, i) => ({ label: (tFooter.resourcesLinks as unknown as string[])[i] ?? '', href })),
  }

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href === 'modal:privacy') {
      e.preventDefault()
      setModal('privacy')
    } else if (href === 'modal:terms') {
      e.preventDefault()
      setModal('terms')
    }
  }

  return (
    <>
      {/* Legal modals */}
      {modal === 'privacy' && (
        <LegalModal
          title={t('footer.privacyTitle')}
          content={PRIVACY_POLICY}
          onClose={() => setModal(null)}
          closeLabel={t('footer.close')}
        />
      )}
      {modal === 'terms' && (
        <LegalModal
          title={t('footer.termsTitle')}
          content={TERMS_OF_SERVICE}
          onClose={() => setModal(null)}
          closeLabel={t('footer.close')}
        />
      )}

      <footer
        className="relative overflow-hidden border-t"
        style={{
          background: 'rgba(2,2,10,0.82)',
          borderTopColor: 'rgba(103,232,249,0.1)',
        }}
      >
        {/* Background dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
        {/* Bottom nebula glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-50 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(103,232,249,0.05), transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Top Section */}
          <div className="pt-8 pb-5 flex flex-col lg:flex-row gap-16">
            {/* Brand column */}
            <div className="shrink-0 lg:w-56">
              <Link href="/" className="inline-flex mb-2 group" aria-label="PROGREX">
                <Image
                  src="/Progrex Logo White Transparent.png"
                  alt="PROGREX"
                  width={240}
                  height={96}
                  className="h-26 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
              <p className="text-white/40 text-sm leading-relaxed max-w-55">
                {t('footer.brand')}
              </p>
            </div>

            {/* Right side: link columns + contact info stacked */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Link columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <h4 className="font-mono text-xs text-nebula-400/80 uppercase tracking-[0.18em] mb-4 font-semibold">
                      {category}
                    </h4>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.label}>
                          {link.href.startsWith('modal:') ? (
                            <button
                              onClick={(e) => handleLinkClick(link.href, e)}
                              className="text-white/45 text-sm hover:text-nebula-300 transition-colors duration-200 flex items-center gap-1.5 group cursor-pointer"
                            >
                              <span className="w-0 group-hover:w-2 h-px bg-nebula-400 transition-all duration-200 overflow-hidden" />
                              {link.label}
                            </button>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-white/45 text-sm hover:text-nebula-300 transition-colors duration-200 flex items-center gap-1.5 group"
                            >
                              <span className="w-0 group-hover:w-2 h-px bg-nebula-400 transition-all duration-200 overflow-hidden" />
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Contact info — below the columns */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 pt-5"
                style={{ borderTop: '1px solid rgba(103,232,249,0.08)' }}
              >
                <a
                  href="mailto:info@progrex.cloud"
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-nebula-300 transition-colors group"
                >
                  <Mail size={13} className="text-nebula-400 shrink-0 group-hover:text-nebula-300 transition-colors" />
                  info@progrex.cloud
                </a>
                <a
                  href="mailto:contact@progrex.cloud"
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-nebula-300 transition-colors group"
                >
                  <Mail size={13} className="text-nebula-400 shrink-0 group-hover:text-nebula-300 transition-colors" />
                  contact@progrex.cloud
                </a>
                <a
                  href="tel:+639565934460"
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-nebula-300 transition-colors group"
                >
                  <Phone size={13} className="text-nebula-400 shrink-0 group-hover:text-nebula-300 transition-colors" />
                  +63 956 593 4460
                </a>
                <a
                  href="https://maps.app.goo.gl/WgfDFasr8aCbdwzK7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-nebula-300 transition-colors group"
                >
                  <MapPin size={13} className="text-nebula-400 shrink-0 group-hover:text-nebula-300 transition-colors" />
                  Calauan, Laguna, Philippines
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(103,232,249,0.08)' }}
          >
            <p className="font-mono text-sm text-white/25 tracking-wider">
              {t('footer.copyright').replace('{year}', String(new Date().getFullYear()))}
            </p>

            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-nebula-300 transition-all duration-200"
                  style={{ border: '1px solid rgba(103,232,249,0.12)' }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
