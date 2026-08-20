# Glacis frontend assessment for TrueGuard

Reviewed on 2026-08-16:

- [Glacis / ZeroDelta homepage](https://www.glacislabs.com/)
- [AirLift page](https://www.glacislabs.com/airlift)
- Public homepage HTML, CSS, and compiled page bundle

## What makes the Glacis page clear

Glacis states one painful problem first, then immediately shows who has that problem. Its “Who uses it” section does not ask the visitor to translate features into use cases. Each audience receives one short promise and one diagram.

The important pattern is:

1. One specific problem in the headline.
2. A short explanation with a real consequence.
3. Named users.
4. One outcome for each user.
5. A diagram that explains the outcome without another paragraph.
6. Repeated proof and ecosystem context after the explanation.

## How the frontend works

- Framework: Next.js and React.
- Audience interaction: a four-panel flex accordion. Closed panels use `flex: 1`; the open panel uses `flex: 6`.
- Desktop trigger: pointer hover opens a panel; click also works.
- Tablet/mobile trigger: click. The vertical tabs become a normal stacked accordion.
- Panel motion: CSS transitions on `flex`, opacity, border, and background. The mobile version measures content height in JavaScript so the panel can expand smoothly.
- Scroll reveal: `IntersectionObserver` adds an `is-visible` class. A light scroll/resize fallback catches already-visible elements.
- Number animation: `requestAnimationFrame` with an ease-out curve.
- Logo strip: a duplicated list inside a `width: max-content` track with a linear CSS translate animation. Hover pauses it.
- Motion libraries: the reviewed homepage bundle does not use GSAP or Framer Motion for these sections.
- Display type: Benzin. Labels use JetBrains Mono. Body text uses Helvetica Neue.
- Accessibility: the live page has reduced-motion rules and duplicate marquee items are removed from the accessibility tree.

## TrueGuard adaptation

| Before | After | Why |
| --- | --- | --- |
| A feature-heavy flow appeared before the user groups | “Who uses TrueGuard” appears before the long product proof | Judges can identify the buyer and use case before learning the architecture |
| User types were small chips below the SDK section | Four interactive audience panels for holders, wallets/exchanges, agents, and issuers | Each user now receives a concrete outcome and visual explanation |
| “TrueGuard Exit” listed ordinary sell and redemption routes | ExitTogether pools compatible small-holder sell orders and compares individual versus batch proceeds | Restores the original product instead of presenting a generic exit calculator |
| The exit card implied a route quote was the core product | Batch size, target, holder count, status, projected savings, limits, and assumptions are visible | Makes the coordination mechanism and safety boundary understandable |
| Integration names had no ecosystem context | A moving “Designed to connect with the RWA stack” strip includes X Layer, OKX Wallet, agents, apps, issuers, and exchanges | Shows where TrueGuard fits without making a false partnership claim |
| The hero said “Know the asset. Know the product.” | “Understand the RWA. Exit together.” | Leads with the distinct end-user outcome |
| Exit information was human-facing only | ExitTogether pool and quote methods are exposed through API, SDK, and agent tools | Preserves TrueGuard as infrastructure rather than another trading app |
| Desktop patterns were compressed onto mobile | The audience panels become a stacked tap accordion and the batch comparison becomes one column | Keeps titles readable and controls reachable at narrow widths |
| A preview button could be mistaken for execution | A four-step wallet state shows test token, approval, escrow and settlement, with explorer links | Users can see exactly when tokens move and which step needs confirmation |
| SPCX research and the settlement demo appeared to be one market | Three plain cards separate the live SPCX product, the tgSPCX testnet proof and the future production token route | Prevents a judge from mistaking a centralized derivative for an X Layer token |
| Savings looked like a firm market result | The card says “estimate,” labels the quote illustrative and puts the test-token warning before the wallet action | Keeps the product exciting without presenting invented liquidity as live |
| Transaction controls could become dense on a phone | Steps fold to a 2×2 grid and order actions become full-width rows | Avoids horizontal overflow and keeps cancellation and claim easy to tap |
| TrueGuard and ExitTogether blended into one long feature list | A two-card product gateway presents “Understand before money moves” and “Sell with holders like you” as equal offers | A visitor can choose the job they need without first understanding the full architecture |
| The API promise was buried in the hero paragraph | “Products and AI agents get the same verified answer through one API” is a separate, accented line | Gives the infrastructure story its own visual weight |
| The ecosystem marquee ran edge to edge with generic labels | The rail is centered in the same content container and supports named products, fallback marks, supplied logos, and relationship labels | Shows the intended RWA stack clearly while avoiding partnership claims |
| Asset labels used one small green treatment | The active asset controls its own larger badge and page accent; gold now uses a real gold tone | Makes “Understand Gold” noticeable and keeps each asset visually distinct |
| Opening the agent response could widen the full document | Machine output, intent results, cards, and transaction errors now wrap and contain long hashes inside their own panels | Stops the sideways page shift and keeps all copy visible on mobile |
| Existing batch demand appeared only inside a scrollable demonstration | The ExitTogether intro and action card both show waiting holders, committed value, and remaining target before the join action | Makes “Join batch” an understandable social action, not an unexplained button |
| The header looked like an ordinary translucent white bar | Layered transparency, saturation, inset highlights, and stronger blur create a liquid-glass surface | Keeps navigation visible while giving the top bar the requested material treatment |
| New campaign copy would replace the old wording permanently | Refined copy is the default and the preserved version remains available through `?copy=classic` | Lets the team compare the rehaul and return to the previous message instantly |
| The centered ecosystem rail sat inside a rounded card | The outer card is removed; only quiet top and bottom dividers contain the moving row | The rail now reads as connective ecosystem context instead of a third product offering |
| The “one answer” promise looked like supporting fine print | The approved copy is larger, darker, and separated by a short green rule | Gives the central product promise enough weight without adding another container |
| A red “MISMATCH — This is not what you asked for” blamed an uninformed user | The human card says “Important difference,” explains price exposure versus ownership, and uses an educational amber state | Guides the user while preserving the strict `MISMATCH` status in agent-readable output |
| Waiting holders appeared as static overlapping circles | Each holder now floats with a slightly different bubble rhythm after the batch card enters view | Makes many small orders feel alive and coordinated without animating layout properties |
| Developer and agent-demo subtext used 7–9px low-contrast labels | Supporting copy now uses larger type and stronger contrast in both the page and embedded demo | Makes the integration instructions and agent states readable without competing with headings |
| TrueGuard used a rounded sticky glass card | The header now follows Glacis’s fixed translucent bar, stronger scrolled blur, scroll-direction reveal, pointer-at-top reveal, centered desktop nav and mobile bottom sheet | Matches the reference’s visual structure and interaction model while retaining TrueGuard controls |

## Typography decision

The Glacis site serves Benzin font files, but a public web asset is not by itself a redistribution licence. TrueGuard therefore keeps Space Grotesk as a close, readable display substitute and DM Mono for technical labels. If the team obtains a Benzin licence, the display font can be swapped through the existing `h1, h2, h3` rule without changing layout.

## Product correction

The previous PRD treated “Exit” as a list of ways to sell, close, or redeem. That information is useful, but it is not ExitTogether.

ExitTogether is now defined as:

> Small holders selling the exact same RWA product pool compatible orders into one larger batch. The batch seeks a block or RFQ quote and executes only when the final quote is inside every holder’s signed limit and is better than the permitted alternative after fees.

Aggregation is not presented as an automatic slippage cure. The production system must compare firm quotes at the same time, enforce product/direction compatibility, honour deadlines and cancellations, and allocate proceeds pro rata.
