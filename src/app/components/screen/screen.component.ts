import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { take } from 'rxjs/operators';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss'],
  animations: [
    trigger('code', [
      transition(':enter', [
        style({ transform: 'translateY(1000%)' }),
        animate('300ms', style({ transform: 'translateY(800%)' })),
        animate('700ms', style({ transform: 'translateY(0%)' })),
        animate('200ms', style({ transform: 'translateY(10%)' })),
        animate('100ms', style({ transform: 'translateY(0%)' }))
      ]),
    ]),
    trigger('qr', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1500ms', style({ opacity: 0 })),
        animate('500ms', style({ opacity: 1 })),
        animate('100ms', style({ opacity: 0 })),
        animate('100ms', style({ opacity: 1 })),
        animate('100ms', style({ opacity: 0 })),
        animate('300ms', style({ opacity: 1 })),
        animate('250ms', style({ opacity: 0 })),
        animate('300ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('button', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1500ms', style({ opacity: 0 })),
        animate('500ms', style({ opacity: 1 })),
        animate('100ms', style({ opacity: 0 })),
        animate('100ms', style({ opacity: 1 })),
        animate('100ms', style({ opacity: 0 })),
        animate('300ms', style({ opacity: 1 })),
        animate('250ms', style({ opacity: 0 })),
        animate('300ms', style({ opacity: 1 })),
      ])
    ])
  ]
})

export class ScreenComponent implements OnInit {
  code: string;
  isMobile: boolean;
  started: boolean;
  qrCode: string;
  bCard: string;

  users= [
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
    {name:'naughty nat', score: 12},
    {name:'bryce', score:0},
  ]

  constructor(
    private route: ActivatedRoute,
    private af: AngularFireDatabase,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      this.code = params.id;
      this.qrCode = `http://192.168.1.14:4200/${this.code}`;
    });


    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);
    console.log(`is mobile ${this.isMobile}`);
  }

  startGame() {
    this.started = true;
    this.bCard = "The top Google auto-complete results for \"Barack Obama\":\n- Barack Obama Height.\n- Barack Obama net worth.\n- Barack Obama _.\"";
  }
  endGame() {


  }

  nextCard() {

  }

}
