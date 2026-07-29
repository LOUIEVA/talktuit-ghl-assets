$ErrorActionPreference = "Stop"

$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$cssSource = Get-Content -LiteralPath (Join-Path $packageRoot "talktuit-ghl.css") -Raw
$jsSource = Get-Content -LiteralPath (Join-Path $packageRoot "talktuit-ghl.js") -Raw

$cssBundle = @"
<!-- Paste this entire file into Agency View > Settings > Company > Whitelabel > Custom CSS. -->
<style id="talktuit-ghl-theme">
$cssSource
</style>
"@

$jsBundle = @"
<!-- Paste this entire file into Agency View > Settings > Company > Whitelabel > Custom JavaScript. -->
<script
  data-user-id="{{user.id}}"
  data-user-role="{{user.role}}"
  data-user-type="{{user.type}}"
>
  window.TalkTuitGHLConfig = {
    theme: "light",
    persistTheme: true,
    showThemeControl: true,
    decorateOpportunityTags: true,
    colorfulSections: true,
    fullWorkspaceTheme: false,
    brandShell: true,
    showLoadConfirmation: true,
    tagAliases: {
      hot: ["hot", "hot lead"],
      urgent: ["urgent", "emergency", "priority"],
      new: ["new", "new lead"],
      won: ["won", "closed won", "booked"],
      "follow-up": ["follow up", "follow-up", "callback", "call back"],
      cold: ["cold", "unqualified", "closed lost"]
    }
  };

$jsSource
</script>
"@

Set-Content -LiteralPath (Join-Path $packageRoot "ghl-custom-css-inline.html") -Value $cssBundle -Encoding utf8
Set-Content -LiteralPath (Join-Path $packageRoot "ghl-custom-javascript-inline.html") -Value $jsBundle -Encoding utf8

$inlinePreview = @"
<!doctype html>
<html lang="en" data-tt-preview-section="contacts">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TalkTuit Inline Installation Test</title>
    <style id="talktuit-ghl-theme">
$cssSource
    </style>
    <style>
      html, body { margin: 0; min-height: 100%; }
      body { display: grid; grid-template-columns: 220px minmax(0, 1fr); }
      .hl_sidebar { background: #172533; min-height: 100vh; padding: 28px 18px; position: relative; }
      .hl_sidebar strong { color: #fff; display: block; font-size: 1.2rem; margin: 0 10px 32px; }
      .hl_navItem { display: block; margin-bottom: 8px; padding: 12px 14px; text-decoration: none; }
      .hl_navItem.active { background: rgba(99, 198, 195, .18); box-shadow: inset 3px 0 0 #63c6c3; }
      .tt-inline-workspace { min-width: 0; }
      .hl_topHeader { align-items: center; background: #e8edf1; display: flex; height: 70px; padding: 0 32px; }
      .tt-section-workspace { min-height: calc(100vh - 70px); padding: 34px; }
      .tt-inline-heading { align-items: center; display: flex; justify-content: space-between; margin-bottom: 24px; }
      .tt-inline-heading h1 { font-size: 2.6rem; margin: 0 0 6px; }
      .tt-inline-heading p { color: #60788a; margin: 0; }
      .tt-inline-heading button { padding: 11px 16px; }
      .tt-inline-grid { align-items: start; display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr) 290px; }
      .tt-contact-table { table-layout: fixed; width: 100%; }
      .tt-contact-table th, .tt-contact-table td { padding: 16px; text-align: left; }
      .tt-contact-name { align-items: center; display: flex; gap: 10px; }
      .tt-contact-avatar { height: 40px; width: 40px; }
      .tt-contact-detail { padding: 22px; }
      .tt-contact-detail button { padding: 10px 14px; }
      @media (max-width: 720px) {
        body { display: block; }
        .hl_sidebar { display: none; }
        .tt-section-workspace { padding: 22px 14px 80px; }
        .tt-inline-grid { grid-template-columns: 1fr; }
        .tt-contact-detail { display: none; }
        .tt-inline-heading { align-items: stretch; flex-direction: column; gap: 18px; }
      }
    </style>
  </head>
  <body class="sidebar-v2-location">
    <aside class="hl_sidebar default-bg-color" id="sidebar-v2">
      <strong>TalkTuit</strong>
      <a class="hl_navItem active" href="#">Contacts</a>
      <a class="hl_navItem" href="#">Opportunities</a>
      <a class="hl_navItem" href="#">Conversations</a>
    </aside>
    <div class="tt-inline-workspace">
      <header class="hl_topHeader"><strong>North Shore Plumbing</strong></header>
      <main class="tt-section-workspace" role="main">
        <section class="tt-inline-heading">
          <div><h1>Contacts</h1><p>Self-contained GHL installation test</p></div>
          <button class="tt-primary-action">Add contact</button>
        </section>
        <div class="tt-inline-grid">
          <table class="hl-table tt-contact-table">
            <thead><tr><th>Contact</th><th>Status</th><th>Value</th></tr></thead>
            <tbody>
              <tr class="selected">
                <td><span class="tt-contact-name"><span class="tt-contact-avatar">ME</span><strong>Maya Evans</strong></span></td>
                <td><span class="tt-tag tt-tag--hot">Hot lead</span></td>
                <td class="amount">`$1,250</td>
              </tr>
              <tr>
                <td><span class="tt-contact-name"><span class="tt-contact-avatar">PS</span><strong>Peter Shaw</strong></span></td>
                <td><span class="tt-tag tt-tag--new">New</span></td>
                <td class="amount">`$680</td>
              </tr>
            </tbody>
          </table>
          <aside class="tt-contact-detail">
            <span class="tt-contact-avatar">ME</span>
            <h2>Maya Evans</h2>
            <p>High-intent caller &middot; Estimate requested</p>
            <button class="tt-secondary-action">Open contact</button>
          </aside>
        </div>
      </main>
    </div>
    <script data-user-role="agency-admin" data-user-type="account">
      window.TalkTuitGHLConfig = {
        persistTheme: false,
        showThemeControl: true,
        colorfulSections: true,
        fullWorkspaceTheme: false,
        brandShell: true,
        showLoadConfirmation: true
      };
$jsSource
    </script>
  </body>
</html>
"@

Set-Content -LiteralPath (Join-Path $packageRoot "inline-install-preview.html") -Value $inlinePreview -Encoding utf8
