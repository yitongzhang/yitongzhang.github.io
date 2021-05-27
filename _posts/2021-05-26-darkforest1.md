---
layout: post
title:  "Dark Forest captain's log 1"
date:   2021-05-26 -0700
location:   "the Dark Forest"
excerpt_separator: <!--more-->
---

Dark forest space is vast. But I didn't know that at first, busy as I was, claiming all celestial bodies in sight. But space had a way of quickly teaching you its lessons. <!--more-->

The first issue I ran into was the fog of war. With my laptop's paltry 600 hashes/sec, I quickly ran out of planets to claim. I had to find a way to increase my exploration speed. The easiest solution was to let dark forest use all the cores in my CPU with `df.setMinerCores(6)`, which gave me a nice 6x boost to 2400 hashes/sec. But even that was not sufficient, so I set up a more efficient rust miner on my machine with [mimi-fast](https://github.com/projectsophon/darkforest-rs/tree/main/mimc-fast) and [remote explore](https://github.com/darkforest-eth/plugins/tree/master/content/productivity/remote-explore), which brought me to a nice 6000 hashes/sec. This gave me far more planets in view than I knew what to do with, which is what lead me to the [crawl planets plugin](https://github.com/darkforest-eth/plugins/blob/master/content/productivity/crawl-planets/plugin.js). It's not very smart, but sure helps cover ground quickly.

Thanks to increased speed, it took no time for me to run into my two neighbours: jimjim_eth in yellow and 0xe98 in purple. Jimjim controls few astral bodies, but they're all highly valuable. 0xe98 is the opposite: controlling everything in his sector, indiscriminate of value, most likely through the use of the same crawler I'm using. I can tell because the shape of his holding looks much like mine.

At first, I was threatened by the discovery of two neighbouring civilizations so close by, but after examining their silver withdrawals on the global leaderboard, I was reassured to find that they were roughly in the same order of magnitude in power as me. I have no desire to fight them, but if I had to, I'm comforted by the thought that it wouldn't be completely one-sided.

With my growing holdings (which I refuse to call an empire, because my people deserve a better governance system, but that's for later), it's becoming more difficult to efficiently funnel my silver to space-time tears. I could try to set up a transfer routine, but that won't get me too much further. And unfortunately, there's no "withdraw silver plugin", so that leaves me with no choice but to write my own. 

If my neighbours don't destroy me between now and the next log, these will be my action items:

1. Write an auto silver withdrawal plugin
2. Increase my exploration hash rate with a remote server. 

Captain Zhang, signing off. See you all in the [Dark Forest](zkga.me).