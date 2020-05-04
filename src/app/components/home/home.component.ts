import { Component, OnInit } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { take, mergeMap, map, pluck, flatMap, filter, mapTo, reduce } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { all, RootObject, BlackCard } from 'src/app/decks';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('zoom', [
      transition(':enter', [
        style({ transform: 'translateX(500%)' }),
        animate('700ms', style({ transform: 'translateX(0%)' })),
        animate('200ms', style({ transform: 'translateX(10%)' })),
        animate('100ms', style({ transform: 'translateX(0%)' }))
      ])
    ]),
    trigger('against', [
      transition(':enter', [
        style({ transform: 'translateX(700%)' }),
        animate('800ms', style({ transform: 'translateX(0%)' })),
        animate('200ms', style({ transform: 'translateX(10%)' })),
        animate('100ms', style({ transform: 'translateX(0%)' }))
      ]),
    ]),
    trigger('humanity', [
      transition(':enter', [
        style({ transform: 'translateX(800%)' }),
        animate('900ms', style({ transform: 'translateX(0%)' })),
        animate('200ms', style({ transform: 'translateX(10%)' })),
        animate('100ms', style({ transform: 'translateX(0%)' }))
      ]),
    ]),
    trigger('happy', [
      transition(':enter', [
        style({ transform: 'translateY(800%)' }),
        animate('900ms', style({ transform: 'translateY(800%)' })),
        animate('700ms', style({ transform: 'translateY(0%)' })),
        animate('200ms', style({ transform: 'translateY(10%)' })),
        animate('100ms', style({ transform: 'translateY(0%)' }))
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
      ]),
    ]),
  ]

})
export class HomeComponent implements OnInit {
  edition: string;
  titles = {
    rr: 'Rocky Robbie Edition',
    dt: 'Dirty Turney Edition',
    ca: `Cowlicks Alex Edition`,
  };

  isMobile: boolean;

  constructor(
    private route: ActivatedRoute,
    private af: AngularFireDatabase,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const idk = this.titles[params.id];

      this.edition = idk ? idk : params.id;
    });


    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);
    console.log(`is mobile ${this.isMobile}`);
  }

  playGame() {
    const code = this.makeRandom();
    this.af.object<RootObject>('/decks').valueChanges().pipe(
      map(f => {
        return { whiteCards: f.whiteCards, blackCards: f.blackCards.filter(card => card.pick === 1) };
      }),
      map(decks => this.af.object(`/games/${code}/decks`).set(decks))
    ).subscribe(resp => {
      resp.then(() => this.router.navigate(['observer', code])).catch(err => console.log(err));
    });
  }

  makeRandom(): string {
    const possible = 'ABCDEFGHIJKLMNOPWXYZ1234567890';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
  }

  setDecks() {
    this.af.object('/decks').set(all);
  }

}
