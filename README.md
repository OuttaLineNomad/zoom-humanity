# ZoomHumanity

A serverless Cards Against Humanity game. Made with Angular and Firebase realtime database. 

I wanted to force people to play together like the real thing. The idea is to start the game on a computer, where you can share your screen with all the players. This screen controls the flow of the game. Then players scan the QR Code at the top of the shared screen.

NSFW!!! The cards are taken from real decks in Cards Against Humanity, and some greatened from the community that like CAH. Lets just say they are worse then you think. Once everyone has logged in, the person sharing the screen can hit the Start Game button.

Play here:  https://against-humanity.com/ 

I made the site, but you choose these horrible cards. So, that's on you.

# Contribution

[@crhallberg](https://github.com/crhallberg/) was kind enough to collect all the CAH decks into a great JSON format. [Here](https://github.com/crhallberg/json-against-humanity) is that project. The data you see in the game was sourced form here.

### Fine Print (Taken from above project)

Please buy [Cards Against Humanity](https://cardsagainsthumanity.com/). They deserve your gross, germ-covered money more than you do.

Card sources, merged by hand and machine: [Hangouts Against Humanity](https://github.com/samurailink3/hangouts-against-humanity), [Pretend You're Xyzzy](http://pyx-3.pretendyoure.xyz/zy/viewcards.jsp) and [this spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0Ajv9fdKngBJ_dHFvZjBzZDBjTE16T3JwNC0tRlp6Wnc&usp=sharing#gid=55) I found through [Board Game Geek](https://boardgamegeek.com/).

**Is this legal?** Yes. Cards Against Humanity is distributed under a [Creative Commons BY-NC-SA 2.0 license](https://creativecommons.org/licenses/by-nc-sa/2.0/), and so is this website and all the data that comes out of it. That means you can use, remix, and share the game for free, but you can't sell it without permission. Consult [their FAQ](https://cardsagainsthumanity.com/#info) if you don't believe me. If you have paperwork that says otherwise, email me, we can work this out.

# TODO

[] Document more and clean up code.
[] Fix judge can see cards before all submitted sometimes.
[] Add pick 2 back cards and the capability to ignore them.
[] Add feature to select what deck to use
  [] Add family friendly decks.
[] Add cloud function to clean up abandoned games.
