import { Component, OnInit, Input } from '@angular/core';
import { trigger, transition, style, state, animate } from '@angular/animations';
import { FirebaseService, Player, Judge, BlackCard } from 'src/app/service/firebase.service';
import { take, mergeMap, flatMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';


export interface HandCards {
  text: string;
  black?: boolean;
  playerName?: string;
}
@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
  animations: [
    trigger('card', [
      transition('*=>rightOut', [
        style({ zIndex: 100, boxShadow: 'none' }),
        animate('300ms', style({
          transform: 'rotate(25deg)',
          transformOrigin: 'bottom right'
        })),
        animate('300ms', style({
          transform: 'translateX(200%)',
          zIndex: 0
        }))
      ]),
      transition('*=>leftOut', [
        style({ zIndex: 100, boxShadow: 'none' }),
        animate('300ms', style({
          transform: 'rotate(-25deg)',
          transformOrigin: 'bottom left'
        })),
        animate('300ms', style({
          transform: 'translateX(-200%)',
          zIndex: 0
        }))
      ]),
      transition('*=>sendOut', [
        style({ zIndex: 100, boxShadow: 'none' }),
        animate('300ms', style({
          transform: 'translateY(-200%)',
          zIndex: 0
        }))
      ]),
    ])]
})
export class MobileComponent implements OnInit {
  player: Player;
  animateCard: string;
  trigger: string;
  isMobile: boolean;
  msg: string;
  judge: boolean;
  ready: boolean;
  bCard: string;
  endGame: boolean;
  judgeSub: Subscription;
  cardSent: boolean;

  @Input() playerName: string;
  @Input() code: string;

  cards: HandCards[] = [{ text: '' }];
  playerHand: HandCards[] = [{ text: '' }];
  constructor(
    private afs: FirebaseService,
  ) { }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.isMobile = this.afs.isMobileDevice(navigator.userAgent);
    this.setUpData(this.code, this.playerName);
  }

  setUpData(code: string, playerName: string) {
    this.afs.getPlayer(code, playerName).subscribe(player => {
      if (player === null) {
        console.log('Game ended');
        this.cards = [{ text: 'end' }];
        localStorage.removeItem(`player:${this.code}`);
        this.msg = 'The game has ended, go home!';
        this.endGame = true;
        return;
      }
      this.player = player;
      this.cardSent = player.send;
      console.log('play player', player);
      console.log('play player ths ', this.player);
      console.log('state of player ==================', player);

      if (player.judge) {
        if (!this.judge) {
          this.getJudge(code);
        }
      } else {
        this.judge = false;
        console.log('player had ==', player.whiteCards);
        if (this.judgeSub) {
          this.judgeSub.unsubscribe();
        }

        if (player.whiteCards === undefined) {
          this.msg = `Hello ${player.playerName}, just waiting for all your slow friends to catch up. `;
          return;
        }
        this.cards = player.whiteCards.map(text => {
          return { text, black: false };
        });

        this.playerHand = this.cards;

        if (this.cards.length > 0) {
          let score = 0;
          if (player.blackCards !== undefined) {
            score = this.getBlackScore(player.blackCards).length;
            console.log('score ===', score);
          }
          if (!this.cardSent) {
            this.msg = `${player.playerName} your score ${score}.`;
          } else {
            this.msg = 'You sent a card to the judge.';
          }
          return;
        }
      }
    });


  }

  getJudge(code: string) {
    this.judgeSub = this.afs.getJudge(code).subscribe(judge => {
      if (judge === null || judge === undefined) {
        return;
      }
      this.judge = true;
      this.bCard = judge.blackCard.text;
      this.cards = [{ text: judge.blackCard.text.replace('_', '____'), black: true }];

      if (judge.allIn && judge.whiteCards !== undefined) {
        const addCards = Object.keys(judge.whiteCards).map(key => {
          return { text: judge.whiteCards[key].whiteCard, black: false, playerName: judge.whiteCards[key].player };
        });

        this.cards.push(...addCards);
      }
      this.msg = `${this.player.playerName} you're in charge.`;
    });
  }

  getBlackScore(data: { [key: string]: BlackCard }): BlackCard[] {
    const cards = [];
    for (const card in data) {
      if (data.hasOwnProperty(card)) {
        cards.push(card);
      }
    }
    return cards;
  }

  right() {
    if (this.cards.length !== 1) {
      this.nextCard();
      this.animateCard = 'rightOut';
    }
  }

  left() {
    if (this.cards.length !== 1) {
      this.nextCardL();
      this.animateCard = 'leftOut';
    }
  }

  nextCard() {
    const cards = this.cards;
    cards.push(cards.shift());
    this.cards = cards;
  }

  nextCardL() {
    const cards = this.cards;
    cards.unshift(cards.pop());
    this.cards = cards;
  }

  send(num: number) {
    if (num === -1) {
      this.afs.ready(this.code);
      this.animateCard = 'sendOut';
      setTimeout(() => {
        this.animateCard = '';
        this.ready = true;
      }, 100);
      return;
    }
    console.log('send player', this.cardSent);

    if (this.cardSent) {
      return;
    }
    this.cardSent = true;
    if (this.cards[num].black) {
      this.cardSent = false;
      return;
    }
    // animate this stuff
    const cards = this.cards;
    const card = cards.splice(num, 1);
    this.cards = cards;
    this.animateCard = 'sendOut';

    setTimeout(() => {
      this.animateCard = '';
    }, 100);
    // done animating
    if (this.judge) {
      console.log('sending winner');

      this.afs.sendWinner(card[0], this.bCard, this.code, this.playerName).then(() => {
        console.log('sending winner 4444');

        this.ready = false;
        this.judge = false;
      }).catch((err) => {
        console.log(err);
        this.cardSent = false;
        this.cards.push(card[0]);
      });
      return;
    }

    const hand = cards.map(oneCard => oneCard.text);

    this.afs.sendCard(card[0].text, this.code, this.playerName).then(() => {
      console.log('New Card');
      this.msg = 'Why did you send that one?';
      this.afs.drawCard(this.code, 1).pipe(
        take(1),
        mergeMap(text => {
          console.log(text);

          hand.push(text[0]);
          // this.cards.push({ text, black: false });
          return this.afs.setHand(hand, this.code, this.playerName);
        })
      ).subscribe(() => {
        console.log('updated had');
      });
    }).catch((err) => {
      console.error(err);
      this.cardSent = false;
      this.cards.push(card[0]);
    });
  }

}

