type Locator = {
  path: [string, string, string];
  title: string;
  description: string;
  focus: string;
  action: string;
};

const locators: Record<string, Locator> = {
  "appointment-calendars": { path: ["Calendars", "Calendar Settings", "Create Calendar"], title: "Calendar settings", description: "Choose the calendar type, then set hosts, availability and booking rules.", focus: "Calendar configurations", action: "Create Calendar" },
  "business-profile-branding": { path: ["Settings", "Business Profile", "General Information"], title: "Business Profile", description: "Update the identity, contact details, logo and defaults used across your workspace.", focus: "General Information", action: "Update Information" },
  "contacts-records": { path: ["Contacts", "Smart Lists", "Add Contact"], title: "Contacts", description: "Search the list first, then add a person or open an existing customer record.", focus: "Smart Lists", action: "Add Contact" },
  "dashboard-basics": { path: ["Dashboard", "Quick Filters", "Apply"], title: "Dashboard", description: "Set a date range and use quick filters to focus the performance view.", focus: "Quick Filters", action: "Apply Filters" },
  "email-sending": { path: ["Settings", "Email Services", "Dedicated Domain and IP"], title: "Email Services", description: "Add and verify the sending domain used for trusted customer email.", focus: "Dedicated Domain and IP", action: "Add Domain" },
  "forms-surveys": { path: ["Sites", "Forms", "Add Form"], title: "Forms", description: "Create a form, survey or quiz and configure what happens after submission.", focus: "Forms", action: "Add Form" },
  "getting-started": { path: ["Launchpad", "Setup Checklist", "Start"], title: "Launchpad", description: "Work through the essential account, team, channel and booking setup tasks.", focus: "Setup Checklist", action: "Start Setup" },
  "handling-conversations": { path: ["Conversations", "My Inbox", "Filters"], title: "Conversations", description: "Choose an inbox, filter the queue and open a thread to reply or add context.", focus: "My Inbox", action: "Open Filters" },
  "import-contacts": { path: ["Contacts", "Smart Lists", "Import Contacts"], title: "Contacts", description: "Upload a prepared file, map its columns and test a small import first.", focus: "Smart Lists", action: "Import Contacts" },
  "journey-automations": { path: ["Automation", "Workflows", "Create Workflow"], title: "Workflows", description: "Start with one trigger, then build the journey in small testable groups.", focus: "Workflows", action: "Create Workflow" },
  "knowledge-sources": { path: ["AI Agents", "Knowledge Base", "Add Source"], title: "Knowledge Base", description: "Add approved source material and keep policy, pricing and handoff rules precise.", focus: "Knowledge sources", action: "Add Source" },
  "lead-capture": { path: ["Sites", "Forms", "Edit Form"], title: "Lead capture", description: "Connect the capture point to the correct owner, pipeline and follow-up.", focus: "Forms", action: "Edit Form" },
  "mobile-app": { path: ["Mobile App", "Home", "Conversations"], title: "Mobile workspace", description: "Use the home screen to reach customers, conversations, opportunities and appointments.", focus: "Home", action: "Open Conversations" },
  "notes-tasks": { path: ["Contacts", "Contact Record", "Notes & Tasks"], title: "Contact record", description: "Open the customer first, then add internal context or assign a follow-up task.", focus: "Notes & Tasks", action: "Add Task" },
  "opportunities-pipelines": { path: ["Opportunities", "Pipelines", "Add Opportunity"], title: "Opportunities", description: "Choose the right pipeline and stage before creating or moving a deal card.", focus: "Pipeline board", action: "Add Opportunity" },
  "payments-invoices": { path: ["Payments", "Invoices", "New Invoice"], title: "Invoices", description: "Select the customer, add products and confirm due dates before sending.", focus: "Invoices", action: "New Invoice" },
  "quick-start-checklist": { path: ["Launchpad", "Setup Checklist", "Review Status"], title: "Setup checklist", description: "Review the highest-risk launch items before inviting the team or going live.", focus: "Setup progress", action: "Review Status" },
  "reputation-reviews": { path: ["Reputation", "Review Requests", "Send Request"], title: "Reputation", description: "Choose a recognizable sender and request feedback after a verified milestone.", focus: "Review Requests", action: "Send Request" },
  "social-planner": { path: ["Marketing", "Social Planner", "New Post"], title: "Social Planner", description: "Select connected profiles, prepare the post and confirm the schedule time zone.", focus: "Planner", action: "New Post" },
  "templates-snapshots": { path: ["Sites", "Templates", "Use Template"], title: "Templates", description: "Duplicate a proven asset, then replace every campaign-specific detail.", focus: "Template library", action: "Use Template" },
  "user-access": { path: ["Settings", "My Staff", "Add Employee"], title: "My Staff", description: "Invite each teammate separately and grant only the permissions their role needs.", focus: "Team management", action: "Add Employee" },
  "voice-assistant": { path: ["AI Agents", "Voice AI", "Create Agent"], title: "Voice AI", description: "Create the agent, define its approved tasks and configure human handoff paths.", focus: "Voice agents", action: "Create Agent" },
  "workflow-builder": { path: ["Automation", "Workflows", "Create Workflow"], title: "Workflows", description: "Add a precise trigger, actions, waits and safeguards before publishing.", focus: "Workflows", action: "Create Workflow" },
  "export-data": { path: ["Contacts", "Smart Lists", "Export Contacts"], title: "Contacts", description: "Filter to the minimum required records before creating a protected export.", focus: "Smart Lists", action: "Export Contacts" },
  "your-account-settings": { path: ["Profile Menu", "Account Settings", "My Profile"], title: "Account Settings", description: "Review your personal details, notifications, connections and sign-in security.", focus: "My Profile", action: "Save Changes" },
  "zero-inbox-routine": { path: ["Conversations", "My Inbox", "Unread"], title: "Conversations", description: "Start with unread and unassigned threads, then leave every item with an owner.", focus: "Unread", action: "Open Queue" },
};

function uniqueNavigation(active: string) {
  return [...new Set(["Dashboard", "Contacts", "Conversations", active, "Automation", "Settings"])].slice(0, 6);
}

export function ArticleLocator({ slug }: { slug: string }) {
  const locator = locators[slug];
  if (!locator) return null;
  const navigation = uniqueNavigation(locator.path[0]);

  return (
    <section className="article-locator" id="where">
      <div className="locator-heading">
        <span>Where to find it</span>
        <h2>Follow this path in your workspace</h2>
        <p>{locator.path.join("  →  ")}</p>
      </div>
      <figure className="locator-screenshot">
        <div className="locator-window-bar" aria-hidden="true">
          <span /><span /><span />
          <small>TalkTuit workspace preview</small>
        </div>
        <div className="locator-app" aria-hidden="true">
          <aside className="locator-nav">
            <div className="locator-brand"><i>TT</i><strong>TalkTuit</strong></div>
            <nav>
              {navigation.map((item) => <span className={item === locator.path[0] ? "active" : ""} key={item}><i />{item}{item === locator.path[0] && <b>1</b>}</span>)}
            </nav>
            <small>Support Hub visual guide</small>
          </aside>
          <div className="locator-canvas">
            <div className="locator-crumbs"><span>{locator.path[0]}</span><b>›</b><span>{locator.path[1]}</span></div>
            <div className="locator-toolbar">
              <div><small>{locator.path[1]}</small><strong>{locator.title}</strong></div>
              <span className="locator-cta">{locator.action}<b>2</b></span>
            </div>
            <div className="locator-preview-grid">
              <div className="locator-list-panel">
                <span className="locator-search-line" />
                <div><i /><span><strong>{locator.focus}</strong><small>Open this area to continue</small></span><b>›</b></div>
                <div><i /><span><strong>Workspace defaults</strong><small>Review the current configuration</small></span><b>›</b></div>
                <div><i /><span><strong>Recent activity</strong><small>Confirm the latest change</small></span><b>›</b></div>
              </div>
              <div className="locator-detail-panel">
                <span className="locator-detail-icon">✓</span>
                <small>You’re in the right place</small>
                <strong>{locator.path[2]}</strong>
                <p>{locator.description}</p>
                <span className="locator-action-echo">{locator.action}</span>
              </div>
            </div>
          </div>
        </div>
        <figcaption><strong>Visual guide:</strong> Select <b>1</b> in the left menu, then use <b>2</b> to begin. Labels can vary slightly as your workspace receives updates.</figcaption>
      </figure>
    </section>
  );
}

