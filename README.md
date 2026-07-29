# TalkTuit GHL Customizer

A lightweight, brand-matched HighLevel dashboard theme built from the TalkTuit Brand Guidelines v1.0 (July 2026).

The package uses:

- Deep Navy and Mist as the main workspace colors
- Coral for the primary action and urgent states
- Teal for success, active navigation, and secondary accents
- Manrope for interface text
- JetBrains Mono for values, prices, phone data, and timestamps
- Rounded cards, 2px-style icons, restrained motion, and the four-bar waveform motif
- Route-aware color treatments for Contacts, Opportunities, and Conversations

## Files

- `talktuit-ghl.css` - the production theme
- `talktuit-ghl.js` - theme initialization, optional display switcher, and pipeline tag decoration
- `ghl-custom-css.html` - copy/paste loader for HighLevel's Custom CSS field
- `ghl-custom-javascript.html` - copy/paste loader for HighLevel's Custom JavaScript field
- `preview.html` and `preview.css` - local mock CRM for reviewing the design
- `sections-preview.html` and `sections-preview.css` - responsive previews of the three colorful CRM sections

## Install

The production assets are hosted from the public
[`LOUIEVA/talktuit-ghl-assets`](https://github.com/LOUIEVA/talktuit-ghl-assets)
repository through jsDelivr:

- `https://cdn.jsdelivr.net/gh/LOUIEVA/talktuit-ghl-assets@v1.1.0/talktuit-ghl.css`
- `https://cdn.jsdelivr.net/gh/LOUIEVA/talktuit-ghl-assets@v1.1.0/talktuit-ghl.js`

1. In HighLevel, switch to Agency View and open `Settings > Company > Whitelabel`.
2. Paste the contents of `ghl-custom-css.html` into Custom CSS.
3. Paste the contents of `ghl-custom-javascript.html` into Custom JavaScript.
4. Save, reload the CRM, and test Agency View plus at least one Sub-Account.
5. Upload the official transparent TalkTuit horizontal logo in HighLevel's Whitelabel branding area. Do not recreate or recolor the logo.

HighLevel recommends a logo up to 350 x 180 px and no larger than 2.5 MB.

## Important rollout note

Do not test this at the same time as ThemeBuilder, HL Pro Tools, Everypages, or another full-dashboard customizer. Those tools can style the same elements and produce unpredictable results.

The sample code you supplied loads jQuery 3.7.1 and 3.5.1 on the same page. This customizer does not need jQuery. Remove both copies unless another verified integration specifically requires one version.

Test with a small group first. HighLevel states that dashboard Custom CSS/JS is unsupported and selectors can change after platform updates.

## Configuration

Set options before the external script:

```html
<script>
  window.TalkTuitGHLConfig = {
    theme: "light",
    persistTheme: true,
    showThemeControl: true,
    decorateOpportunityTags: true,
    colorfulSections: true
  };
</script>
```

Options:

- `theme`: `"light"` or `"focus"`
- `persistTheme`: saves each user's choice in their browser
- `showThemeControl`: shows the four-bar display control in the lower-right corner
- `decorateOpportunityTags`: styles recognized pipeline tags and their cards
- `colorfulSections`: adds route-scoped color to Contacts, Opportunities, and Conversations; set to `false` for the neutral white workspace
- `tagAliases`: adds or replaces the text recognized for `hot`, `urgent`, `new`, `won`, `follow-up`, and `cold`
- `debug`: prints diagnostic messages to the browser console

Example custom tag mapping:

```html
<script>
  window.TalkTuitGHLConfig = {
    tagAliases: {
      urgent: ["same day", "emergency", "priority"],
      won: ["job booked", "deposit paid"]
    }
  };
</script>
```

## Privacy and dependencies

- No user information is transmitted by this code.
- The loader only exposes sanitized role/type values on the page for optional role-based styling.
- The theme uses vanilla JavaScript and has no jQuery dependency.
- Google Fonts loads Manrope and JetBrains Mono. Self-host the fonts if your privacy policy requires it.

## Update and cache-busting

When updating the hosted files, create a new GitHub release tag and update both
loader URLs. For example:

```text
https://cdn.jsdelivr.net/gh/LOUIEVA/talktuit-ghl-assets@v1.1.1/talktuit-ghl.css
https://cdn.jsdelivr.net/gh/LOUIEVA/talktuit-ghl-assets@v1.1.1/talktuit-ghl.js
```

## Roll back

Remove the two TalkTuit loader blocks from HighLevel and save. To clear a user's stored display choice, run this once in the browser console:

```js
localStorage.removeItem("talktuit-ghl-theme");
```
