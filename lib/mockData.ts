// ─── SERVICES ───────────────────────────────────────────────────────────────
export const services = [
  {
    id: 'custom-software-development',
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    shortDesc: 'Tailored software solutions engineered to solve your unique business challenges at any scale. From startup MVPs to enterprise systems, we turn your vision into clean, maintainable, and production-ready code.',
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
    shortDesc: 'High-performance, visually stunning websites and web apps built for conversion and scale. Our engineers craft pixel-perfect UIs backed by rock-solid APIs, consistently fast load times, seamless user experiences, and scalable architectures designed to drive measurable results.',
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
    shortDesc: 'Native and cross-platform mobile apps that deliver exceptional user experiences on iOS and Android. Built with React Native or Flutter, every app is designed for engagement, retention, and long-term growth.',
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
    shortDesc: 'Seamlessly connect your existing systems, APIs, and third-party platforms for unified, automated operations. We eliminate data silos and bridge ERPs, CRMs, payment gateways, and legacy systems into a single ecosystem.',
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
    faqs: [
      { q: 'Can you integrate legacy systems?', a: 'Yes, we specialize in bridging modern and legacy systems using adapters and middleware.' },
      { q: 'What about data security?', a: 'All integrations are secured with OAuth 2.0, API key management, and encrypted data transit.' },
    ],
  },
  {
    id: 'academic-capstone-system-development',
    slug: 'academic-capstone-system-development',
    title: 'Capstone System Development',
    shortDesc: 'Professional, fully functional capstone and thesis systems for students — delivered on time, every time. We build complete, documented, and demo-ready systems that exceed academic panel requirements.',
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
    faqs: [
      { q: 'Is this plagiarism?', a: 'No. All systems are custom-built from scratch. We also provide guidance so you understand your own system.' },
      { q: 'How fast can you deliver?', a: 'Rush delivery available. Most capstone systems are completed in 2–4 weeks.' },
    ],
  },
  {
    id: 'it-consulting-infrastructure',
    slug: 'it-consulting-infrastructure',
    title: 'IT Consulting / Infrastructure',
    shortDesc: 'Strategic technology consulting and infrastructure setup to optimize your business operations. From cloud migrations to DevOps strategy and security hardening, we turn complex IT decisions into clear, ROI-driven action plans.',
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
    faqs: [
      { q: 'Do you offer cloud migration?', a: 'Yes. We migrate on-premise systems to AWS, Azure, or GCP with minimal downtime.' },
      { q: 'Can you help with cybersecurity?', a: 'Yes. We offer security audits, penetration testing recommendations, and security hardening.' },
    ],
  },
  {
    id: 'hardware-integration',
    slug: 'hardware-integration',
    title: 'Hardware Integration',
    shortDesc: 'Bridge the physical and digital worlds by connecting hardware devices, sensors, and embedded systems directly to your software. We design end-to-end IoT solutions that enable real-time monitoring, remote control, and automated data collection from your physical infrastructure.',
    icon: '🔌',
    color: 'from-[#0EA5E9] to-[#4361EE]',
    description:
      'We design and implement IoT architectures that connect physical hardware — from industrial sensors and microcontrollers to smart devices and embedded systems — to cloud and web platforms. Our team handles firmware communication, protocol translation, real-time data pipelines, and dashboard visualization.',
    process: [
      { step: 1, title: 'Hardware Audit', desc: 'Evaluate existing devices, sensors, and communication protocols.' },
      { step: 2, title: 'Architecture Design', desc: 'Design the IoT stack: device layer, gateway, cloud, and dashboard.' },
      { step: 3, title: 'Firmware & Protocol', desc: 'Configure device firmware and communication protocols (MQTT, HTTP, BLE, etc.).' },
      { step: 4, title: 'Cloud Integration', desc: 'Connect hardware to cloud platforms with secure, reliable data pipelines.' },
      { step: 5, title: 'Dashboard & Alerts', desc: 'Build real-time monitoring dashboards and automated alerting.' },
      { step: 6, title: 'Support & Scaling', desc: 'Ongoing device management, OTA updates, and fleet scaling.' },
    ],
    technologies: ['Arduino', 'Raspberry Pi', 'MQTT', 'AWS IoT', 'Node-RED', 'Firebase', 'Python', 'C/C++', 'LoRaWAN', 'Modbus'],
    deliverables: [
      'IoT system architecture document',
      'Configured device firmware & communication protocols',
      'Cloud data ingestion pipeline',
      'Real-time monitoring dashboard',
      'Automated alert & notification system',
      'OTA (over-the-air) update mechanism',
    ],
    idealFor: [
      { title: 'Industrial Operators', desc: 'Monitoring machines, sensors, and production lines in real time from a centralized dashboard.' },
      { title: 'Smart Building Owners', desc: 'Automating HVAC, access control, energy metering, and facility management systems.' },
      { title: 'Logistics & Fleet Companies', desc: 'Tracking vehicles, assets, and cargo with real-time GPS positioning and telemetry.' },
    ],
    highlights: [
      { icon: 'Cpu', label: 'Protocol Agnostic', desc: 'MQTT, HTTP, BLE, LoRaWAN, Modbus — we work with any hardware communication standard.' },
      { icon: 'Activity', label: 'Real-Time Pipelines', desc: 'Live data streams from edge devices to cloud dashboards with minimal latency.' },
      { icon: 'RefreshCw', label: 'OTA Updates', desc: 'Push firmware updates to your entire deployed device fleet remotely and safely at scale.' },
      { icon: 'ShieldCheck', label: 'Secure by Design', desc: 'Device authentication, encrypted channels, and network segmentation built into every solution.' },
    ],
    faqs: [
      { q: 'Do you work with existing hardware?', a: 'Yes. We integrate with virtually any hardware that supports standard communication protocols.' },
      { q: 'Can you build the physical device too?', a: 'We partner with hardware engineers for full device design and prototyping when needed.' },
    ],
  },
  {
    id: 'ai-machine-learning',
    slug: 'ai-machine-learning',
    title: 'AI & Machine Learning',
    shortDesc: 'Harness the power of artificial intelligence to automate decisions, uncover hidden insights, and build smarter products at scale. From predictive analytics and computer vision to LLM-powered chatbots and custom model training, we bring AI from concept into production.',
    icon: '🤖',
    color: 'from-[#7C3AED] to-[#0EA5E9]',
    description:
      'We develop custom AI and machine learning solutions that transform raw data into measurable competitive advantage. Our data scientists and ML engineers build, train, evaluate, and deploy models that solve real business problems — from intelligent recommendation engines to automated quality inspection systems.',
    process: [
      { step: 1, title: 'Problem Framing', desc: 'Define the business problem and evaluate AI applicability.' },
      { step: 2, title: 'Data Strategy', desc: 'Data collection, cleaning, labeling, and pipeline design.' },
      { step: 3, title: 'Model Development', desc: 'Train, evaluate, and iterate on ML/AI models.' },
      { step: 4, title: 'Integration', desc: 'Embed models into your application via REST APIs or SDKs.' },
      { step: 5, title: 'Deployment', desc: 'Production deployment with monitoring, versioning, and retraining pipelines.' },
      { step: 6, title: 'Monitoring & Retraining', desc: 'Track model performance and retrain on new data over time.' },
    ],
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI', 'LangChain', 'Hugging Face', 'FastAPI', 'MLflow', 'AWS SageMaker'],
    deliverables: [
      'Trained, evaluated & versioned ML model',
      'REST API endpoint for model inference',
      'Data training pipeline & annotated notebooks',
      'Model performance metrics dashboard',
      'Automated retraining schedule & triggers',
      'Model documentation & model cards',
    ],
    idealFor: [
      { title: 'Data-Rich Businesses', desc: 'Have large datasets and need AI to extract patterns, insights, and drive automated decisions.' },
      { title: 'Product Companies', desc: 'Want intelligent features — recommendations, predictions, or NLP — embedded in their product.' },
      { title: 'Operations Teams', desc: 'Seeking to automate quality inspection, document processing, or anomaly detection workflows.' },
    ],
    highlights: [
      { icon: 'Brain', label: 'Custom Model Training', desc: 'We train models on your data — not one-size-fits-all solutions that ignore your domain.' },
      { icon: 'Zap', label: 'Production-Ready APIs', desc: 'Models deployed as scalable, versioned REST APIs with performance monitoring built in.' },
      { icon: 'Database', label: 'Data Pipeline Included', desc: 'From raw data ingestion and labeling to feature engineering, validation, and storage.' },
      { icon: 'TrendingUp', label: 'Continuous Improvement', desc: 'Automated retraining pipelines keep your models accurate as new data flows in.' },
    ],
    faqs: [
      { q: 'Do we need a large dataset?', a: 'Not always. We leverage pre-trained models, transfer learning, and data augmentation to work effectively with limited data.' },
      { q: 'Can you build a chatbot trained on our data?', a: 'Yes. We build RAG-based chatbots and fine-tuned LLM applications powered by your own knowledge base.' },
    ],
  },
  {
    id: 'business-automation',
    slug: 'business-automation',
    title: 'Business Automation',
    shortDesc: 'Eliminate repetitive manual processes and reclaim thousands of hours every year through intelligent, reliable workflow automation. We design and build custom automation pipelines — from RPA and API integrations to AI-driven decision workflows — so your team focuses on high-value work.',
    icon: '⚡',
    color: 'from-[#4361EE] to-[#560BAD]',
    description:
      'We analyze your business workflows and identify automation opportunities — then build custom solutions that eliminate bottlenecks, reduce errors, and accelerate throughput. From document processing and report generation to multi-step approval workflows, we automate it all without disrupting existing operations.',
    process: [
      { step: 1, title: 'Process Mapping', desc: 'Document and analyze all manual workflows and bottlenecks.' },
      { step: 2, title: 'Automation Design', desc: 'Design the automation architecture — RPA, APIs, or custom tools.' },
      { step: 3, title: 'Development', desc: 'Build and test automation scripts, bots, and workflow engines.' },
      { step: 4, title: 'Integration', desc: 'Connect to your existing software stack and data sources.' },
      { step: 5, title: 'Testing & Rollout', desc: 'UAT, parallel testing, and phased production rollout.' },
      { step: 6, title: 'Monitoring', desc: 'Logs, alerts, and dashboards to ensure automation reliability.' },
    ],
    technologies: ['n8n', 'Make.com', 'Zapier', 'Python', 'Node.js', 'Power Automate', 'Selenium', 'Apache Airflow', 'REST APIs', 'PostgreSQL'],
    deliverables: [
      'Fully built automation workflows & scripts',
      'API integration connectors',
      'Error logging, retry logic & failure alerts',
      'Operations monitoring dashboard',
      'Detailed process documentation',
      'Handover training session for your team',
    ],
    idealFor: [
      { title: 'Operations-Heavy Teams', desc: 'Staff spending hours daily on repetitive data entry, status updates, or approval routing tasks.' },
      { title: 'Finance & HR Departments', desc: 'Automating payroll runs, invoicing, employee onboarding, and compliance reporting cycles.' },
      { title: 'Scaling Businesses', desc: 'Growing throughput and output volume without proportionally increasing headcount or overhead.' },
    ],
    highlights: [
      { icon: 'Zap', label: 'End-to-End Automation', desc: 'From trigger to final output — zero manual steps required once automation is deployed.' },
      { icon: 'PieChart', label: 'ROI Focused', desc: 'We quantify time saved and cost reduction before and after each automation is built.' },
      { icon: 'GitMerge', label: 'Non-Invasive Integration', desc: 'Hooks into your existing software stack via APIs — no system overhauls or migrations needed.' },
      { icon: 'Bell', label: 'Smart Alerting', desc: 'Instant notifications when an automation fails or needs a human decision to continue.' },
    ],
    faqs: [
      { q: 'Which processes are best for automation?', a: 'Repetitive, rule-based, high-volume tasks with clear inputs and outputs are ideal automation candidates.' },
      { q: 'Will automation break my existing systems?', a: 'No. We design automation non-invasively, integrating at the API level without modifying core systems.' },
    ],
  },
  {
    id: 'deployment-hosting-services',
    slug: 'deployment-hosting-services',
    title: 'Deployment & Hosting',
    shortDesc: 'Take your application from code to production with a reliable, secure, and auto-scaling infrastructure setup built for real-world traffic. We configure CI/CD pipelines, cloud environments, container orchestration, and continuous monitoring so your systems stay fast, available, and automatically updated.',
    icon: '🚀',
    color: 'from-[#560BAD] to-[#0EA5E9]',
    description:
      'We handle the full deployment lifecycle — from environment provisioning and containerization to CI/CD automation and production hardening. Whether you are deploying a simple web app or a distributed microservices architecture, we ensure zero-downtime releases, auto-scaling, and comprehensive observability.',
    process: [
      { step: 1, title: 'Infrastructure Audit', desc: 'Assess your current setup and define deployment targets.' },
      { step: 2, title: 'Environment Setup', desc: 'Configure cloud environments: dev, staging, and production.' },
      { step: 3, title: 'Containerization', desc: 'Dockerize your application for portability and consistency.' },
      { step: 4, title: 'CI/CD Pipeline', desc: 'Automated build, test, and deploy pipelines with rollback support.' },
      { step: 5, title: 'Security Hardening', desc: 'SSL, secrets management, firewall rules, and IAM policies.' },
      { step: 6, title: 'Monitoring & Alerts', desc: 'Uptime monitoring, log aggregation, and incident alerting.' },
    ],
    technologies: ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Vercel', 'GitHub Actions', 'Terraform', 'Nginx', 'Cloudflare', 'Datadog'],
    deliverables: [
      'Cloud environment setup (dev / staging / prod)',
      'Fully containerized application (Docker)',
      'Automated CI/CD pipeline with rollback support',
      'SSL, domain, and DNS configuration',
      'Monitoring, logging & uptime alert dashboards',
      'Runbook and infrastructure handover documentation',
    ],
    idealFor: [
      { title: 'Development Teams', desc: 'Built the app but need expert help getting it to production reliably, securely, and repeatably.' },
      { title: 'Scale-Up Companies', desc: 'Outgrowing shared hosting and needing auto-scaling cloud infrastructure for real-world traffic.' },
      { title: 'DevOps-Less Teams', desc: 'No in-house DevOps expertise and needing a full pipeline built and handed over with training.' },
    ],
    highlights: [
      { icon: 'Rocket', label: 'Zero-Downtime Deploys', desc: 'Blue-green and rolling deployments ensure your users never experience downtime during releases.' },
      { icon: 'ShieldCheck', label: 'Security Hardened', desc: 'IAM policies, secrets management, firewall rules, and SSL configured from day one.' },
      { icon: 'Gauge', label: 'Auto-Scaling', desc: 'Scale up instantly on traffic spikes and back down automatically — pay for only what you use.' },
      { icon: 'Activity', label: 'Full Observability', desc: 'Logs, metrics, distributed traces, and uptime alerts wired across every layer of your stack.' },
    ],
    faqs: [
      { q: 'Which cloud provider do you recommend?', a: 'It depends on your needs — we work with AWS, GCP, and Azure, and recommend based on scale, cost, and your existing stack.' },
      { q: 'Can you manage our existing deployment?', a: 'Yes. We offer managed DevOps services including ongoing pipeline management and infrastructure optimization.' },
    ],
  },
  {
    id: 'ui-ux-design',
    slug: 'ui-ux-design',
    title: 'UI/UX Design & Prototyping',
    shortDesc: 'Great software starts with great design — we craft intuitive, visually compelling user experiences grounded in user research and validated through real testing. From wireframes and interactive prototypes to production-ready design systems, every interface we design is built to feel effortless and convert.',
    icon: '🎨',
    color: 'from-[#831DC6] to-[#CFA3EA]',
    description:
      'Our design team blends aesthetics with usability to create digital experiences that users love and businesses rely on. We follow a research-driven process — user interviews, competitive analysis, information architecture, and iterative testing — to ensure every design decision is validated before a line of code is written.',
    process: [
      { step: 1, title: 'Research', desc: 'User research, persona creation, and competitive analysis.' },
      { step: 2, title: 'Information Architecture', desc: 'Sitemap, user flows, and content hierarchy design.' },
      { step: 3, title: 'Wireframing', desc: 'Low and mid-fidelity wireframes for rapid concept validation.' },
      { step: 4, title: 'UI Design', desc: 'High-fidelity mockups with a branded design system.' },
      { step: 5, title: 'Prototyping', desc: 'Interactive Figma prototypes for stakeholder and user testing.' },
      { step: 6, title: 'Handoff', desc: 'Developer-ready assets, annotations, and component specifications.' },
    ],
    technologies: ['Figma', 'Adobe XD', 'Framer', 'Photoshop', 'Illustrator', 'Lottie', 'Zeplin', 'Storybook', 'Tailwind CSS', 'Framer Motion'],
    deliverables: [
      'User research report & personas',
      'Sitemap & user flow diagrams',
      'Low and high-fidelity wireframes',
      'Interactive Figma prototype',
      'Design system & component library',
      'Developer handoff package (specs, assets, annotations)',
    ],
    idealFor: [
      { title: 'Founders & Product Managers', desc: 'Need to validate product concepts and communicate a clear vision to stakeholders before development.' },
      { title: 'Development Teams', desc: 'Code-ready but lack design expertise for a polished, user-tested, and conversion-optimized interface.' },
      { title: 'Established Businesses', desc: 'Existing product suffering from UX friction, poor retention, or brand inconsistency that needs a redesign.' },
    ],
    highlights: [
      { icon: 'Users', label: 'Research-Driven Design', desc: 'Every decision is backed by user interviews, competitive analysis, and iterative usability testing.' },
      { icon: 'Palette', label: 'Full Design System', desc: 'Reusable components, design tokens, and guidelines your dev team can build from and scale forever.' },
      { icon: 'MousePointer', label: 'Interactive Prototypes', desc: 'Fully clickable Figma prototypes for real user testing and polished stakeholder presentations.' },
      { icon: 'Code2', label: 'Dev-Ready Handoff', desc: 'Annotated specs, exported assets, and component docs that eliminate developer guesswork.' },
    ],
    faqs: [
      { q: 'Do you offer design-only engagements?', a: 'Yes. We provide UI/UX design as a standalone service, delivering Figma files, design tokens, and component specs.' },
      { q: 'Will you design for both web and mobile?', a: 'Absolutely. We design responsive web interfaces and native mobile UIs simultaneously within a unified design system.' },
    ],
  },
  {
    id: 'cybersecurity-data-protection',
    slug: 'cybersecurity-data-protection',
    title: 'Cybersecurity & Data Protection',
    shortDesc: 'Protect your systems, data, and users with a proactive, security-first approach embedded into every layer of your application. We conduct security audits, implement authentication and encryption best practices, and guide your team to eliminate vulnerabilities before they become costly threats.',
    icon: '🛡️',
    color: 'from-[#3A0CA3] to-[#4361EE]',
    description:
      'We provide comprehensive cybersecurity services for software applications and IT infrastructure — from threat modeling and penetration testing to secure code review and compliance guidance. Our security engineers work alongside your team to build resilient systems that protect sensitive data and maintain user trust.',
    process: [
      { step: 1, title: 'Threat Modeling', desc: 'Identify attack surfaces, threat vectors, and risk scenarios.' },
      { step: 2, title: 'Security Audit', desc: 'Code review, dependency scanning, and configuration analysis.' },
      { step: 3, title: 'Hardening', desc: 'Apply security fixes, encryption, and access control improvements.' },
      { step: 4, title: 'Penetration Testing', desc: 'Controlled ethical hacking to discover exploitable vulnerabilities.' },
      { step: 5, title: 'Compliance Review', desc: 'Guidance on GDPR, HIPAA, PCI-DSS, and SOC2 requirements.' },
      { step: 6, title: 'Training & Policy', desc: 'Security awareness training and internal policy documentation.' },
    ],
    technologies: ['OWASP', 'JWT', 'OAuth 2.0', 'SSL/TLS', 'AWS Security Hub', 'HashiCorp Vault', 'Snyk', 'CORS', 'CSP', '2FA/MFA'],
    deliverables: [
      'Vulnerability assessment & risk-rated findings report',
      'Threat model document',
      'Security hardening implementation',
      'Penetration test results & reproduction steps',
      'Compliance checklist (GDPR / HIPAA / PCI-DSS)',
      'Security awareness training materials for your team',
    ],
    idealFor: [
      { title: 'SaaS & Web Applications', desc: 'Handling user data, payments, or sensitive business records that must be rigorously protected.' },
      { title: 'Regulated Industries', desc: 'Operating under GDPR, HIPAA, or PCI-DSS compliance requirements needing validation and guidance.' },
      { title: 'Post-Incident Teams', desc: 'Recovering from a breach or failed security audit and needing a rapid, comprehensive overhaul.' },
    ],
    highlights: [
      { icon: 'Shield', label: 'Proactive Security', desc: 'We identify and remediate vulnerabilities before attackers do — not after a costly breach.' },
      { icon: 'FileSearch', label: 'Detailed Reporting', desc: 'Every finding documented with severity rating, reproduction steps, and clear remediation guidance.' },
      { icon: 'Lock', label: 'Compliance Guidance', desc: 'Practical, actionable paths to GDPR, HIPAA, and PCI-DSS compliance — not just theory.' },
      { icon: 'Eye', label: 'Ongoing Monitoring', desc: 'Retainer-based continuous security monitoring and quarterly audit packages are available.' },
    ],
    faqs: [
      { q: 'How do you handle discovered vulnerabilities?', a: 'We provide a detailed report with severity ratings, reproduction steps, and recommended fixes — then assist with full remediation.' },
      { q: 'Do you offer ongoing security monitoring?', a: 'Yes. We offer retainer-based security monitoring, quarterly audits, and dedicated incident response support.' },
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
    category: 'Education',
    industry: 'School Management',
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
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80',
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
    category: 'Inventory',
    industry: 'Retail / Warehouse',
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
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80',
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
    category: 'HR & Payroll',
    industry: 'Human Resources',
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
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&q=80',
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
  {
    id: 6,
    name: 'Andrea Lim',
    role: 'Head of Operations, LimLogistics',
    avatar: '/images/testimonials/andrea.jpg',
    quote: 'Our fleet management chaos is now completely under control thanks to PROGREX. The system they built is intuitive, fast, and handles thousands of transactions daily without a hiccup.',
    rating: 5,
    company: 'LimLogistics',
  },
  {
    id: 7,
    name: 'Carlos Rivera',
    role: 'Founder, RivaTech Startup',
    avatar: '/images/testimonials/carlos.jpg',
    quote: 'As a startup, we needed a partner who could move fast without sacrificing quality. PROGREX exceeded every expectation. We launched our MVP in 6 weeks and it scaled beautifully.',
    rating: 5,
    company: 'RivaTech',
  },
  {
    id: 8,
    name: 'Sophia Park',
    role: 'CTO, NovaPay Fintech',
    avatar: '/images/testimonials/sophia.jpg',
    quote: 'Security and reliability are non-negotiable in fintech. PROGREX built our payment infrastructure with bank-grade standards. Zero downtime in 18 months of live operations.',
    rating: 5,
    company: 'NovaPay',
  },
  {
    id: 9,
    name: 'James Okonkwo',
    role: 'Director of IT, PrimeCorp Group',
    avatar: '/images/testimonials/james.jpg',
    quote: 'We had a legacy system that was costing us more to maintain than rebuild. PROGREX modernized our entire stack in 4 months. The results were immediate — productivity up 60%.',
    rating: 5,
    company: 'PrimeCorp Group',
  },
  {
    id: 10,
    name: 'Rachel Nguyen',
    role: 'E-Commerce Manager, UrbanThread',
    avatar: '/images/testimonials/rachel.jpg',
    quote: 'PROGREX transformed our outdated store into a high-converting platform. Our cart abandonment dropped by 40% and mobile sales tripled within two months of launch.',
    rating: 5,
    company: 'UrbanThread',
  },
]

// ─── TEAM ────────────────────────────────────────────────────────────────────
export const team = [
  {
    id: 1,
    name: 'Jedidia Shekainah Garcia',
    role: 'Founder & CEO',
    bio: 'Co-founded PROGREX in 2025 with a drive to build software that actually works for the people using it. Handles product direction, client relationships, and keeps the team aligned on what matters. Believes good software starts with understanding the problem, not rushing to the code.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 2,
    name: 'Lee Rafael Torres',
    role: 'Co-Founder & CTO',
    bio: 'Co-founded PROGREX and leads all technical decisions — from architecture to deployment. Obsessed with writing clean, maintainable code and building systems that hold up under real-world pressure. The kind of engineer who actually reads the docs.',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 3,
    name: 'TBA',
    role: 'Frontend Developer',
    bio: 'Responsible for turning designs into fast, responsive interfaces that users actually enjoy. Works primarily in React and Next.js with a sharp eye for detail and a low tolerance for layout bugs. Committed to delivering consistent, polished experiences across every screen size.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 4,
    name: 'TBA',
    role: 'Backend Developer',
    bio: 'Builds and maintains the server-side logic, APIs, and databases that keep everything running. Focused on reliability, performance, and making sure the backend never becomes the bottleneck. Handles data architecture with care and a security-first mindset.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 5,
    name: 'TBA',
    role: 'UI/UX Designer',
    bio: 'Designs the user experience from wireframe to final screen, focused on making interfaces that are intuitive right out of the box. Collaborates closely with developers to ensure what gets designed is what actually gets built. Strong believer that great design should be invisible.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 6,
    name: 'TBA',
    role: 'QA & DevOps',
    bio: 'Makes sure what gets shipped actually works — handles testing, CI/CD pipelines, and deployment so the team can move fast without breaking things. The last line of defense before clients see the product. Takes "works on my machine" out of the vocabulary.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 7,
    name: 'TBA',
    role: 'Mobile Developer',
    bio: 'Builds cross-platform mobile apps that feel native on both iOS and Android. Focused on smooth animations, offline-first architecture, and performance that users notice. Delivers apps that actually get good reviews.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
  {
    id: 8,
    name: 'TBA',
    role: 'Project Manager',
    bio: 'Keeps every project on track from kickoff to delivery — managing timelines, client communication, and team coordination without the noise. The person who ensures nothing falls through the cracks and every milestone is hit with purpose.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80',
    linkedin: '#',
    github: '#',
    portfolio: '#',
  },
]

// ─── TECHNOLOGIES ────────────────────────────────────────────────────────────
export const technologies = [
  { name: 'React',        category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Next.js',     category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
  { name: 'TypeScript',  category: 'Language', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'Node.js',     category: 'Backend',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Python',      category: 'Backend',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'PostgreSQL',  category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'MongoDB',     category: 'Database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { name: 'AWS',         category: 'Cloud',    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
  { name: 'Docker',      category: 'DevOps',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Kubernetes',  category: 'DevOps',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
  { name: 'Redis',       category: 'Cache',    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
  { name: 'GraphQL',     category: 'API',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg' },
  { name: 'React Native',category: 'Mobile',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Flutter',     category: 'Mobile',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' },
  { name: 'Tailwind CSS',category: 'Frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Prisma',      category: 'ORM',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg' },
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

// ─── FAQS ─────────────────────────────────────────────────────────────────────
export const faqs = [
  {
    id: 1,
    question: 'How long does it take to build a custom system?',
    answer: 'Timelines depend on the scope and complexity of the project. For smaller tools and web apps, expect 1–2 weeks. Medium-scale platforms typically take 1–3 months, while enterprise-grade systems range from 3–6 months. We provide a detailed project timeline during the discovery phase.',
  },
  {
    id: 2,
    question: 'How much does a project cost?',
    answer: 'Every project is unique. Pricing is based on scope, complexity, and tech requirements. Entry-level projects start around ₱30,000–₱80,000, while mid-to-enterprise solutions range from ₱150,000 upward. We also offer flexible payment arrangements. Reach out for a free estimate.',
  },
  {
    id: 3,
    question: 'What technologies do you use?',
    answer: "We specialize in modern stacks: React, Next.js, Node.js, Python, Laravel, Flutter, and more on the front and back end. For infrastructure, we use AWS, GCP, Docker, and CI/CD pipelines. We select the best fit based on your project's needs — not what's trendy.",
  },
  {
    id: 4,
    question: 'Do you offer support after the project is delivered?',
    answer: 'Yes. All delivered projects include a post-launch support window. We also offer ongoing maintenance retainers for monitoring, bug fixes, updates, and feature additions. Your system will never be left without a lifeline.',
  },
  {
    id: 5,
    question: 'Will I own the source code and intellectual property?',
    answer: 'Absolutely. Upon full payment, all source code, assets, and intellectual property are transferred to you. We also sign NDAs before any project discussion to protect your idea from day one.',
  },
  {
    id: 6,
    question: 'Can I request changes during development?',
    answer: 'Yes. We follow an agile, iterative approach with regular check-ins and demo milestones. Minor revisions are included in scope; significant changes are assessed and agreed upon transparently before implementation — no surprise charges.',
  },
]
