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
2. If it works, they have to fire a lot of their staff, requiring disruptive org change.

The obvious objection is that several companies have tried the software-enhanced service firm and failed, Atrium being most top of mind. We'll dive into comparable companies in detail later, but I think the key lessons are: 

1. Prefer software > ops > law, even at the cost of growth: This forces discipline because once you scale up the org, it's hard to reverse. Legal should only ever do legal strategy and final review. Everything else is at first ops, then moving to software.
2. Stick strictly to the grunt work: doing the same rote thing over and over is automatable. Doing a bunch different things is not.
4. Don't burn out: afaik a big reason Atrium didn't work is that Justin Khan burned out.

## Product & scaling
First, start with most common types of visas and greencards: L1, H1-B, TN, E3, ajustment of status. These are high volume, low legal work, and something most companies have to deal with. Next move to low proof burden greencards like EB3 and EB2. Then tackle the high proof categories like: O1, E2, NIW, EB1, EB5. After all employment visas are covered, evaluate family-based greencards and naturalization vs moving on to other law categories.

But that that part was obvious. The sauce lies in how the firm can scale with software instead of labour. Let's attack this for each category of work.

Initial consultations: Usually done by the partners (read: expensive) because they are trying to both qualify and sell you. But there's no reason a good SDR can't do it just as well if we make the qualification part async software.

Evidence gathering: this is where we build a turbotax-style form to leverage the applicant's own labour – after all, they usually know their evidence the best. This can also be used in combination with templates to gather support letters from third parties too.

Legal arguments: we'll obtain a large sample of past cases by FOIAing the shit out of the USCIS and build a series of legal argument templates based on effective past arguments. Templates should also have the required evidenced attached so applicants can self determine whether they can use any of the arguments. If FOIAs don't yield a large number of cases, will need to figure out another approach. Possibly hire several immigration law firms on contract to build contracts based on their experience instead of data.

Emails: This is all about making information well-organized so applicants can self-serve. For information requests and status updates: build a well-designed knowledge base and status tracker so applicants can answer their own questions. For requesting and sending documentation, build a well-designed document center that explains what is needed, from whom, and when so users can again self-serve. For signatures, see if any of these doc signing services have a "wet ink" feature that makes it look like you had printed out the form and signed in blue ink, then send applicants a "sign" button automatically when something is required

Application preparation: Package should be auto-generated based on legal argument templates and evidence uploaded to the document center. Once that's done, a lawyer manually reviews the final package. This should be the only human labour in the system.

## Distribution

We need to reach two audiences: applicants and sponsoring companies.

### For applicants
1. Great content: there is surprisingly not a lot of good content out there on Immigration. Many law firms run a blog, but no one has taken SEO + content quality seriously.
2. Search ads:
3. Referrals: Immigrants ask each other all the time about immigration. I was referred to my lawyer, and have in turn referred five other people. Since visa applications typically take a few months, this is the perfect time to offer a fee discount to applicants who refer friends.

### For companies 
1. Sales: No special sauce here. Just gotta build a sales org.
2. Partnerships: Funds, accelerators, other startup tools (Stripee atlas, Gusto, Carta, etc.) The former two will be easier, especially if they are investors. The latter will require having some relationship or exisiting content presence.
4. Great founder focused content: how to hire visa workers? Not sure what other types of content exist here.

Proxy services
Not sure about the ROI, but could be cool to provide Visa harbours for future immigrant entrepreneurs. Basically offer EIR-ships to potential customers. In the same vein, we could also provide a friendly third party service for E2


Visa holding pen: Company that employs you while you are thinking about your next thing
Friendly US person as a service: They join as your cofounder and hold the ability to fire you so you can get EB2 visa

## Loops
### More cases -> Better software -> More cases

### More cases -> Better relationship with professional associations -> More cases


# Todos

Market sizing: 
https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/annual-reports/report-of-the-visa-office-2019.html

## Risks

Remote work might eat into people's willingness to immigrate


Market size


Family-based immigration much larger


Political uncertainty

## Comparable businesses

Envoy

Boundless


Atrium

Turbo tax


Do not pay


Onemedical


Stripe atlas


Rocker lawyer


Compass/Opendoor


Kenchi

One more i can't recall now

https://www.tefter.io/bookmarks/48931/readable