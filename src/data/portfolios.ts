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
