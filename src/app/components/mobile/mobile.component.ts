import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, state, animate } from '@angular/animations';
import { FirebaseService, Player, Judge } from 'src/app/service/firebase.service';

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
  judge: Judge;

  cards: string[];
  constructor(
    private afs: FirebaseService,
  ) { }

  ngOnInit(): void {
    this.isMobile = this.afs.isMobileDevice(navigator.userAgent);
    window.scroll(0, 0);

    this.afs.getPlayer().subscribe(player => {
      this.player = player;
      this.cards = player.whiteCards;
      this.judge = player.judge;

      if (this.cards.length > 0) {
        this.msg = `${player.playerName} you got ${player.score} in the bag.`;
      }
    });


    this.msg = `Hello ${this.player.playerName}, just waiting for all your slow friends to catch up. `;
  }


  right() {
    if (this.cards.length !== 1) {
      this.nextCard();
      this.animateCard = 'rightOut';
    }
  }

  left() {
    if (this.cards.length !== 1) {
      this.nextCard();
      this.animateCard = 'leftOut';
    }
  }

  nextCard() {
    const cards = this.cards;
    cards.push(cards.shift());
    this.cards = cards;
  }

  send(num: number) {
    if (!this.player.send) {
      return;
    }
    // animate this stuff
    const cards = this.cards;
    const card = cards.splice(num, 1);
    this.cards = cards;
    this.animateCard = 'sendOut';
    setTimeout(() => {
      this.animateCard = '';
    }, 400);
    // done animating

    this.afs.sendCard(card[0]).subscribe(result => {
      result.then(() => {
        this.player.send = false;
      }).catch(() => {
        this.cards.push(card[0]);
      })
    });
  }

}

