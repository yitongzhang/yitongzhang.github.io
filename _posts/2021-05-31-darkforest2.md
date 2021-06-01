---
layout: post
title:  "Dark Forest captain's log 2"
date:   2021-05-31 -0700
location:   "Dark Forest"
excerpt_separator: <!--more-->
---
Day seven in the dark forest, where I'm now strategically watching commit logs and deploying more hash power. Also, a dispatch from meatspace. <!--more--> It's a good thing that my still humble civilization is now large enough that the pending transaction queue is preventing me from logging in to pilot, because otherwise, I'd still be doing that. Anyway, let's start with a check in on the todos from last time. 

Exploration server: I found this managed deployment tool called Zeet. Following their [Dark Forest guide](https://blog.zeet.co/eth/), I deployed three instances of the explorer for free, adding another ~3600 hash/s to my exploration. This is an improvement, but to be competitive, I'll most likely still have to set up my own servers, since scaling on Zeet is quite expensive.

Silver distribution: Someone just published a [major update](https://github.com/darkforest-eth/plugins/pull/60) to the Distribute silver plugin, implementing a rudimentary, but nonetheless functional version of silver convoying to rips.

In general, it seems like open source tooling is getting better at a rapid pace. So much so that I expect that good plugins will emerge for all basic operation of the core mechanics. For example, here's another [great plugin](https://github.com/darkforest-eth/plugins/pull/65) from just two days ago, which centralizes resources to large/useful planets. In fact, I suspect that an important part of the future gameplay will involve watching the [commit log](https://github.com/darkforest-eth/plugins/commits/master) of the plugin repo. 

Given my expectation of open source tooling, my current hypothesese on where one should invest to gain a technical edge are:

## Hashrate
This one is pretty simple. Clearing the fog of war means you can expand more strategically, engage in diplomacy, plan for the long term, etc. It's unlikely that players will want to open source their map, this being a dark forest after all. So being able to deploy lots of hash power will remain a competitive edge.

## Automation
Assuming no one is piloting full time, establishing and optimizing some expansion, upgrade, and silver routing routines should at least double a pilot's effectiveness. Basically, [repeat attack](https://github.com/darkforest-eth/plugins/blob/master/content/productivity/repeat-attack/plugin.js), but for everything.

## Dipatches from meatspace
Lastly, I've had a chance to meet some fellow pilots both physically and via Telegram. The community is small, engaged, and hyper sophisticated – I've even been recruited into a budding DAO with access to a eye-watering amount of hash power. And just for contrast, I also met a top 15 player who's been playing purely manually, beating many more technically sophisticated players, including the DAO I've been recruited into. His advice to me: was that diplomacy might be the highest leverage human activity. Make sense.

## Miscellaneous learnings:
Exploration: It seems like anything L5 and above gets significantly rarer, so the game right now is to expand from L4 to L4, growing the reach of my holdings until I find an uncompetitive L5+. This means hashrate is once again a rate limiter since expanding the number of holdings of the same level offers linear growth, while acquiring a planet of the next level offers step change.  Also, the more vision you have, the better you can steer your expansion towards the next level planets.

War: Due to energy decay over distance, defenders have signficant advantage. This means that it's often better to expand to unclaimed planets, than to try to claim planets from other pilots. This offers a natural peace, at least until nearby unclaimed planets run out. 

Quasars: Inverts the defender's advantage since they take time to capture and charge up, and so are often left empty. Can be an good mounting point for an attack.

Until next time, space farers. Capatain Zhang, out. 