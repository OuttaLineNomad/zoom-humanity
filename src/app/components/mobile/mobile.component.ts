import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, state, animate } from '@angular/animations';
import { timeInterval, timeout } from 'rxjs/operators';

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
  score: number = 12
  username: string = 'BamBam';
  animateCard: string;
  trigger: string;

  cards = ['I am card 1 and i have an answer', 'I am card 2', 'test 3']
  constructor() { }

  ngOnInit(): void {
  }

  right() {
    this.nextCard();
    this.animateCard = 'rightOut';


  }

  left() {

    this.nextCard();
    this.animateCard = 'leftOut';
  }

  nextCard() {
    const cards = this.cards;
    cards.push(cards.shift());
    this.cards = cards;

  }
  report(e) {
    console.log(e);

  }

  send(num: number) {
    const cards = this.cards;
    cards.splice(num,1);
    this.cards = cards;
    this.animateCard = 'sendOut';
  }

}

