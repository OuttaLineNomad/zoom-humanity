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
        style({ zIndex: 100 }),
        animate('500ms', style({
          transform: 'rotate(25deg)',
          transformOrigin: 'bottom right'
        })),
        animate('500ms', style({
          transform: 'translateX(200%)',
          zIndex: 0
        }))
      ]),
      transition('*=>leftOut', [
        style({ zIndex: 100 }),
        animate('500ms', style({
          transform: 'rotate(-25deg)',
          transformOrigin: 'bottom left'
        })),
        animate('500ms', style({
          transform: 'translateX(-200%)',
          zIndex: 0
        }))
      ]),
      transition('*=>endFront', [
        animate('1s', style({
          opacity: 1,
          transform: 'translateX(0)',
          zIndex: 100
        }))
      ]),
      transition('*=>endBack', [
        animate('1s', style({
          opacity: 1,
          transform: 'translateX(0)',
          zIndex: 0
        }))
      ]),
    ])]
})
export class MobileComponent implements OnInit {
  score: number = 12
  username: string = 'BamBam';
  test: boolean;
  card: string = 'card1';
  test2: boolean
  card1: string;
  card2: string;
  constructor() { }

  ngOnInit(): void {
  }

  right(num: number) {
    this.card1 = num === 1 ? 'rightOut' : '';
    this.card2 = num === 2 ? 'rightOut' : '';

    setTimeout(() => {
      // this.test = num === 1;
      // this.test2 = num === 2;
    }, 450);
  }

  left(num: number) {



    this.card1 = num === 1 ? 'leftOut' : '';
    this.card2 = num === 2 ? 'leftOut' : '';
    setTimeout(() => {
      // this.test = num === 1;
      // this.test2 = num === 2;
    }, 450);
  }

  reset(num: number) {
    this.card1 = num === 1 ? 'endBack' : '';
    this.card2 = num === 2 ? 'endBack' : '';
  }

}
