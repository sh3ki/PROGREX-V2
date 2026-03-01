// ─── SERVICES ───────────────────────────────────────────────────────────────
export const services = [
  {
    id: 'custom-software-development',
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    shortDesc: 'Tailored software solutions engineered to solve your unique business challenges at any scale.',
    icon: '🖥️',
    color: 'from-[#3A0CA3] to-[#4361EE]',
    description:
      'We design, develop, and deploy custom software solutions that align perfectly with your business processes. From enterprise resource planning to specialized tools, we bring your vision to life with clean, scalable code.',
    process: [
      { step: 1, title: 'Discovery & Analysis', desc: 'We deep-dive into your requirements, processes, and goals.' },
      { step: 2, title: 'System Design', desc: 'Architecture planning, database schema, and tech stack selection.' },
      { step: 3, title: 'Agile Development', desc: 'Iterative sprints with regular demos and feedback loops.' },
      { step: 4, title: 'QA & Testing', desc: 'Comprehensive unit, integration, and performance testing.' },
      { step: 5, title: 'Deployment', desc: 'CI/CD pipeline setup and production deployment.' },
      { step: 6, title: 'Maintenance', desc: 'Ongoing support, updates, and feature enhancements.' },
    ],
    technologies: ['React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Redis', 'GraphQL'],
    deliverables: [
      'Complete source code with inline documentation',
      'Database schema, ERD & data dictionary',
      'REST / GraphQL API documentation',
      'CI/CD pipeline configuration',
      'Production deployment & environment setup',
      'Post-launch bug fixes (30-day warranty)',
    ],
    idealFor: [
      { title: 'Startups & SMEs', desc: 'Building a new product or internal tool from the ground up with a reliable technical partner.' },
      { title: 'Enterprise Teams', desc: 'Modernizing legacy systems or extending business-critical capabilities without disrupting operations.' },
      { title: 'Product Companies', desc: 'Scaling or rebuilding core platform features with clean, maintainable, production-ready code.' },
    ],
    highlights: [
      { icon: 'Layers', label: 'Full-Stack Delivery', desc: 'Front-end, back-end, database, and DevOps — all designed and built under one roof.' },
      { icon: 'ShieldCheck', label: 'IP Ownership', desc: 'You own 100% of the source code and all intellectual property upon project completion.' },
      { icon: 'RefreshCw', label: 'Agile Process', desc: 'Weekly sprints, demos, and structured feedback loops keep you in full control throughout.' },
      { icon: 'Headphones', label: 'Post-Launch Support', desc: '30-day free bug-fix warranty and optional long-term maintenance retainer plans.' },
    ],
    faqs: [
      { q: 'How long does a custom project take?', a: 'Timelines vary by complexity — typically 3–12 months for enterprise projects, 4–8 weeks for smaller tools.' },
      { q: 'Do you sign NDAs?', a: 'Absolutely. We sign NDA before any project discussion.' },
      { q: 'Will I own the source code?', a: 'Yes. Upon full payment, all IP and source code belong to you.' },
    ],
  },
  {
    id: 'web-development',
    slug: 'web-development',
    title: 'Web Development',
    shortDesc: 'High-performance, visually stunning websites and web apps built for conversion and scale.',
    icon: '🌐',
    color: 'from-[#560BAD] to-[#831DC6]',
    description:
      'From corporate websites to complex SaaS platforms, we build fast, accessible, and SEO-optimized web experiences. Our front-end engineers craft pixel-perfect UIs while our back-end experts ensure rock-solid APIs.',
    process: [
      { step: 1, title: 'Strategy & Wireframing', desc: 'User flows, sitemap, and wireframe design.' },
      { step: 2, title: 'UI/UX Design', desc: 'High-fidelity mockups with your brand system.' },
      { step: 3, title: 'Front-End Development', desc: 'React/Next.js powered with Tailwind CSS.' },
      { step: 4, title: 'Back-End & APIs', desc: 'RESTful or GraphQL APIs with secure authentication.' },
      { step: 5, title: 'Performance Optimization', desc: 'Core Web Vitals tuning, lazy loading, CDN.' },
      { step: 6, title: 'Launch & SEO', desc: 'Production deployment with SEO and analytics setup.' },
    ],
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Prisma', 'Vercel', 'PostgreSQL', 'Stripe', 'Framer Motion'],
    deliverables: [
      'Responsive, pixel-perfect web app or website',
      'CMS or admin dashboard (if applicable)',
      'SEO-optimized page structure & meta setup',
      'Analytics integration (GA4 / Plausible)',
      'Performance-tuned production build',
      'Hosting, domain, and DNS configuration',
    ],
    idealFor: [
      { title: 'Businesses & Brands', desc: 'Need a high-converting, professional online presence that authentically reflects your brand.' },
      { title: 'SaaS Founders', desc: 'Building a web-based platform with subscriptions, user dashboards, and third-party API integrations.' },
      { title: 'E-commerce Operators', desc: 'Launching or upgrading an online store with modern UX, optimized checkout, and payment flows.' },
    ],
    highlights: [
      { icon: 'Gauge', label: 'Performance First', desc: 'Core Web Vitals optimized — Lighthouse scores above 90 across performance, SEO, and accessibility.' },
      { icon: 'Globe', label: 'SEO Ready', desc: 'Structured data, semantic HTML, and meta architecture built in from the very first page.' },
      { icon: 'Smartphone', label: 'Mobile-First Design', desc: 'Every interface is designed and thoroughly tested on mobile, tablet, and desktop.' },
      { icon: 'Lock', label: 'Secure by Default', desc: 'HTTPS, input validation, rate limiting, and secure authentication on every project.' },
    ],
    faqs: [
      { q: 'Will the website be mobile-friendly?', a: 'Every site we build is mobile-first and tested across all devices.' },
      { q: 'Do you provide hosting?', a: 'We can set up and manage hosting on Vercel, AWS, or your preferred provider.' },
      { q: 'Can you redesign my existing site?', a: 'Yes. We offer full redesigns while preserving your SEO equity.' },
    ],
  },
  {
    id: 'mobile-app-development',
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    shortDesc: 'Native and cross-platform mobile apps that deliver exceptional user experiences on iOS and Android.',
    icon: '📱',
    color: 'from-[#831DC6] to-[#CFA3EA]',
    description:
      'We build iOS and Android applications using React Native and Flutter for cross-platform efficiency, or Swift/Kotlin for native performance. Every app is designed for engagement, retention, and scalability.',
    process: [
      { step: 1, title: 'Market & User Research', desc: 'Competitor analysis and user persona definition.' },
      { step: 2, title: 'UX Prototyping', desc: 'Interactive prototypes for user flow validation.' },
      { step: 3, title: 'App Development', desc: 'React Native or Flutter cross-platform development.' },
      { step: 4, title: 'Backend Integration', desc: 'API integration, push notifications, offline sync.' },
      { step: 5, title: 'App Store Submission', desc: 'iOS App Store and Google Play deployment.' },
      { step: 6, title: 'Analytics & Updates', desc: 'Crash reporting, analytics, and iterative updates.' },
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Node.js', 'AWS', 'Expo', 'Redux', 'SQLite'],
    deliverables: [
      'Published iOS & Android app (App Store + Google Play)',
      'App Store listing assets & screenshots',
      'Push notification setup & configuration',
      'Analytics & crash reporting integration',
      'API backend documentation',
      'Post-submission support (14 days)',
    ],
    idealFor: [
      { title: 'Consumer Product Startups', desc: 'Launching a mobile-first product targeting end users on both iOS and Android.' },
      { title: 'Businesses with Field Teams', desc: 'Need offline-capable, GPS-aware, or hardware-connected mobile tools for staff in the field.' },
      { title: 'SaaS Companies', desc: 'Adding a polished mobile client alongside an existing web platform or backend API.' },
    ],
    highlights: [
      { icon: 'Smartphone', label: 'Cross-Platform Efficiency', desc: 'React Native & Flutter deliver native-quality UX at a fraction of the cost of two native builds.' },
      { icon: 'WifiOff', label: 'Offline Support', desc: 'Local storage, sync queues, and conflict resolution for robust offline-first apps.' },
      { icon: 'BellRing', label: 'Push Notifications', desc: 'Targeted campaigns, transactional alerts, and scheduled reminders built in from the start.' },
      { icon: 'BarChart2', label: 'Built-In Analytics', desc: 'Event tracking, conversion funnels, and retention metrics instrumented from day one.' },
    ],
    faqs: [
      { q: 'Cross-platform or native?', a: 'We recommend cross-platform (React Native/Flutter) for cost efficiency unless specific native features are required.' },
      { q: 'How much does an app cost?', a: 'Ranges from $5,000 for simple apps to $50,000+ for complex platforms with custom backends.' },
      { q: 'Do you handle App Store submissions?', a: 'Yes — we manage the full submission process for both App Store and Google Play.' },
    ],
  },
  {
    id: 'system-integration',
    slug: 'system-integration',
    title: 'System Integration',
    shortDesc: 'Seamlessly connect your existing systems, APIs, and third-party platforms for unified operations.',
    icon: '🔗',
    color: 'from-[#4361EE] to-[#3A0CA3]',
    description:
      'Break down data silos and achieve operational efficiency by integrating disparate systems. We connect ERPs, CRMs, payment gateways, third-party APIs, and legacy systems into a unified, automated ecosystem.',
    process: [
      { step: 1, title: 'Systems Audit', desc: 'Map all existing systems, data flows, and integration points.' },
      { step: 2, title: 'Integration Design', desc: 'Define API contracts, middleware, and data transformation rules.' },
      { step: 3, title: 'Development', desc: 'Build connectors, webhooks, and middleware services.' },
      { step: 4, title: 'Testing', desc: 'End-to-end integration and data integrity testing.' },
      { step: 5, title: 'Deployment', desc: 'Zero-downtime deployment with rollback strategies.' },
      { step: 6, title: 'Monitoring', desc: 'Real-time monitoring, alerting, and error handling.' },
    ],
    technologies: ['REST APIs', 'GraphQL', 'Webhooks', 'Zapier', 'Make.com', 'Kafka', 'RabbitMQ', 'AWS Lambda', 'n8n', 'Salesforce API'],
    deliverables: [
      'Integration architecture & data flow document',
      'Custom API connectors & middleware',
      'Data transformation and mapping rules',
      'Error handling, retry logic & dead-letter queues',
      'End-to-end integration test results',
      'Live monitoring dashboard & alert setup',
    ],
    idealFor: [
      { title: 'Growing Businesses', desc: 'Using multiple SaaS tools that do not sync, creating manual data silos and costly double-entry work.' },
      { title: 'Enterprises with Legacy Systems', desc: 'Needing to connect old on-premise software with modern cloud platforms and REST APIs.' },
      { title: 'Operations Teams', desc: 'Spending hours on data exports, copy-paste workflows, and manual consolidation cycles every week.' },
    ],
    highlights: [
      { icon: 'Plug', label: 'Any-to-Any Integration', desc: 'REST, GraphQL, SOAP, webhooks, FTP — we bridge virtually any protocol combination.' },
      { icon: 'ShieldCheck', label: 'Secure Data Transit', desc: 'OAuth 2.0, API key rotation, and TLS-encrypted channels on every integration.' },
      { icon: 'Activity', label: 'Real-Time Monitoring', desc: 'Live integration health dashboards with automatic failure alerting and retry logic.' },
      { icon: 'RefreshCw', label: 'Zero-Downtime Rollout', desc: 'Gradual cutover strategies with rollback plans ensure business continuity during go-live.' },
    ],
    faqs: [
      { q: 'Can you integrate legacy systems?', a: 'Yes, we specialize in bridging modern and legacy systems using adapters and middleware.' },
      { q: 'What about data security?', a: 'All integrations are secured with OAuth 2.0, API key management, and encrypted data transit.' },
    ],
  },
  {
    id: 'academic-capstone-system-development',
    slug: 'academic-capstone-system-development',
    title: 'Academic / Capstone System Development',
    shortDesc: 'Professional, functional capstone and thesis systems for students — delivered on time, every time.',
    icon: '🎓',
    color: 'from-[#3A0CA3] to-[#831DC6]',
    description:
      'We help students build impressive, fully-functional capstone and thesis systems. From inventory management to healthcare systems, we build complete, documented, and presentable systems that exceed academic requirements.',
    process: [
      { step: 1, title: 'Requirements Gathering', desc: 'Review your thesis proposal and define system scope.' },
      { step: 2, title: 'System Design', desc: 'ERD, DFD, use case diagrams, and wireframes.' },
      { step: 3, title: 'Development', desc: 'Full system development with documentation.' },
      { step: 4, title: 'Testing', desc: 'Bug-free, tested system ready for demonstration.' },
      { step: 5, title: 'Documentation', desc: 'Complete technical and user documentation.' },
      { step: 6, title: 'Presentation Support', desc: 'Practice walkthrough for your panel defense.' },
    ],
    technologies: ['PHP/Laravel', 'MySQL', 'React', 'Python', 'Java', 'C#/.NET', 'Bootstrap', 'Vue.js', 'Firebase', 'SQLite'],
    deliverables: [
      'Fully functional, demo-ready system',
      'Commented and organized source code',
      'Technical documentation (ERD, DFD, use cases)',
      'User manual and admin guide',
      'Presentation walkthrough and rehearsal session',
      'Bug-free demo build ready for panel defense',
    ],
    idealFor: [
      { title: 'Graduating Students', desc: 'Need a complete, documented, and demo-ready capstone or thesis system to pass panel review.' },
      { title: 'Student Project Groups', desc: 'Teams whose scope exceeds their current technical skills and need professional-grade development.' },
      { title: 'Deadline-Pressured Students', desc: 'Panel defense approaching with development behind schedule — rush delivery is available.' },
    ],
    highlights: [
      { icon: 'Clock', label: 'Fast Delivery', desc: 'Rush orders accepted — most capstone systems are completed within 2 to 4 weeks.' },
      { icon: 'BookOpen', label: 'Full Documentation', desc: 'Complete technical docs, ERD, DFD, use case diagrams, and user manuals included.' },
      { icon: 'GraduationCap', label: 'Panel-Ready Builds', desc: 'Clean UI, working features, and demo scenarios walkthroughs rehearsed with you before defense.' },
      { icon: 'ShieldCheck', label: 'NDA Protected', desc: 'Your project idea and all project details are handled with complete confidentiality under NDA.' },
    ],
    faqs: [
      { q: 'Is this plagiarism?', a: 'No. All systems are custom-built from scratch. We also provide guidance so you understand your own system.' },
      { q: 'How fast can you deliver?', a: 'Rush delivery available. Most capstone systems are completed in 2–4 weeks.' },
    ],
  },
  {
    id: 'it-consulting-infrastructure',
    slug: 'it-consulting-infrastructure',
    title: 'IT Consulting / Infrastructure',
    shortDesc: 'Strategic technology consulting and infrastructure setup to optimize your business operations.',
    icon: '⚙️',
    color: 'from-[#560BAD] to-[#4361EE]',
    description:
      'Our IT consultants provide expert guidance on technology strategy, cloud migration, DevOps implementation, cybersecurity, and infrastructure optimization. We help businesses make the right technology decisions.',
    process: [
      { step: 1, title: 'IT Audit', desc: 'Assess current infrastructure, security, and processes.' },
      { step: 2, title: 'Strategy Development', desc: 'Roadmap for technology improvements and investments.' },
      { step: 3, title: 'Implementation Planning', desc: 'Detailed execution plan with timelines and KPIs.' },
      { step: 4, title: 'Execution', desc: 'Hands-on implementation and configuration.' },
      { step: 5, title: 'Training', desc: 'Team training and knowledge transfer.' },
      { step: 6, title: 'Ongoing Support', desc: 'Managed services and continuous optimization.' },
    ],
    technologies: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Nginx', 'Cloudflare', 'Datadog'],
    deliverables: [
      'Current-state IT audit report',
      'Prioritized technology roadmap',
      'Implementation plan with KPIs and milestones',
      'Cloud architecture diagrams',
      'Security and compliance recommendations document',
      'Team training and knowledge transfer sessions',
    ],
    idealFor: [
      { title: 'Growing SMEs', desc: 'Scaling operations rapidly and needing a clear, actionable technology strategy aligned to budget.' },
      { title: 'Companies Migrating to Cloud', desc: 'Transitioning from costly on-premise infrastructure to AWS, Azure, or Google Cloud.' },
      { title: 'Teams with Security Concerns', desc: 'Need a comprehensive audit and hardening of their IT environment before a compliance review.' },
    ],
    highlights: [
      { icon: 'Map', label: 'Technology Roadmap', desc: 'A clear, prioritized roadmap aligned to your business goals, constraints, and budget reality.' },
      { icon: 'Cloud', label: 'Multi-Cloud Expertise', desc: 'Deep hands-on experience across AWS, Azure, and GCP for migrations and architecture design.' },
      { icon: 'Shield', label: 'Security-First Lens', desc: 'Every recommendation is evaluated through a cybersecurity and regulatory compliance lens.' },
      { icon: 'Users', label: 'Knowledge Transfer', desc: 'We train your team thoroughly so you are never dependent on external expertise long-term.' },
    ],
    faqs: [
      { q: 'Do you offer cloud migration?', a: 'Yes. We migrate on-premise systems to AWS, Azure, or GCP with minimal downtime.' },
      { q: 'Can you help with cybersecurity?', a: 'Yes. We offer security audits, penetration testing recommendations, and security hardening.' },
    ],
  },
]

// ─── PROJECTS ───────────────────────────────────────────────────────────────
export const projects = [
  {
    id: 'nexus-erp',
    slug: 'nexus-erp',
    title: 'Nexus ERP Platform',
    category: 'Enterprise',
    industry: 'Manufacturing',
    shortDesc: 'End-to-end enterprise resource planning system for a 500-employee manufacturing company.',
    image: '/images/projects/nexus-erp.jpg',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    overview: 'A comprehensive ERP system covering inventory, HR, payroll, procurement, and financial reporting.',
    problem: 'The client operated on disconnected spreadsheets and legacy software, causing data inconsistencies and operational delays.',
    solution: 'We built a unified ERP platform with real-time dashboards, automated workflows, and role-based access control.',
    features: ['Inventory Management', 'HR & Payroll', 'Procurement Module', 'Financial Reporting', 'Supplier Portal', 'Analytics Dashboard'],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    results: [
      { metric: 'Operational Efficiency', value: '+65%' },
      { metric: 'Data Entry Time Reduced', value: '-80%' },
      { metric: 'Report Generation', value: 'Realtime' },
      { metric: 'ROI in Year 1', value: '340%' },
    ],
    testimonial: {
      quote: 'PROGREX delivered a system that transformed how we operate. Best investment we ever made.',
      author: 'Marcus Thompson',
      role: 'COO, Nexus Manufacturing',
    },
  },
  {
    id: 'edutrack-lms',
    slug: 'edutrack-lms',
    title: 'EduTrack LMS',
    category: 'Web',
    industry: 'Education',
    shortDesc: 'Full-featured learning management system for a network of 12 schools across the Philippines.',
    image: '/images/projects/edutrack-lms.jpg',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe'],
    overview: 'A scalable LMS with online courses, assessments, live sessions, parent monitoring, and payment integration.',
    problem: 'Schools needed a unified digital platform for remote learning, grading, and parent-teacher communication.',
    solution: 'We built EduTrack — a multi-tenant LMS with school-specific branding, student dashboards, and integrated Stripe payment.',
    features: ['Course Management', 'Live Sessions', 'Assessment Engine', 'Parent Portal', 'Grade Tracking', 'Certificate Generation'],
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe', 'Zoom API', 'Vercel'],
    results: [
      { metric: 'Students Enrolled', value: '18,000+' },
      { metric: 'Course Completion Rate', value: '87%' },
      { metric: 'Schools on Platform', value: '12' },
      { metric: 'Parent Satisfaction', value: '4.9/5' },
    ],
    testimonial: {
      quote: 'EduTrack has become the backbone of our digital education strategy. Outstanding platform.',
      author: 'Dr. Elena Santos',
      role: 'Director, EduNet Schools',
    },
  },
  {
    id: 'swiftcart-ecommerce',
    slug: 'swiftcart-ecommerce',
    title: 'SwiftCart E-Commerce',
    category: 'E-commerce',
    industry: 'Retail',
    shortDesc: 'High-conversion multi-vendor e-commerce platform with real-time inventory and advanced analytics.',
    image: '/images/projects/swiftcart.jpg',
    tags: ['Next.js', 'MongoDB', 'Stripe', 'AWS'],
    overview: 'A B2C/B2B e-commerce platform supporting multiple vendors, dynamic pricing, and logistics integration.',
    problem: 'The client had a basic website with poor UX and no inventory management, losing 40% of potential customers at checkout.',
    solution: 'We rebuilt the entire platform with Next.js, optimized checkout flow, multi-vendor support, and real-time inventory tracking.',
    features: ['Multi-Vendor Support', 'Dynamic Pricing', 'Real-Time Inventory', 'Advanced Analytics', 'Logistics Integration', 'Mobile App'],
    technologies: ['Next.js', 'MongoDB', 'Stripe', 'AWS S3', 'Redis', 'React Native', 'Elasticsearch'],
    results: [
      { metric: 'Conversion Rate', value: '+127%' },
      { metric: 'Page Load Speed', value: '1.2s avg' },
      { metric: 'Monthly Revenue Growth', value: '+89%' },
      { metric: 'Cart Abandonment', value: '-45%' },
    ],
    testimonial: {
      quote: 'Our sales literally doubled in 3 months after launching the new platform. PROGREX delivered.',
      author: 'Jei Santos',
      role: 'CEO, SwiftCart Retail',
    },
  },
  {
    id: 'meditrack-hms',
    slug: 'meditrack-hms',
    title: 'MediTrack Hospital Management',
    category: 'Enterprise',
    industry: 'Healthcare',
    shortDesc: 'Comprehensive hospital management system covering patient records, billing, pharmacy, and telemedicine.',
    image: '/images/projects/meditrack.jpg',
    tags: ['React', 'Python', 'PostgreSQL', 'WebRTC'],
    overview: 'A full-stack HMS with EMR/EHR, appointment scheduling, pharmacy management, and telemedicine.',
    problem: 'Hospital operations relied on paper-based records causing delays, errors, and compliance risks.',
    solution: 'MediTrack digitizes all hospital operations with HIPAA-compliant patient records, automated billing, and telemedicine.',
    features: ['EMR/EHR', 'Appointment Scheduling', 'Pharmacy Management', 'Telemedicine', 'Billing & Insurance', 'Lab Results'],
    technologies: ['React', 'Python/FastAPI', 'PostgreSQL', 'WebRTC', 'Redis', 'AWS', 'Docker'],
    results: [
      { metric: 'Patient Processing Time', value: '-60%' },
      { metric: 'Billing Accuracy', value: '99.8%' },
      { metric: 'Telemedicine Consultations', value: '2,400/mo' },
      { metric: 'Staff Satisfaction', value: '4.8/5' },
    ],
    testimonial: {
      quote: 'MediTrack revolutionized our operations. Patient care quality has improved dramatically.',
      author: 'Dr. Mark Reyes',
      role: 'Chief Medical Officer',
    },
  },
  {
    id: 'propmanage-saas',
    slug: 'propmanage-saas',
    title: 'PropManage SaaS',
    category: 'SaaS',
    industry: 'Real Estate',
    shortDesc: 'Property management SaaS platform for landlords to manage tenants, rent, maintenance, and reports.',
    image: '/images/projects/propmanage.jpg',
    tags: ['Next.js', 'Stripe', 'PostgreSQL', 'Twilio'],
    overview: 'Multi-tenant SaaS for property managers with automated rent collection, maintenance tickets, and financial reports.',
    problem: 'Property managers used spreadsheets and manual bank transfers causing payment delays and poor tenant communication.',
    solution: 'PropManage automates rent collection, sends reminders via SMS/email, and provides financial dashboards.',
    features: ['Tenant Portal', 'Automated Rent Collection', 'Maintenance Tickets', 'SMS/Email Notifications', 'Financial Reports', 'Multi-Property'],
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'Twilio', 'PostgreSQL', 'Prisma', 'Vercel'],
    results: [
      { metric: 'On-Time Rent Collection', value: '97%' },
      { metric: 'Admin Time Saved', value: '15h/week' },
      { metric: 'Tenants Managed', value: '3,200+' },
      { metric: 'Late Payments', value: '-72%' },
    ],
    testimonial: {
      quote: 'PropManage pays for itself every month. Absolutely transformed our property business.',
      author: 'Lisa Chen',
      role: 'Managing Director, Chen Properties',
    },
  },
  {
    id: 'campusvote-academic',
    slug: 'campusvote-academic',
    title: 'CampusVote System',
    category: 'Academic',
    industry: 'Education',
    shortDesc: 'Secure online student election system with biometric verification and real-time vote counting.',
    image: '/images/projects/campusvote.jpg',
    tags: ['React', 'Laravel', 'MySQL', 'WebSocket'],
    overview: 'A capstone project for university student government elections with biometric login and live results.',
    problem: 'Traditional paper elections were slow, costly, and vulnerable to fraud. The student government needed a digital solution.',
    solution: 'We built CampusVote with fingerprint authentication, encrypted vote storage, and real-time result broadcasting.',
    features: ['Biometric Login', 'Encrypted Voting', 'Live Results Dashboard', 'Audit Trail', 'Admin Panel', 'Mobile Responsive'],
    technologies: ['React', 'Laravel', 'MySQL', 'WebSocket', 'Fingerprint.js', 'Bootstrap'],
    results: [
      { metric: 'Voter Turnout', value: '+43%' },
      { metric: 'Election Duration', value: '6h (previously 3 days)' },
      { metric: 'Zero Fraud Incidents', value: '100%' },
      { metric: 'Student Satisfaction', value: '4.7/5' },
    ],
    testimonial: {
      quote: 'The most impressive capstone system our panel has ever reviewed. Truly production-ready.',
      author: 'Prof. Ana Reyes',
      role: 'Computer Science Department',
    },
  },
]

// ─── READY-MADE SYSTEMS ──────────────────────────────────────────────────────
export const systems = [
  {
    id: 'proschool',
    slug: 'proschool',
    name: 'ProSchool — School Management System',
    tagline: 'The complete school management solution for modern institutions.',
    shortDesc: 'Manage students, teachers, attendance, grades, fees, and more from one powerful platform.',
    features: [
      'Student Enrollment & Profiles',
      'Attendance Tracking',
      'Grade & Report Cards',
      'Fee Collection & Invoicing',
      'Teacher Management',
      'Parent Portal',
      'Announcement Module',
      'Library Management',
    ],
    screenshots: ['/images/systems/proschool-1.jpg', '/images/systems/proschool-2.jpg', '/images/systems/proschool-3.jpg'],
    pricing: [
      { plan: 'Starter', price: '₱8,000', type: 'one-time', students: 'Up to 200', support: '3 months' },
      { plan: 'Professional', price: '₱18,000', type: 'one-time', students: 'Up to 1,000', support: '6 months' },
      { plan: 'Enterprise', price: '₱35,000', type: 'one-time', students: 'Unlimited', support: '12 months' },
    ],
    hasDemo: true,
    faqs: [
      { q: 'Is the system customizable?', a: 'Yes, we can customize branding, modules, and workflows.' },
      { q: 'Do you provide training?', a: 'Yes. Every purchase includes 1 day of free training.' },
    ],
  },
  {
    id: 'proinventory',
    slug: 'proinventory',
    name: 'ProInventory — Inventory Management System',
    tagline: 'Real-time inventory control for businesses of all sizes.',
    shortDesc: 'Track stock, manage suppliers, automate re-orders, and generate detailed reports with ease.',
    features: [
      'Real-Time Stock Tracking',
      'Barcode / QR Scanning',
      'Supplier Management',
      'Purchase Orders',
      'Sales & Invoicing',
      'Low Stock Alerts',
      'Multi-Location Support',
      'Advanced Reports',
    ],
    screenshots: ['/images/systems/proinventory-1.jpg', '/images/systems/proinventory-2.jpg'],
    pricing: [
      { plan: 'Basic', price: '₱5,000', type: 'one-time', users: '2 Users', support: '3 months' },
      { plan: 'Business', price: '₱12,000', type: 'one-time', users: '10 Users', support: '6 months' },
      { plan: 'Enterprise', price: '₱25,000', type: 'one-time', users: 'Unlimited', support: '12 months' },
    ],
    hasDemo: true,
    faqs: [
      { q: 'Does it work offline?', a: 'Yes. The system works locally. Cloud sync is available as an add-on.' },
      { q: 'Can I import existing data?', a: 'Yes. We support Excel/CSV import for all data types.' },
    ],
  },
  {
    id: 'prohris',
    slug: 'prohris',
    name: 'ProHRIS — HR & Payroll System',
    tagline: 'Automate HR operations and payroll with confidence.',
    shortDesc: 'Complete HR platform with payroll computation, DTR tracking, leave management, and compliance.',
    features: [
      'Employee Database',
      'Daily Time Record (DTR)',
      'Payroll Computation',
      'SSS / PhilHealth / Pag-IBIG',
      'Withholding Tax',
      'Leave Management',
      '13th Month Pay',
      'Payslip Generation',
    ],
    screenshots: ['/images/systems/prohris-1.jpg', '/images/systems/prohris-2.jpg'],
    pricing: [
      { plan: 'SME', price: '₱10,000', type: 'one-time', employees: 'Up to 30', support: '3 months' },
      { plan: 'Business', price: '₱20,000', type: 'one-time', employees: 'Up to 100', support: '6 months' },
      { plan: 'Corporate', price: '₱40,000', type: 'one-time', employees: 'Unlimited', support: '12 months' },
    ],
    hasDemo: true,
    faqs: [
      { q: 'Is it BIR compliant?', a: 'Yes. Tax computations follow the latest BIR and TRAIN Law rates.' },
      { q: 'Can I integrate with biometric devices?', a: 'Yes. We support most biometric timekeeping hardware.' },
    ],
  },
]

// ─── BLOGS ───────────────────────────────────────────────────────────────────
export const blogs = [
  {
    id: 'why-custom-software-beats-off-the-shelf',
    slug: 'why-custom-software-beats-off-the-shelf',
    title: 'Why Custom Software Always Beats Off-the-Shelf Solutions',
    category: 'Tech',
    author: { name: 'Alex Rivera', role: 'CTO, PROGREX', avatar: '/images/team/alex.jpg' },
    date: 'January 15, 2026',
    readTime: '7 min read',
    image: '/images/blogs/custom-software.jpg',
    excerpt: 'Generic software forces your business to adapt to the tool. Custom software adapts to your business. Here\'s why that distinction matters more than ever in 2026.',
    tags: ['Software Development', 'Business Strategy', 'Technology'],
    content: `
## The Problem With One-Size-Fits-All

Every business is unique. Your workflows, your customer base, your competitive advantages — none of these fit neatly into a generic SaaS template. Yet thousands of companies force themselves into the constraints of off-the-shelf software because it seems cheaper upfront.

The hidden costs tell a different story.

## The True Cost of Generic Software

When you buy off-the-shelf software, you pay for features you'll never use and lack features you desperately need. You adapt your processes to the software's limitations. You pay recurring licensing fees that compound annually. You're locked into a vendor's roadmap.

## Custom Software: The Long Game

Custom software is an investment, not an expense. When done right, it becomes a **competitive moat** — a system that works exactly the way your team works, automates your specific workflows, and scales as you grow.

### Key Advantages:
- **Exact fit**: Every feature serves your specific needs
- **Scalability**: Built to grow with your business
- **Integration**: Works seamlessly with your existing tools
- **Ownership**: You own the code and the IP
- **No licensing fees**: One-time investment, lifetime value

## When to Choose Custom

Custom software makes the most sense when:
1. Your business process is genuinely unique
2. You're spending heavily on workarounds for generic tools
3. You plan to scale significantly
4. Your data or operations are sensitive

## Conclusion

The question isn't whether custom software is expensive. The question is whether your business can afford **not** to have it.
    `,
    relatedPosts: ['future-of-ai-in-software-development', 'scaling-your-saas'],
  },
  {
    id: 'future-of-ai-in-software-development',
    slug: 'future-of-ai-in-software-development',
    title: 'The Future of AI in Software Development: What to Expect in 2026',
    category: 'Tech',
    author: { name: 'Maria Chen', role: 'Lead Developer, PROGREX', avatar: '/images/team/maria.jpg' },
    date: 'January 28, 2026',
    readTime: '9 min read',
    image: '/images/blogs/ai-development.jpg',
    excerpt: 'AI is not replacing developers — it\'s amplifying them. Here\'s how AI tools are reshaping the software development landscape in 2026.',
    tags: ['AI', 'Software Development', 'Future Tech'],
    content: `
## AI as a Development Multiplier

The narrative that "AI will replace developers" fundamentally misunderstands how software development works. What AI is doing is far more interesting — it's making every developer dramatically more productive.

## What's Changed in 2026

AI-assisted coding tools have matured significantly. We're now seeing:

- **Code generation**: 40-60% of boilerplate code written by AI
- **Bug detection**: AI catching issues before they reach production
- **Architecture suggestions**: AI recommending patterns based on requirements
- **Documentation**: Auto-generated, always up-to-date docs

## The Developer's New Superpower

The best developers in 2026 are those who know how to effectively prompt, guide, and critique AI-generated code. It's a new skill — AI literacy — and it's becoming as fundamental as knowing Git.

## What AI Still Can't Do

AI excels at known patterns. It struggles with:
- **Novel problem-solving**: Truly original business logic
- **Deep domain expertise**: Understanding nuanced industry requirements
- **System architecture decisions**: Long-term technical strategy
- **Client relationships**: Understanding the human side of a project

## Conclusion

AI is the most powerful tool in a developer's arsenal since the IDE. The developers who embrace it will deliver more value, faster. The ones who ignore it will be left behind.
    `,
    relatedPosts: ['why-custom-software-beats-off-the-shelf', 'nextjs-best-practices'],
  },
  {
    id: 'scaling-your-saas',
    slug: 'scaling-your-saas',
    title: 'How to Scale Your SaaS From 100 to 100,000 Users Without Breaking',
    category: 'Business',
    author: { name: 'James Park', role: 'Solutions Architect, PROGREX', avatar: '/images/team/james.jpg' },
    date: 'February 5, 2026',
    readTime: '11 min read',
    image: '/images/blogs/saas-scaling.jpg',
    excerpt: 'Most SaaS products break between 1,000 and 10,000 users. The architecture decisions you make today determine whether you scale smoothly or crash spectacularly.',
    tags: ['SaaS', 'Scaling', 'Architecture', 'Business'],
    content: `
## The Scaling Valley of Death

There's a dangerous zone that kills many promising SaaS products: the growth phase. You've proven product-market fit, users are signing up, and then... the system can't handle it. Slowdowns, outages, frustrated users, churn.

## Foundation First

Before you worry about scaling, get these right:
1. **Database indexing**: Most scaling problems are slow queries
2. **Caching strategy**: Redis for sessions, computed data
3. **CDN for static assets**: Never serve images from your app server
4. **Async processing**: Move heavy work to background queues

## The Horizontal Scaling Play

When vertical scaling (bigger servers) stops being cost-effective, you go horizontal. This requires:
- **Stateless application servers**: Sessions in Redis, not in memory
- **Load balancer**: AWS ALB or Cloudflare
- **Database read replicas**: Separate read and write operations
- **Microservices (when ready)**: Don't over-engineer early

## Database Strategies at Scale

As you grow:
- 100 users: Single PostgreSQL instance
- 10,000 users: Add read replicas, connection pooling (PgBouncer)
- 100,000 users: Sharding, CQRS patterns, event sourcing

## Conclusion

Scaling isn't a problem you solve once. It's a continuous process of measuring, identifying bottlenecks, and optimizing. Build for where you're going, not just where you are.
    `,
    relatedPosts: ['future-of-ai-in-software-development', 'why-custom-software-beats-off-the-shelf'],
  },
  {
    id: 'nextjs-best-practices',
    slug: 'nextjs-best-practices',
    title: 'Next.js 15 Best Practices for Production-Ready Applications',
    category: 'Tech',
    author: { name: 'Alex Rivera', role: 'CTO, PROGREX', avatar: '/images/team/alex.jpg' },
    date: 'February 12, 2026',
    readTime: '8 min read',
    image: '/images/blogs/nextjs-practices.jpg',
    excerpt: 'Building with Next.js? Here are the production-proven best practices our team uses at PROGREX to build fast, scalable, and maintainable applications.',
    tags: ['Next.js', 'React', 'Web Development', 'Performance'],
    content: `
## Why Next.js Dominates in 2026

Next.js has become the de facto standard for production React applications. App Router, Server Components, and built-in optimizations make it the most powerful web framework available.

## Core Best Practices

### 1. Leverage Server Components by Default
Run as much as possible on the server. Only use 'use client' when you truly need interactivity.

### 2. Smart Data Fetching
Fetch data at the component level, as close to where it's used as possible. Use React Suspense for loading states.

### 3. Image Optimization
Always use next/image. It's not optional — it handles WebP conversion, lazy loading, and CLS prevention automatically.

### 4. Route Grouping
Use (groups) to organize routes without affecting the URL structure.

### 5. Parallel Routes and Intercepting Routes
Use these for modals, dashboards, and complex layouts without the URL changing.

## Performance Checklist
- [ ] Bundle analyzer shows no large unnecessary imports
- [ ] All images use next/image
- [ ] Database queries are optimized and indexed
- [ ] Static pages use generateStaticParams
- [ ] Environment variables are properly typed

## Conclusion

Next.js gives you incredible power out of the box. The key is understanding which features to use when — and not over-engineering early.
    `,
    relatedPosts: ['scaling-your-saas', 'future-of-ai-in-software-development'],
  },
]

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
export const testimonials = [
  {
    id: 1,
    name: 'Marcus Thompson',
    role: 'COO, Nexus Manufacturing',
    avatar: '/images/testimonials/marcus.jpg',
    quote: 'PROGREX delivered a system that transformed how we operate. Their team was professional, fast, and the quality of the code was exceptional. Best investment we\'ve ever made.',
    rating: 5,
    company: 'Nexus Manufacturing',
  },
  {
    id: 2,
    name: 'Dr. Elena Santos',
    role: 'Director, EduNet Schools',
    avatar: '/images/testimonials/elena.jpg',
    quote: 'EduTrack has become the backbone of our digital education strategy. PROGREX delivered exactly what they promised, on time, within budget. Outstanding team.',
    rating: 5,
    company: 'EduNet Schools',
  },
  {
    id: 3,
    name: 'Jei Santos',
    role: 'CEO, SwiftCart Retail',
    avatar: '/images/testimonials/jei.jpg',
    quote: 'Our sales literally doubled in 3 months after launching the new platform PROGREX built. I have worked with many dev agencies — none come close to the quality here.',
    rating: 5,
    company: 'SwiftCart Retail',
  },
  {
    id: 4,
    name: 'Lisa Chen',
    role: 'Managing Director, Chen Properties',
    avatar: '/images/testimonials/lisa.jpg',
    quote: 'PropManage pays for itself every month in saved admin time. PROGREX understands business, not just code. They are a true technology partner.',
    rating: 5,
    company: 'Chen Properties',
  },
  {
    id: 5,
    name: 'Dr. Mark Reyes',
    role: 'Chief Medical Officer',
    avatar: '/images/testimonials/mark.jpg',
    quote: 'MediTrack revolutionized our hospital operations. Patient care quality has improved dramatically since deployment. PROGREX delivered beyond our expectations.',
    rating: 5,
    company: 'Reyes Medical Center',
  },
]

// ─── TEAM ────────────────────────────────────────────────────────────────────
export const team = [
  {
    id: 1,
    name: 'Jedidia Shekainah Garcia',
    role: 'Founder & CEO',
    bio: 'Software engineer and entrepreneur with 3+ years building enterprise systems. Passionate about technology that creates real business impact.',
    avatar: '/images/team/jedidia.jpg',
    linkedin: '#',
    github: '#',
  },
  {
    id: 2,
    name: 'Lee Rafael Torres',
    role: 'CTO',
    bio: 'Software engineer specializing in scalable cloud systems. Led engineering teams at multiple startup companies before joining PROGREX.',
    avatar: '/images/team/lee.jpg',
    linkedin: '#',
    github: '#',
  },
  {
    id: 3,
    name: '- -',
    role: 'Lead Developer',
    bio: 'Front-end specialist with a passion for pixel-perfect UI and blazing-fast web performance. React and Next.js expert.',
    avatar: '/images/team/maria.jpg',
    linkedin: '#',
    github: '#',
  },
  {
    id: 4,
    name: '- -',
    role: 'Solutions Architect',
    bio: 'Backend and infrastructure expert. Designs the systems architectures that power PROGREX client solutions at scale.',
    avatar: '/images/team/james.jpg',
    linkedin: '#',
    github: '#',
  },
  {
    id: 5,
    name: '- -',
    role: 'UI/UX Designer',
    bio: 'Design lead creating intuitive and visually stunning interfaces. 7 years in product design for SaaS and enterprise applications.',
    avatar: '/images/team/sofia.jpg',
    linkedin: '#',
    github: '#',
  },
  {
    id: 6,
    name: '- -',
    role: 'Mobile Developer',
    bio: 'React Native and Flutter expert. Has shipped 20+ mobile apps to the App Store and Google Play.',
    avatar: '/images/team/ryan.jpg',
    linkedin: '#',
    github: '#',
  },
]

// ─── TECHNOLOGIES ────────────────────────────────────────────────────────────
export const technologies = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'Redis', category: 'Cache' },
  { name: 'GraphQL', category: 'API' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Prisma', category: 'ORM' },
]

// ─── COMPANY STATS ───────────────────────────────────────────────────────────
export const stats = [
  { label: 'Projects Delivered', value: '150+' },
  { label: 'Happy Clients', value: '80+' },
  { label: 'Years in Business', value: '6+' },
  { label: 'Team Members', value: '25+' },
]

// ─── CORE VALUES ─────────────────────────────────────────────────────────────
export const coreValues = [
  { icon: '⚡', title: 'Speed Without Compromise', desc: 'We deliver fast without sacrificing quality. Agile at heart, methodical in execution.' },
  { icon: '🔒', title: 'Security First', desc: 'Every system we build is designed with security, privacy, and compliance as non-negotiables.' },
  { icon: '🎯', title: 'Obsessed With Quality', desc: 'We don\'t ship code we\'re not proud of. High standards are embedded in our culture.' },
  { icon: '🤝', title: 'True Partnership', desc: 'We treat your goals as our own. Your success is the only metric we track.' },
  { icon: '🌱', title: 'Continuous Innovation', desc: 'We constantly learn, evolve, and apply emerging technologies to solve real problems.' },
  { icon: '💡', title: 'Radical Transparency', desc: 'Clear communication, honest timelines, and no hidden surprises — ever.' },
]

// ─── BLOG CATEGORIES ─────────────────────────────────────────────────────────
export const blogCategories = ['All', 'Tech', 'Business', 'Academic', 'Case Studies']

// ─── PROJECT CATEGORIES ───────────────────────────────────────────────────────
export const projectCategories = ['All', 'Web', 'Mobile', 'Enterprise', 'Academic', 'SaaS', 'E-commerce']
