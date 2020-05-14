import { Component, OnInit, Input } from '@angular/core';
import { trigger, transition, style, state, animate } from '@angular/animations';
import { FirebaseService, Player, Judge, BlackCard } from 'src/app/service/firebase.service';
import { take, mergeMap } from 'rxjs/operators';


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

  @Input() playerName: string;
  @Input() code: string;

  cards: HandCards[] = [{ text: '' }];
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
      this.msg = `Hello ${player.playerName}, just waiting for all your slow friends to catch up. `;
      this.player = player;
      if (this.judge) {
        return;
      }
      if (player.whiteCards === undefined) {
        return;
      }
      this.cards = player.whiteCards.map(text => {
        return { text, black: false };
      });

      if (this.cards.length > 0) {
        let score = 0;
        if (player.blackCards !== undefined) {
          score = this.getBlackScore(player.blackCards).length;
          console.log('score ===', score);
        }
        this.msg = `${player.playerName} your score ${score}.`;
      }
    });

    this.afs.getJudge(code).subscribe(judge => {
      if (judge === null) {
        return;
      }
      if (judge.judgeName === this.player.playerName) {
        this.judge = true;
        this.bCard = judge.blackCard.text;
        this.cards = [{ text: judge.blackCard.text.replace('_', '____'), black: true }];

        if (judge.allIn) {
          const addCards = judge.whiteCards.map(card => {
            return { text: card.whiteCard, black: false, playerName: card.player };
          });
          this.cards.push(...addCards);
        }
        this.msg = `${this.player.playerName} you're in charge.`;
        return;
      }

      this.judge = false;
      if (this.player.whiteCards === undefined) {
        return;
      }
      this.cards = this.player.whiteCards.map(text => {
        return { text, black: false };
      });

      if (this.cards.length > 0) {
        this.msg = `${this.player.playerName} your score ${this.player.score} `;
      }
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
    if (!this.player.send) {
      return;
    }
    this.player.send = false;
    if (this.cards[num].black) {
      this.player.send = true;
      return;
    }
    // animate this stuff
    const cards = this.cards;
    const card = cards.splice(num, 1);
    this.cards = cards;
    this.animateCard = 'sendOut';

    console.log("sending");

    setTimeout(() => {
      this.animateCard = '';
    }, 100);
    // done animating
    if (this.judge) {
      this.afs.sendWinner(card[0], this.bCard, this.code).then(() => {
        this.player.send = true;
        this.ready = false;
      }).catch((err) => {
        console.log(err);
        this.player.send = true;
        this.cards.push(card[0]);
      });
      return;
    }

    const hand = cards.map(oneCard => oneCard.text);

    this.afs.sendCard(card[0].text, this.code, this.playerName).subscribe(result => {
      result.then(() => {
        console.log('New Card');

        this.afs.drawCard(this.code).pipe(
          take(1),
          mergeMap(text => {
            console.log(text);

            hand.push(text);
            // this.cards.push({ text, black: false });
            return this.afs.setHand(hand, this.code, this.playerName);
          })
        ).subscribe(() => {
          console.log('updated had');
          this.player.send = true;
        });
      }).catch((err) => {
        console.error(err);
        this.player.send = true;
        this.cards.push(card[0]);
      });
    });
  }

}

