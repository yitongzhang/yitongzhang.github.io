---
layout: post
title:  "Startup idea: a better immigration firm"
date:   2021-06-2 -0700
location:   "Oakland, CA"
excerpt_separator: <!--more-->
---
I think a software-enabled immigration law firm would be a great business. <!--more-->  

I'm not a lawyer, just a tech person who's had a lot of personal experience with immigration. When I was seven, my family moved to Canada, where we became citizens a few years later. After college, I filed my own TN for my first job in San Francisco, then filed another TN for my second job. Greencard-wise, I've filed two applications concurrently: an EB3 with my employer and an EB1 with a private immigration firm. 

Based on these experiences, *my core insight is that immigration law is actually very little law, and mostly ops*. In fact, more than 90% of the human hours involved are spent on non lawyering activities like: completing forms, gathering support material, sending and responding information requests, filling out templates, etc. What's worse is that you have to do a lot of these tasks yourself because your lawyers don't know your situation as well as you do. Thankfully, these are all activities we know how to scale with software.

## Why not just sell the software?
Isn't a pure play software model more profitable? Yes, but nobody is buying because:

1. Law firms hate new software. I mean, have you ever tried to get them to use Google docs instead of .docx files?
2. *If it works, law firms have to fire most of their staff, requiring disruptive org change.*

The obvious objection is that several companies have tried the software-enhanced service firm and failed, Atrium being most top of mind. We'll dive into comparable companies in detail later, but I think the key lessons are: 

1. Prefer software > ops > law, [even at the cost of growth](https://twitter.com/justinkan/status/1397730770790141954?s=20): This forces discipline because once you scale up the org, it's hard to reverse. Legal should only ever do legal strategy and final review[^1]. Everything else is at first ops, then moving to software.
2. Stick strictly to the grunt work: doing the same rote thing over and over is automatable. Doing a bunch different things is not.
4. Don't burn out: afaik a big reason Atrium didn't work is that Justin Kan [burned out](https://twitter.com/justinkan/status/1397730765727617025?s=20).

## Product & scaling
First, start with most common types of visas and greencards: L1, H1-B, TN, E3, ajustment of status. These are high volume, low legal work, and something most companies have to deal with. Next move to low proof burden greencards like EB3 and EB2. Then tackle the high proof categories like: O1, E2, NIW, EB1, EB5. After all employment visas are covered, evaluate family-based greencards and naturalization vs moving on to other law categories.

But that that part was obvious. *The sauce lies in how the firm can scale with software instead of labour*. Let's attack this for each category of work.

Initial consultations: Usually done by the partners (read: expensive) because they are trying to both qualify and sell you. But there's no reason a good SDR can't do it just as well if we make the qualification part async software.

Evidence gathering: this is where we build a turbotax-style form to leverage the applicant's own labour – after all, they usually know their evidence the best. This can also be used in combination with templates to gather support letters from third parties too.

Legal arguments: we'll *obtain a large sample of past cases by FOIAing the shit out of the USCIS and build a series of legal argument templates based on effective past arguments.* Templates should also have the required evidenced attached so applicants can self determine whether they can use any of the arguments. If FOIAs don't yield a large number of cases, will need to either hire immigration law firms on contract, or former USCIS officers[^2] to build contracts based on their experience instead of data.

Emails: This is all about *making information well-organized so applicants can self-serve*. For information requests and status updates: build a well-designed knowledge base and status tracker so applicants can answer their own questions. For requesting and sending documentation, build a well-designed document center that explains what is needed, from whom, and when so users can again self-serve. For signatures, see if any of these doc signing services have a "wet ink" feature that makes it look like you had printed out the form and signed in blue ink, then send applicants a "sign" button automatically when something is required

Application preparation: Package should be auto-generated based on legal argument templates and evidence uploaded to the document center. Once that's done, a lawyer manually reviews the final package. This should be the only human labour in the system.

## Distribution

We need to reach two audiences: applicants and sponsoring companies. For the first category, we'll need:

**Great content**: there is surprisingly not a lot of good content out there on Immigration. Many law firms run a blog, but no one has taken SEO + content quality seriously.

**Search ads**: Seems uncompetitive right now in this space.

**Referrals**: Immigrants ask each other all the time about immigration. I was referred to my lawyer, and have in turn referred five other people. Since visa applications typically take a few months, this is the perfect time to offer a fee discount to applicants who refer friends.

For founders, we'll do:

**Sales**: No special sauce here. Just gotta build a sales org.

**Partnerships**: Funds, accelerators, other startup tools (Stripe atlas, Gusto, Carta, etc.) The former two will be easier, especially if they are investors. The latter will require having some relationship or exisiting content presence.

**Great founder focused content**: how to hire visa workers? Not sure what other types of content exist here.

**Proxy services**: Not sure about the ROI, but could be cool to provide Visa harbours for future immigrant entrepreneurs. Basically offer EIR-ships to potential customers. In the same vein, we could also provide a friendly third party who joins as an owner of your company as a service to E2 seekers.

## How the moat grows

**Data and software**: The more cases we see, the more data we have to build our templates from. This in turn makes our ops cheaper, our applications better, and the experience better for our users, leading to more cases.

**Relationships**: Over time, we'll build relationships with educational institutions and professional associations to get bettter access to support letters. Is value add for applicants. Also builds relationshoip with USCIS?

**Brand**: The better we do, the more we have positive word of mouth. Testimonials from E2 and EB1 applicants are going to look especially good on the site.


## Risks

Remote work might eat into people's willingness to immigrate. Not super confident this is true beecause I think most immigrants move for want of a better life, not because they are forced to by their job. A related risk is the decline of America as an immigration destination in the long tem

Market size for employment visas and greencards is relatively small. Need to [check](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/annual-reports/report-of-the-visa-office-2019.html) exactly how small. Immigration is not a growing market, I think. Things are harder when the market is not growing. This might not be a bad thing assuming that immigration is just a springboard to general legal tech, since it means the first market is not outrageously difficult to acquire. 

## Relevant businesses
Here, we figure out who are competing against and who we can learn from.

### Tech-enabled law firms
Envoy global: we want to do this, but with a less shitty tech side.

Boundless: they look like they're doing it right by taking a page out of Turbotax's playbook, but only for family-based greencards. Great content game too.

Atrium: Justin burned out, too much money, too many customers, too many lawyers, not enough product.

Do not pay: like Boundless, but applying the Turbotax approach to even more menial cases. Likely fully automated. Possibly good case study for automating easier visas.

Rocker lawyer: Does anyone even use them?

### Tech companies automating paperwork
Turbo tax: the OG in automating paperwork. Still a lot of good UX patterns to steal from.

Stripe atlas: new kid on the block in terms of paperwork automation. Would love to see how it works on the backend. What is software? What is ops?

Kenchi: Great customer support software. Key insight is to create a template update loop so that new learning is distributed to all.

Arrows: Example of a service that semi-automates high touch services via software. Makes it ops team superpowered.


### Tech enabled professional services
Examples in this category include: Onemedical, Compass real estate, Compound, etc. 

Opendoor



[^1]: Another reason to keep legal in check: you don't want them to become a ["customer"](https://twitter.com/justinkan/status/1397730772476256256?s=20). They're also inheritently more risk-averse, which is not the right attitude for startups. Coinbase suffers from this: live by compliance, die by compliance.

[^2]: A cursory search on [linkedin](https://www.linkedin.com/talent/search?searchContextId=ee1b266b-a031-4c44-9501-60545d1f57d7&searchHistoryId=4607099776&searchKeyword=Appeals%20Officer&searchRequestId=709c98e0-72de-44be-bb87-3eb103037b7f&start=0&uiOrigin=FACET_SEARCH) reveals that, like most government jobs, people just don't leave. However, for how valuable it would be to have an insider, I'm surprised immigration lawyers haven't tried harder.

