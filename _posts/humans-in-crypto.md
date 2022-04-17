---
layout: post
title:  "An overview of human in the loop crypto systems"
date:   2022-02-21  -0700
excerpt_separator: <!--more-->
---
Overview of permissionless human-in-the-loop crypto-mechanisms.

## Protocols for coordinating human activity: 

**Proof of stake**

Most crypto protocols coordinate money. I want to look at the ones that coordinate people. Most protocols for coordinating humans work by introducing skin in game via a stake to induce strangers to behave correctly.

Kleros court: a decentralized court (more of a research project than an actual protocol) that uses staking rewards to incentive juries to arrive at the right conclusion. Jurors put up a stake to participate in a case, and get rewarded for voting with the majority (basically a schellingpoint vote). It's a bit of an overwrought system, but a couple of interesting mechanics worth highlighting: 

1. The use of a schelling point votes
2. The more you stake, the more of you have a chance of being drawn as juror – prioritizing people with the most skin in the game
3. One worry I have is juror qualification, in theory people self-select into the right courts since their decision acumen is proportional to their earning potential, but in reality I suspect many will duning kruger themselves.

Erasure bay: a research marketplace whose core innovation is a "truth staking" mechanism where both information requesters and fulfillers have to put up a stake that's subject to slashing to incentivize accuracy. Some thoughts: 

1. The tasks are too small to necessitate this level of double slashing mechanism. The mechanism is an overkill. Would get more interesting if the average request size was $10k.
2. So the question is: why has no one tried to use it for a large task?

Numerai: a quant fund that trades based on a metamodel of crowd-submitted models. The "crowd" is incentivized to contribute models because successful models can earn high staking rewards of their native NMR token.

1. My worry is that the max cap of 25% monthly gain will not cover fluctuation of the locked NMR
2. Kinda interesting that they make money not on the competition, but off the fund running the metamodel

Polymarket / Omen: both of these are prediction market mechanisms for coordinating a bunch of people's selfish profit seeking motives to arrive at a useful prediction for the future. 

1. Unfortunately, relatively limited to current events.

Goldfinch: though technically a protocol for coordinating loans, Goldfinch has a very interesting backers system, which coordinates underwriters.  

**Proof of work**

Write race: more like a popularity contest or something

Rabbithole

## Collective decision making techiques

Quadratic funding: is a method of allocating a pool of funds towards projects that benefit a wide spread of people. QF oprioritizes funds matching based on the number of people who contributed by using the square root of each contribution summed up, then squared.

Quadratic voting: allows voters to not just express which option they prefer, but also how strongly. each voter has a certain number of credits to deploy. The more they deploy to the same option, the more it costs credits – testing their conviction in their belief.

Retroactive funding: is a way to deploy public goods funding more accurately, by fund things that have worked after they have proven themselves. This creates venture-style returns for public goods.

Conviction voting: frankly i don't fully understand this, but it's a way to solve a lot of the pitfalls of onchain voting like vote buying and last minute swings by time weighting votes.

## Other interesting mechanisms

Token curated registry

Bonding curves

Harbringer tax for price discovery

Perpetual auctions




------

## Public goods funding

**Quadratic voting:**

Problem: public goods funding via matching concentrate fund allocation power in the hands of a minority of wealthy people

Solution: quadratic funding prioritizes projects based on the number of people who contributed. By weighing the number of people more than the dollar amount, this ensures that projects with the broadest benefits get funded

**Retroactive funding:**

Problem: funders don't know ahead of time what's going to work

Retroactive funding: fund things that have worked, after they have proven themselves. This creates venture-style returns for public goods.
