export interface PortfolioSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface Portfolio {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  role: string;
  duration: string;
  projectType: string;
  status: string;
  skills: string[];
  brief: string;
  context: string[];
  problemStatement: string;
  objectives: string[];
  audience: string[];
  constraints: string[];
  process: PortfolioSection[];
  solution: PortfolioSection[];
  outcomes: PortfolioSection[];
  learnings: string[];
  reviewerPrompts: string[];
  metricsNote: string;
}

export const portfolios: Portfolio[] = [
  {
    id: "BR-001",
    title: "E-commerce UX Redesign",
    category: "UX Design",
    subtitle: "Redesigning the shopping journey from discovery to checkout",
    description:
      "A concept case study exploring how product discovery, product information, and checkout can be made clearer and easier to use across desktop and mobile.",
    role: "UX/UI Designer",
    duration: "6 weeks",
    projectType: "Synthetic concept project",
    status: "Awaiting review",
    skills: [
      "User Research",
      "Journey Mapping",
      "Information Architecture",
      "Wireframing",
      "Prototyping",
      "Usability Testing",
      "Responsive Design",
    ],
    brief:
      "Propose an improved shopping experience that helps customers find a relevant product, understand the purchase details, and complete checkout with fewer avoidable obstacles. Explain the reasoning behind design decisions and how the proposed changes should be evaluated.",
    context: [
      "The fictional store offers a broad product catalogue, but the current experience presents dense product pages, inconsistent filter controls, and a checkout flow that makes important information difficult to scan.",
      "The project is scoped as a UX concept rather than a production deployment. No real customer database, analytics account, or live conversion data is provided.",
    ],
    problemStatement:
      "How might we help shoppers confidently find a suitable product and complete a purchase by improving information clarity, navigation, and checkout feedback without hiding important details?",
    objectives: [
      "Make search, filtering, and sorting easier to understand.",
      "Present price, delivery information, product variants, and return policy before purchase confirmation.",
      "Reduce unnecessary friction in the checkout flow while preserving user control.",
      "Ensure key flows remain understandable on narrow mobile screens and with common accessibility needs.",
    ],
    audience: [
      "Primary: shoppers who know the type of product they want but need help comparing options.",
      "Secondary: shoppers browsing casually who rely on clear categories, product imagery, and useful filters.",
      "Accessibility considerations: users navigating by keyboard, using screen magnification, or needing clear labels and error messages.",
    ],
    constraints: [
      "The concept must work for mobile and desktop layouts.",
      "The checkout must show the complete cost before final confirmation.",
      "The proposal should reuse familiar commerce patterns rather than introduce a novel interaction model without evidence.",
      "Because this is a synthetic brief, assumptions must be labelled and performance improvements must not be presented as measured facts.",
    ],
    process: [
      {
        heading: "1. Discovery and heuristic review",
        paragraphs: [
          "Start by mapping the journey: landing or search, results, product details, cart, delivery and payment, then confirmation. Review each step for clarity, consistency, visibility of system status, error prevention, and unnecessary memory load.",
          "Record each issue with the affected screen, the user impact, a severity estimate, and a proposed way to validate it. Treat the findings as design hypotheses until tested with representative users.",
        ],
        bullets: [
          "Audit search results, filter controls, product information hierarchy, cart editing, and checkout feedback.",
          "Separate observed interface issues from assumptions about why users may struggle.",
        ],
      },
      {
        heading: "2. Journey mapping and prioritisation",
        paragraphs: [
          "Create a journey map around the shopper's goal, questions, actions, and uncertainty at each stage. Prioritise problems that block task completion or undermine trust over cosmetic inconsistencies.",
        ],
        bullets: [
          "High priority: unclear total cost, confusing product variants, and ambiguous validation errors.",
          "Medium priority: inconsistent filter labels and low-salience delivery or return information.",
          "Lower priority: visual refinements that do not materially affect comprehension or task completion.",
        ],
      },
      {
        heading: "3. Structure and prototyping",
        paragraphs: [
          "Draft low-fidelity wireframes before visual styling. Keep product comparison information predictable and make the primary next action visually distinct without hiding secondary actions such as editing a cart.",
          "Build a clickable prototype for search-to-product and cart-to-order flows. Include empty results, unavailable variants, invalid form entries, and recovery from an interrupted step.",
        ],
      },
      {
        heading: "4. Usability evaluation plan",
        paragraphs: [
          "Ask participants representative of the intended audience to complete realistic tasks without coaching. Observe completion, hesitation, errors, and whether participants can explain the order total and delivery terms.",
          "Compare the baseline and proposed flow only if both are tested under comparable conditions. Report participant count, task wording, success definition, and limitations alongside any measurements.",
        ],
        bullets: [
          "Task completion rate and time on task.",
          "Checkout errors, backtracking, and requests for assistance.",
          "Post-task confidence and clarity of price, delivery, and returns.",
        ],
      },
    ],
    solution: [
      {
        heading: "Product discovery",
        paragraphs: [
          "Use consistent filter names, visible selected-filter chips, clear sorting labels, and a useful empty state with a way to remove or broaden filters. Preserve the user's selections when they return from a product detail page.",
        ],
      },
      {
        heading: "Product detail",
        paragraphs: [
          "Prioritise product name, price, key attributes, variant selection, availability, delivery estimate, and return policy. Place supporting details in a clear hierarchy and ensure changing a variant updates its availability and price where applicable.",
        ],
      },
      {
        heading: "Checkout and system feedback",
        paragraphs: [
          "Group related fields, show progress across checkout steps, allow users to review and edit their order, and display the full cost before final confirmation. Use field-level error messages that explain how to recover, and preserve valid input after an error.",
        ],
      },
      {
        heading: "Responsive and inclusive behaviour",
        paragraphs: [
          "Keep primary actions reachable on mobile, avoid relying on colour alone to communicate status, use clear form labels and focus indicators, and ensure keyboard users can move through the same core tasks.",
        ],
      },
    ],
    outcomes: [
      {
        heading: "Expected deliverables",
        bullets: [
          "Current-state journey map and prioritised heuristic findings.",
          "Low-fidelity wireframes and a clickable prototype for discovery and checkout.",
          "A usability test script, task success definitions, and a results template.",
          "A prioritised iteration backlog with rationale and validation criteria.",
        ],
      },
      {
        heading: "How success should be measured",
        paragraphs: [
          "Measure task completion, checkout duration, validation errors, backtracking, and user-reported confidence. A conversion-rate claim would require production analytics and a suitably designed experiment; this concept project has no such evidence.",
        ],
      },
    ],
    learnings: [
      "A shorter flow is not automatically better if it hides delivery, fees, or recovery options.",
      "Design rationale is stronger when each change maps to a user problem and a validation method.",
      "Usability testing should include edge cases, not only the ideal path.",
    ],
    reviewerPrompts: [
      "Are the prioritised problems supported by evidence, and are assumptions clearly labelled?",
      "Does the checkout solution balance efficiency with transparency and user control?",
      "Are error states, edge cases, and responsive behaviour considered?",
    ],
    metricsNote:
      "Synthetic case study. No real user research or production analytics are supplied. Treat proposed metrics as an evaluation plan, not as achieved results.",
  },
  {
    id: "BR-002",
    title: "Sustainable Packaging Concept",
    category: "Product Design",
    subtitle: "Balancing packaging usability, protection, cost, and material impact",
    description:
      "A concept product-design project exploring packaging alternatives for a fictional consumer product, from requirements and material comparison to a prototype evaluation plan.",
    role: "Product Designer",
    duration: "4 weeks",
    projectType: "Synthetic concept project",
    status: "Awaiting review",
    skills: [
      "Design Research",
      "Product Thinking",
      "Material Exploration",
      "Structural Design",
      "Prototyping",
      "Lifecycle Thinking",
      "Visual Communication",
    ],
    brief:
      "Develop a packaging concept that reduces unnecessary material while protecting the product, remaining practical to manufacture and ship, and helping customers understand how to dispose of or reuse each component.",
    context: [
      "The fictional brand wants to review its packaging because the current concept uses multiple components and does not clearly explain how they should be separated after use.",
      "The project does not include supplier quotations, laboratory testing, or a formal life-cycle assessment. Material and environmental claims therefore need validation before implementation.",
    ],
    problemStatement:
      "How might packaging use fewer or easier-to-separate materials while maintaining product protection, acceptable cost, practical assembly, and a clear customer experience?",
    objectives: [
      "Map packaging components and identify opportunities to remove unnecessary parts.",
      "Compare candidate materials against protection, recyclability, availability, cost, and assembly requirements.",
      "Create a structural concept that can be prototyped and evaluated.",
      "Communicate disposal or separation guidance in a clear, non-misleading way.",
    ],
    audience: [
      "Customers opening the package at home who need a straightforward, safe unboxing experience.",
      "Packing and fulfilment staff who need a repeatable, efficient assembly process.",
      "Manufacturing and logistics stakeholders responsible for material sourcing, cost, and damage prevention.",
    ],
    constraints: [
      "The package must protect the product during handling and transport.",
      "The structure should be practical to assemble at scale and compatible with reasonable shipping dimensions.",
      "Claims about recyclability depend on local collection systems and material composition.",
      "Cost, durability, and environmental impact must be compared transparently rather than assuming one material is always superior.",
    ],
    process: [
      {
        heading: "1. Requirements and lifecycle mapping",
        paragraphs: [
          "List the package's functions: containment, protection, information, opening, transport, and end-of-life handling. Map components and identify where mixed materials, coatings, inserts, or excess volume may complicate separation or increase waste.",
        ],
        bullets: [
          "Define product fragility, shipping conditions, storage needs, and required labels.",
          "Separate design requirements from unverified assumptions about current waste or customer behaviour.",
        ],
      },
      {
        heading: "2. Material and structure exploration",
        paragraphs: [
          "Compare candidate material systems using a decision matrix. Include protection, mass, volume, moisture sensitivity, supplier availability, cost, assembly, and end-of-life pathways. Avoid selecting materials solely because they are marketed as eco-friendly.",
        ],
        bullets: [
          "Explore fibre-based structures and designs that reduce unnecessary inserts.",
          "Consider whether components can be separated without tools or excessive force.",
          "Record trade-offs and evidence gaps for each concept.",
        ],
      },
      {
        heading: "3. Concept development",
        paragraphs: [
          "Create multiple structural sketches and dielines, then choose a concept based on explicit criteria. Build a physical or digital prototype to check fit, opening sequence, closure reliability, and how disposal instructions are presented.",
        ],
      },
      {
        heading: "4. Prototype evaluation plan",
        paragraphs: [
          "Evaluate the prototype through assembly trials, opening tasks, fit checks, and appropriate transport or drop testing. A real product would require test conditions suited to its fragility and shipping route.",
        ],
        bullets: [
          "Record assembly time, packaging mass, material count, and estimated unit cost.",
          "Check for product movement, damage, awkward opening, and confusing disposal guidance.",
          "Compare results against a documented baseline using the same conditions.",
        ],
      },
    ],
    solution: [
      {
        heading: "Simplified component system",
        paragraphs: [
          "The proposed direction prioritises fewer components and clear separation between any materials that cannot be processed together. The final choice should depend on verified local recycling routes and product-protection tests.",
        ],
      },
      {
        heading: "Structural efficiency",
        paragraphs: [
          "Use a considered dieline and product fit to reduce unused volume where feasible. Check that material reduction does not compromise cushioning, closure strength, stacking, or handling.",
        ],
      },
      {
        heading: "Customer instructions",
        paragraphs: [
          "Use concise labels and simple diagrams to show which parts should be separated and how to prepare them for disposal. Avoid universal recycling claims when local infrastructure varies.",
        ],
      },
      {
        heading: "Design decision record",
        paragraphs: [
          "Document the chosen concept, alternatives rejected, reasons for selection, remaining risks, and the tests required before production. This makes the trade-offs reviewable rather than presenting the final form as self-evidently sustainable.",
        ],
      },
    ],
    outcomes: [
      {
        heading: "Expected deliverables",
        bullets: [
          "Packaging requirements and component map.",
          "Material comparison matrix with evidence gaps.",
          "Concept sketches, dieline, and prototype.",
          "Assembly, protection, cost, and disposal-usability evaluation plan.",
        ],
      },
      {
        heading: "How success should be measured",
        paragraphs: [
          "Track packaging mass per unit, material count, unit cost, assembly time, product-damage rate, opening usability, and correct disposal decisions. A claim of lower environmental impact requires suitable lifecycle evidence and cannot be established by material weight alone.",
        ],
      },
    ],
    learnings: [
      "Material choice is a system decision involving local infrastructure, transport, protection, and manufacturing.",
      "Reducing material can create new risks if it increases product damage or makes the package harder to use.",
      "A clear decision record makes trade-offs and unresolved questions visible to reviewers.",
    ],
    reviewerPrompts: [
      "Are the requirements and trade-offs explicit and realistic?",
      "Does the material recommendation have evidence beyond marketing claims?",
      "Is the prototype evaluation plan adequate to validate protection and usability?",
    ],
    metricsNote:
      "Synthetic case study. No supplier quotes, transport tests, lifecycle assessment, or measured environmental outcomes are provided.",
  },
  {
    id: "BR-003",
    title: "Accessibility Audit",
    category: "UX Research",
    subtitle: "Finding and prioritising barriers in a fictional service website",
    description:
      "A structured accessibility-audit concept that records reproducible findings, maps them to relevant accessibility criteria, and turns them into a prioritised remediation plan.",
    role: "UX Researcher",
    duration: "3 weeks",
    projectType: "Synthetic audit scenario",
    status: "In review",
    skills: [
      "Accessibility",
      "WCAG",
      "Keyboard Testing",
      "Contrast Analysis",
      "Assistive Technology",
      "Issue Prioritisation",
      "Technical Reporting",
    ],
    brief:
      "Audit key flows in a fictional service website, document accessibility barriers with clear evidence, prioritise issues by user impact, and provide practical recommendations that can be retested after remediation.",
    context: [
      "The fictional service website supports common tasks such as navigation, searching, signing in, and submitting a form, but has not been comprehensively evaluated for accessibility.",
      "The scenario is a sample audit plan, not a claim that a real website has been tested. Findings must be tied to reproducible evidence before being reported as confirmed defects.",
    ],
    problemStatement:
      "How can the team identify the most consequential accessibility barriers in core user journeys and provide developers with actionable, testable remediation guidance?",
    objectives: [
      "Define the scope and accessibility criteria before testing.",
      "Evaluate keyboard access, focus visibility, semantic structure, labels, error handling, and colour contrast.",
      "Record reproducible steps, expected behaviour, actual behaviour, and user impact for each confirmed finding.",
      "Prioritise remediation and define retesting criteria.",
    ],
    audience: [
      "People who navigate with a keyboard or alternative input device.",
      "People who use screen readers, magnification, or other assistive technologies.",
      "Designers, developers, and product owners who need clear and actionable defect reports.",
    ],
    constraints: [
      "The audit scope and WCAG version/conformance level must be stated.",
      "Automated checks can find some issues but cannot establish full accessibility conformance on their own.",
      "Manual keyboard and assistive-technology testing should be included where relevant.",
      "Severity should reflect user impact and task criticality, not just visual prominence or implementation effort.",
    ],
    process: [
      {
        heading: "1. Scope and criteria",
        paragraphs: [
          "Select representative pages and tasks, such as navigating to a service, entering information, correcting validation errors, and confirming submission. State the WCAG version and conformance level used as the reference.",
        ],
        bullets: [
          "Define browsers, devices, input methods, and assistive technologies in scope.",
          "Record exclusions and limitations so the report does not imply a complete audit of untested areas.",
        ],
      },
      {
        heading: "2. Automated and manual checks",
        paragraphs: [
          "Use automated checks as a starting point, then manually inspect interaction and content. Review keyboard order, visible focus, accessible names, form labels, error announcements, heading structure, text alternatives, and colour contrast.",
          "Check actual user flows. A page may pass automated checks and still contain barriers involving logic, instructions, focus management, or dynamic updates.",
        ],
      },
      {
        heading: "3. Evidence and severity",
        paragraphs: [
          "Each issue should include an identifier, affected page or component, reproduction steps, expected result, actual result, relevant criterion, impact, and a concrete recommendation. Include a screenshot or recording when appropriate, while avoiding personal or sensitive data.",
        ],
        bullets: [
          "Critical/high: blocks or severely disrupts a core task for affected users.",
          "Medium: causes substantial difficulty but has a viable workaround.",
          "Low: creates friction or inconsistency with limited task impact.",
          "Severity definitions should be adapted to the product and explained in the report.",
        ],
      },
      {
        heading: "4. Remediation and retesting",
        paragraphs: [
          "Turn findings into developer-ready tasks with acceptance criteria. After fixes, repeat the same steps and record pass, fail, or not retested. Keep unresolved issues visible instead of reporting remediation as complete prematurely.",
        ],
      },
    ],
    solution: [
      {
        heading: "Reproducible issue reports",
        paragraphs: [
          "Use a consistent template: issue ID, location, affected users, reproduction steps, expected and actual behaviour, evidence, applicable criterion, severity, recommendation, and retest status.",
        ],
      },
      {
        heading: "Keyboard and focus",
        paragraphs: [
          "Verify that interactive elements are reachable and operable, focus order is meaningful, focus is visible, and users are not trapped. For dialogs and dynamic content, check focus movement and return behaviour.",
        ],
      },
      {
        heading: "Forms and feedback",
        paragraphs: [
          "Check that each field has an accessible label, instructions are associated with the correct control, errors are described in text, and users can identify and correct invalid input without losing valid information.",
        ],
      },
      {
        heading: "Contrast and semantics",
        paragraphs: [
          "Measure text and relevant interface contrast against the applicable thresholds. Inspect semantic headings, landmarks, accessible names, and meaningful text alternatives. Record exceptions and context instead of relying on visual judgement alone.",
        ],
      },
    ],
    outcomes: [
      {
        heading: "Expected deliverables",
        bullets: [
          "Audit scope and methodology.",
          "Prioritised accessibility issue register with reproducible evidence.",
          "Developer-ready remediation recommendations and acceptance criteria.",
          "Retest checklist and a summary of remaining risks.",
        ],
      },
      {
        heading: "How success should be measured",
        paragraphs: [
          "Track confirmed findings by severity, remediation completion, retest pass rate, and whether core tasks can be completed with supported input methods. Do not claim full WCAG conformance from an automated scan or a limited sample of pages.",
        ],
      },
    ],
    learnings: [
      "Accessibility is a property of complete user journeys, not just isolated visual components.",
      "Findings become more useful when another person can reproduce them and verify the fix.",
      "A transparent scope and limitations statement is essential to credible audit reporting.",
    ],
    reviewerPrompts: [
      "Are the findings reproducible and connected to the stated accessibility criteria?",
      "Does prioritisation reflect the impact on real tasks and affected users?",
      "Are the recommendations actionable, and is there a clear retesting process?",
    ],
    metricsNote:
      "Synthetic audit scenario. No real website has been audited for this sample, so no defect counts or conformance claims are asserted.",
  },
  {
    "id": "BR-004",
    "title": "Personal Finance Dashboard",
    "category": "Product Design",
    "subtitle": "Making everyday financial decisions easier to understand",
    "description": "A concept for a personal finance dashboard that helps users understand spending patterns, manage budgets, and plan upcoming expenses.",
    "role": "Product Designer",
    "duration": "6 weeks",
    "projectType": "Independent concept",
    "status": "Prototype",
    "skills": [
      "User Research",
      "Information Architecture",
      "Dashboard Design",
      "Data Visualization",
      "Prototyping"
    ],
    "brief": "Design a personal finance experience that turns complex transaction data into clear, actionable insights without overwhelming users.",
    "context": [
      "Users may have transactions spread across multiple accounts and payment methods.",
      "Traditional transaction lists provide detail but can make spending patterns difficult to recognize.",
      "This concept explores how a dashboard could support quick reviews and more deliberate financial planning."
    ],
    "problemStatement": "How might we help users understand where their money goes and make informed budgeting decisions with less effort?",
    "objectives": [
      "Make monthly spending patterns easier to understand.",
      "Help users compare actual spending against budget targets.",
      "Highlight upcoming bills and recurring expenses.",
      "Present financial information in a clear and accessible way."
    ],
    "audience": [
      "Students managing monthly allowances",
      "Early-career professionals tracking expenses",
      "People who want a simple overview of their finances"
    ],
    "constraints": [
      "The concept uses synthetic financial data.",
      "No real banking integration is implemented.",
      "The design should avoid implying that forecasts are guaranteed."
    ],
    "process": [
      {
        "heading": "Discover user needs",
        "paragraphs": [
          "The concept begins by identifying common budgeting tasks, including reviewing expenses, checking category totals, and anticipating upcoming bills."
        ],
        "bullets": [
          "Map the key questions users ask when reviewing finances.",
          "Separate essential information from secondary details.",
          "Identify potentially confusing financial terminology."
        ]
      },
      {
        "heading": "Structure the dashboard",
        "paragraphs": [
          "Organize the experience around a monthly overview, spending categories, budget progress, and upcoming transactions."
        ],
        "bullets": [
          "Prioritize the current balance and monthly spending summary.",
          "Use consistent date ranges across dashboard sections.",
          "Provide access to transaction-level details."
        ]
      },
      {
        "heading": "Prototype and evaluate",
        "paragraphs": [
          "Create a clickable prototype for reviewing a month, inspecting a category, and identifying an upcoming payment."
        ],
        "bullets": [
          "Check whether the information hierarchy supports common tasks.",
          "Review chart labels and empty states.",
          "Define usability tasks for a future evaluation."
        ]
      }
    ],
    "solution": [
      {
        "heading": "Monthly overview",
        "paragraphs": [
          "A summary area presents income, expenses, and remaining budget for the selected period."
        ],
        "bullets": [
          "Clear date-range selection",
          "Consistent number formatting",
          "Visible distinction between actual and planned amounts"
        ]
      },
      {
        "heading": "Spending insights",
        "paragraphs": [
          "Category summaries help users inspect spending patterns while retaining access to the underlying transactions."
        ],
        "bullets": [
          "Category-level comparisons",
          "Budget progress indicators",
          "Explanatory labels alongside visualizations"
        ]
      },
      {
        "heading": "Upcoming payments",
        "paragraphs": [
          "A dedicated section groups recurring bills and expected payments to support short-term planning."
        ]
      }
    ],
    "outcomes": [
      {
        "heading": "Prototype deliverables",
        "paragraphs": [
          "The concept defines a dashboard structure, core interaction flows, and a set of screens for review."
        ],
        "bullets": [
          "Monthly summary screen",
          "Category spending view",
          "Upcoming payment list"
        ]
      },
      {
        "heading": "Evaluation plan",
        "paragraphs": [
          "A future usability study could assess whether participants can identify their largest spending category and locate upcoming payments."
        ]
      }
    ],
    "learnings": [
      "Financial dashboards need a clear distinction between balances, spending, and budget targets.",
      "Charts should support a task rather than exist only for decoration.",
      "Forecasts and estimates should communicate uncertainty.",
      "Testing with representative tasks would help validate the information hierarchy."
    ],
    "reviewerPrompts": [
      "Does the dashboard prioritize the most important financial questions?",
      "Are actual amounts and budget targets easy to distinguish?",
      "Does the design explain its charts clearly?",
      "What privacy or trust concerns should be addressed before implementation?"
    ],
    "metricsNote": "This is a synthetic concept. No user research results, financial integrations, or usability metrics have been collected."
  },
  {
    "id": "BR-005",
    "title": "Campus Event Discovery",
    "category": "UX Design",
    "subtitle": "Helping students find events that fit their interests and schedules",
    "description": "A mobile-first event discovery concept that brings campus activities, workshops, and student club events into one searchable experience.",
    "role": "UX/UI Designer",
    "duration": "4 weeks",
    "projectType": "Concept redesign",
    "status": "Prototype",
    "skills": [
      "User Journey Mapping",
      "Mobile UX",
      "Search and Filtering",
      "Interaction Design",
      "Usability Testing Planning"
    ],
    "brief": "Explore a unified way for students to discover relevant campus events and understand the details before deciding to attend.",
    "context": [
      "Campus event announcements may appear across social media, posters, group chats, and club pages.",
      "Students may miss relevant activities because event information is fragmented.",
      "The concept focuses on discovery and event information rather than implementing a complete ticketing system."
    ],
    "problemStatement": "How might students discover suitable campus events without searching across multiple disconnected channels?",
    "objectives": [
      "Provide a central event discovery experience.",
      "Make date, location, eligibility, and registration details easy to find.",
      "Support browsing by interests and availability.",
      "Reduce uncertainty before event registration."
    ],
    "audience": [
      "University students",
      "Student clubs and event organizers",
      "New students exploring campus communities"
    ],
    "constraints": [
      "Event listings are sample content.",
      "Live event synchronization is outside the prototype scope.",
      "Registration availability must be clearly represented."
    ],
    "process": [
      {
        "heading": "Map the discovery journey",
        "paragraphs": [
          "Outline how a student moves from hearing about an event to comparing options and deciding whether to attend."
        ],
        "bullets": [
          "Identify common event discovery channels.",
          "List the details needed before making a decision.",
          "Highlight possible drop-off points."
        ]
      },
      {
        "heading": "Design browsing and filtering",
        "paragraphs": [
          "Create a mobile-first listing with category filters, date controls, and concise event cards."
        ],
        "bullets": [
          "Use consistent event card layouts.",
          "Make active filters visible.",
          "Provide useful empty states when no events match."
        ]
      },
      {
        "heading": "Prototype event details",
        "paragraphs": [
          "Build an interaction flow from the event listing to a detail page containing the essential information and registration action."
        ]
      }
    ],
    "solution": [
      {
        "heading": "Personalized discovery",
        "paragraphs": [
          "Students can browse event categories such as workshops, volunteering, networking, and student life."
        ],
        "bullets": [
          "Search by keyword",
          "Filter by date and category",
          "Clear event status labels"
        ]
      },
      {
        "heading": "Event detail page",
        "paragraphs": [
          "A structured detail page presents the schedule, venue, organizer, eligibility, and registration requirements."
        ]
      },
      {
        "heading": "Save for later",
        "paragraphs": [
          "A proposed saved-events feature allows students to collect interesting events before making a decision. Persistence would require implementation beyond the visual prototype."
        ]
      }
    ],
    "outcomes": [
      {
        "heading": "Prototype deliverables",
        "paragraphs": [
          "The concept includes an event feed, filter states, event details, and a proposed saved-events interaction."
        ]
      },
      {
        "heading": "Validation opportunities",
        "paragraphs": [
          "Future testing could examine whether students can find an event matching a given date, interest, and location."
        ]
      }
    ],
    "learnings": [
      "Event discovery depends on both relevance and trustworthy event details.",
      "Filters should remain understandable on smaller screens.",
      "Unavailable or full events need clear status labels.",
      "Organizer workflows should be considered before building a production service."
    ],
    "reviewerPrompts": [
      "Can users understand the event card at a glance?",
      "Are search and filtering easy to discover?",
      "Does the detail page answer practical attendance questions?",
      "How could event information freshness be maintained?"
    ],
    "metricsNote": "This is a synthetic UX concept. No live event data or measured usability results are available."
  },
  {
    "id": "BR-006",
    "title": "Healthcare Appointment Booking",
    "category": "Service Design",
    "subtitle": "Reducing uncertainty in the appointment scheduling journey",
    "description": "A service design concept for finding a suitable appointment, understanding preparation requirements, and reviewing booking details.",
    "role": "Product Designer",
    "duration": "5 weeks",
    "projectType": "Service design concept",
    "status": "Prototype",
    "skills": [
      "Service Blueprinting",
      "Journey Mapping",
      "Form Design",
      "Accessibility",
      "Content Design"
    ],
    "brief": "Design a clearer appointment booking journey that helps people understand available options and what they need to do before visiting a clinic.",
    "context": [
      "Appointment booking can involve several steps, including selecting a service, choosing a time, and providing contact details.",
      "Unclear instructions may cause users to abandon a booking or arrive without required information.",
      "This concept is a general scheduling prototype and does not provide medical advice."
    ],
    "problemStatement": "How might an appointment booking flow make scheduling requirements and next steps easier to understand?",
    "objectives": [
      "Break booking into clear and manageable steps.",
      "Show appointment details before confirmation.",
      "Explain preparation instructions in plain language.",
      "Support keyboard navigation and accessible form feedback."
    ],
    "audience": [
      "People booking routine appointments",
      "Caregivers arranging appointments for others",
      "Clinic staff responsible for scheduling"
    ],
    "constraints": [
      "No real patient information is used.",
      "The prototype is not connected to clinic calendars.",
      "Appointment availability and preparation instructions are illustrative only."
    ],
    "process": [
      {
        "heading": "Map the service journey",
        "paragraphs": [
          "Identify the steps a person follows from selecting a service to receiving confirmation and preparing for the visit."
        ],
        "bullets": [
          "Document user-facing and staff-facing steps.",
          "Identify moments where instructions may be unclear.",
          "Separate essential fields from optional information."
        ]
      },
      {
        "heading": "Simplify the booking form",
        "paragraphs": [
          "Group related fields into sequential steps and provide clear explanations of required information."
        ],
        "bullets": [
          "Use explicit field labels.",
          "Explain validation errors next to the relevant field.",
          "Preserve entered values when moving between steps."
        ]
      },
      {
        "heading": "Review confirmation and accessibility",
        "paragraphs": [
          "Create a confirmation screen and review it for readable content, keyboard operation, and clear status communication."
        ]
      }
    ],
    "solution": [
      {
        "heading": "Step-by-step booking",
        "paragraphs": [
          "The proposed flow separates service selection, appointment selection, contact details, and final confirmation."
        ]
      },
      {
        "heading": "Booking summary",
        "paragraphs": [
          "Before submission, users can review the selected service, date, time, and contact details."
        ],
        "bullets": [
          "Visible edit actions",
          "Clear confirmation state",
          "Plain-language next steps"
        ]
      },
      {
        "heading": "Accessible form feedback",
        "paragraphs": [
          "The design proposes descriptive error messages, visible focus states, and labels that do not rely on placeholder text alone."
        ]
      }
    ],
    "outcomes": [
      {
        "heading": "Design deliverables",
        "paragraphs": [
          "The concept defines a booking journey, form states, a confirmation view, and an initial service blueprint."
        ]
      },
      {
        "heading": "Future validation",
        "paragraphs": [
          "Testing should verify whether users can complete a sample booking and correctly identify the next steps."
        ]
      }
    ],
    "learnings": [
      "Booking flows should communicate progress and allow users to review important details.",
      "Error messages should explain how to recover rather than only indicate failure.",
      "Accessibility must be considered across every step.",
      "Production healthcare services require strong privacy and security controls."
    ],
    "reviewerPrompts": [
      "Are the booking steps understandable?",
      "Can users review and correct their choices before confirming?",
      "Are validation errors actionable and accessible?",
      "What privacy safeguards would be required for production?"
    ],
    "metricsNote": "This is a synthetic service design concept. It is not connected to a healthcare provider and has no measured clinical or usability outcomes."
  },
  {
    "id": "BR-007",
    "title": "Smart Inventory Management",
    "category": "Dashboard Design",
    "subtitle": "Making stock levels and replenishment decisions more visible",
    "description": "A dashboard concept for small retail teams to inspect stock levels, identify low-inventory items, and review proposed replenishment actions.",
    "role": "Product Designer",
    "duration": "5 weeks",
    "projectType": "Dashboard concept",
    "status": "Prototype",
    "skills": [
      "Dashboard UX",
      "Data Visualization",
      "Workflow Design",
      "Table Design",
      "Prototyping"
    ],
    "brief": "Explore how a small retail team could monitor inventory and prioritize stock-related tasks from a single overview.",
    "context": [
      "Small retail teams may use spreadsheets or separate tools to track inventory.",
      "Important stock issues can be difficult to prioritize when item lists grow.",
      "The concept focuses on operational visibility rather than automatic purchasing."
    ],
    "problemStatement": "How might a retail team quickly identify inventory risks and understand which items need attention first?",
    "objectives": [
      "Highlight items below their configured stock thresholds.",
      "Make item details easy to inspect.",
      "Support sorting and filtering of inventory records.",
      "Communicate the assumptions behind replenishment suggestions."
    ],
    "audience": [
      "Small retail business owners",
      "Inventory coordinators",
      "Store operations staff"
    ],
    "constraints": [
      "Inventory values are fictional.",
      "No point-of-sale or supplier integration exists.",
      "Replenishment suggestions are illustrative and do not trigger orders."
    ],
    "process": [
      {
        "heading": "Identify operational tasks",
        "paragraphs": [
          "Map common inventory tasks, including locating low-stock items, checking quantities, and reviewing replenishment needs."
        ]
      },
      {
        "heading": "Design the inventory table",
        "paragraphs": [
          "Structure item records around product name, SKU, current quantity, threshold, and status."
        ],
        "bullets": [
          "Keep column labels explicit.",
          "Support search and status filtering.",
          "Avoid relying on color alone to communicate stock risk."
        ]
      },
      {
        "heading": "Create risk indicators",
        "paragraphs": [
          "Develop status labels that help users distinguish healthy stock, low stock, and items requiring review."
        ]
      }
    ],
    "solution": [
      {
        "heading": "Inventory overview",
        "paragraphs": [
          "Summary cards provide a high-level view of total tracked items and items that may need attention."
        ]
      },
      {
        "heading": "Searchable item table",
        "paragraphs": [
          "A structured table allows users to find products and inspect quantities without navigating through separate screens."
        ]
      },
      {
        "heading": "Replenishment review",
        "paragraphs": [
          "A proposed replenishment panel explains why an item has been flagged and leaves the final decision to the operator."
        ]
      }
    ],
    "outcomes": [
      {
        "heading": "Prototype deliverables",
        "paragraphs": [
          "The concept includes an inventory overview, searchable table, stock status states, and a replenishment review panel."
        ]
      },
      {
        "heading": "Evaluation plan",
        "paragraphs": [
          "A future test could ask users to locate a low-stock item and explain why it requires attention."
        ]
      }
    ],
    "learnings": [
      "Operational dashboards should prioritize actions, not just aggregate metrics.",
      "Thresholds must be visible and understandable.",
      "Tables need predictable sorting and filtering behavior.",
      "Automation suggestions should preserve human oversight."
    ],
    "reviewerPrompts": [
      "Can users identify urgent inventory issues quickly?",
      "Are stock statuses understandable without color?",
      "Does the table support scanning and comparison?",
      "Are replenishment suggestions sufficiently transparent?"
    ],
    "metricsNote": "This is a synthetic dashboard concept. Stock values are fictional, and no operational performance improvements have been measured."
  },
  {
    "id": "BR-008",
    "title": "Digital Learning Progress Tracker",
    "category": "EdTech UX",
    "subtitle": "Helping learners understand progress and choose their next step",
    "description": "A learning dashboard concept that organizes course progress, upcoming tasks, and reflection prompts into a single learner-focused view.",
    "role": "UX/UI Designer",
    "duration": "4 weeks",
    "projectType": "Learning product concept",
    "status": "Prototype",
    "skills": [
      "Learning Experience Design",
      "Information Architecture",
      "Progress Visualization",
      "Responsive Design",
      "Interaction Design"
    ],
    "brief": "Design a learner dashboard that explains progress clearly and helps learners decide what to focus on next.",
    "context": [
      "Online learning platforms can contain multiple courses, lessons, and assignments.",
      "A completion percentage alone may not explain what a learner has achieved or what remains.",
      "The concept explores progress communication without ranking learners against one another."
    ],
    "problemStatement": "How might learners understand their current progress and identify a useful next learning activity?",
    "objectives": [
      "Make course progress easy to scan.",
      "Surface upcoming tasks and deadlines.",
      "Clarify the next recommended learning activity.",
      "Encourage reflection without using punitive comparisons."
    ],
    "audience": [
      "University students",
      "Independent online learners",
      "People balancing learning with work"
    ],
    "constraints": [
      "Course and learner progress data are fictional.",
      "No learning management system integration is implemented.",
      "Recommendations are illustrative and should be explainable."
    ],
    "process": [
      {
        "heading": "Understand learner needs",
        "paragraphs": [
          "Identify common questions learners have when returning to a course, including what they completed and what to do next."
        ]
      },
      {
        "heading": "Organize learning information",
        "paragraphs": [
          "Group active courses, task deadlines, and recent activity into a consistent hierarchy."
        ],
        "bullets": [
          "Distinguish completed work from upcoming work.",
          "Use consistent progress definitions.",
          "Keep the next action visible."
        ]
      },
      {
        "heading": "Prototype progress interactions",
        "paragraphs": [
          "Create sample course cards and a task list to explore navigation from the overview to an individual course."
        ]
      }
    ],
    "solution": [
      {
        "heading": "Course progress cards",
        "paragraphs": [
          "Each card summarizes course progress and identifies the next incomplete activity."
        ]
      },
      {
        "heading": "Upcoming tasks",
        "paragraphs": [
          "A task list presents deadlines and task status with clear labels."
        ]
      },
      {
        "heading": "Learning reflection",
        "paragraphs": [
          "A proposed reflection prompt lets learners record what they understood and what they want to revisit."
        ]
      }
    ],
    "outcomes": [
      {
        "heading": "Prototype deliverables",
        "paragraphs": [
          "The concept includes a course overview, progress indicators, upcoming tasks, and a reflection interaction."
        ]
      },
      {
        "heading": "Validation plan",
        "paragraphs": [
          "Future usability testing could measure whether learners can find their next task and correctly interpret course progress."
        ]
      }
    ],
    "learnings": [
      "Progress indicators need clear definitions.",
      "A useful next action can be more valuable than a large collection of metrics.",
      "Learner comparisons should be handled carefully to avoid discouraging users.",
      "Recommendations should explain why an activity is suggested."
    ],
    "reviewerPrompts": [
      "Can learners tell what they have completed and what remains?",
      "Is the next action easy to identify?",
      "Are progress indicators meaningful and consistent?",
      "Does the design support different learning schedules?"
    ],
    "metricsNote": "This is a synthetic EdTech concept. No real learner data or measured learning outcomes are available."
  },
  {
    "id": "BR-009",
    "title": "Community Recycling Guide",
    "category": "Civic Tech",
    "subtitle": "Making local recycling guidance easier to understand",
    "description": "A community information concept that helps residents understand how common household materials should be sorted and where to find local recycling guidance.",
    "role": "Product Designer",
    "duration": "3 weeks",
    "projectType": "Civic service concept",
    "status": "Prototype",
    "skills": [
      "Content Design",
      "Information Architecture",
      "Search UX",
      "Inclusive Design",
      "Mobile UX"
    ],
    "brief": "Explore a clear, mobile-friendly way for residents to look up recycling guidance and understand that local rules can vary.",
    "context": [
      "Recycling instructions can differ by municipality and collection provider.",
      "Residents may be unsure how to sort packaging made from mixed materials.",
      "The concept emphasizes clear explanations and directs users to verify local rules."
    ],
    "problemStatement": "How might residents find understandable recycling guidance without confusing general advice with local collection rules?",
    "objectives": [
      "Make common material categories searchable.",
      "Explain sorting instructions in plain language.",
      "Make local-rule limitations visible.",
      "Provide clear links or references to authoritative local guidance when implemented."
    ],
    "audience": [
      "Residents sorting household waste",
      "People new to a neighborhood",
      "Community groups sharing environmental information"
    ],
    "constraints": [
      "No real-time municipal database is connected.",
      "Sample guidance is illustrative and must be verified locally.",
      "The concept should not imply that every location follows identical rules."
    ],
    "process": [
      {
        "heading": "Map common questions",
        "paragraphs": [
          "Identify the material and packaging questions that residents may ask while sorting household waste."
        ]
      },
      {
        "heading": "Structure searchable guidance",
        "paragraphs": [
          "Organize content by material type and provide concise instructions with a visible reminder to check local rules."
        ],
        "bullets": [
          "Use familiar material names.",
          "Explain mixed-material uncertainty.",
          "Keep instructions short and actionable."
        ]
      },
      {
        "heading": "Review accessibility",
        "paragraphs": [
          "Review contrast, readable text, keyboard navigation, and labels that do not rely on color alone."
        ]
      }
    ],
    "solution": [
      {
        "heading": "Material lookup",
        "paragraphs": [
          "A search interface helps users find an item or material category."
        ]
      },
      {
        "heading": "Sorting instructions",
        "paragraphs": [
          "Each result presents a short explanation, practical sorting steps, and a reminder to confirm local collection rules."
        ]
      },
      {
        "heading": "Local guidance entry point",
        "paragraphs": [
          "A proposed location selector would connect users to the relevant municipal guidance once authoritative data sources are integrated."
        ]
      }
    ],
    "outcomes": [
      {
        "heading": "Prototype deliverables",
        "paragraphs": [
          "The concept defines material search, guidance result layouts, and a proposed local guidance selection flow."
        ]
      },
      {
        "heading": "Future evaluation",
        "paragraphs": [
          "Testing could examine whether residents can find guidance for a sample item and understand when they need to verify local rules."
        ]
      }
    ],
    "learnings": [
      "Environmental guidance needs to distinguish general information from local requirements.",
      "Plain language helps reduce ambiguity.",
      "Search results should communicate uncertainty rather than overstate confidence.",
      "Authoritative data sources are essential for a production service."
    ],
    "reviewerPrompts": [
      "Are instructions clear enough to act on?",
      "Does the interface explain local variations?",
      "Can users find the right material category quickly?",
      "How should the service handle conflicting or outdated guidance?"
    ],
    "metricsNote": "This is a synthetic civic technology concept. Recycling instructions are illustrative and should be verified against local authorities before real-world use."
  }
];

export function getPortfolioById(id: string): Portfolio | undefined {
  return portfolios.find((portfolio) => portfolio.id === id);
}

export function toPortfolioSummary(portfolio: Portfolio) {
  return {
    id: portfolio.id,
    title: portfolio.title,
    category: portfolio.category,
    subtitle: portfolio.subtitle,
    description: portfolio.description,
    role: portfolio.role,
    duration: portfolio.duration,
    projectType: portfolio.projectType,
    skills: portfolio.skills,
    status: portfolio.status,
  };
}
