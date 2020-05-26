import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, mergeMap, map } from 'rxjs/operators';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FirebaseService, BlackCard } from 'src/app/service/firebase.service';
import { environment } from 'src/environments/environment';

export interface PlayerScore {
  name: string;
  score: number;
  send: boolean;
  judge: boolean;
}
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
    trigger('wCard', [
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
  codeURI: string;
  ready: boolean;

  users: PlayerScore[];
  players: string[];
  currentJudge = 0;
  winner: string;
  wCard: string;
  judgeName: string;
  newJudge = true;


  constructor(
    private route: ActivatedRoute,
    private afs: FirebaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      take(1),
      mergeMap(params => {
        this.code = params.id;
        this.codeURI = `${environment.uri}${this.code}`;
        this.qrCode = `${this.codeURI}`;
        return this.afs.getPlayers(params.id);
      })
    ).subscribe(players => {
      console.log(players);

      this.players = players.map(player => player.playerName);
      this.users = players.map(player => {
        console.log('player == ', player);

        let score = 0;
        if (player.blackCards !== undefined) {
          score = this.getBlackScore(player.blackCards).length;
        }
        console.log(player);
        if (player.whiteCards.length === 1 && this.started) {
          this.afs.drawHands(1, this.code).pipe(
            map(hands => {
              return this.afs.dealHands(hands, [player.playerName], this.code);
            })
          ).subscribe(() => console.log('new player got hand'));

        }

        return { name: player.playerName, score, send: player.send, judge: player.judge };
      }).sort((a, b) => b.score < a.score ? -1 : b.score > a.score ? 1 : 0);

      this.started = localStorage.getItem(`started:${this.code}`) === 'true';
      if (this.started) {
        console.log('started');
        this.startGame(true);
      }
    });

    this.isMobile = this.afs.isMobileDevice(navigator.userAgent);
    console.log(`is mobile ${this.isMobile}`);
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

  startGame(restart: boolean = false) {
    if (!restart) {
      this.afs.setJudge(this.players[this.currentJudge], this.code).subscribe(() => console.log('start Game with set judge'));
      this.afs.okSend(this.code, this.players);
      this.afs.drawHands(this.users.length, this.code).pipe(
        take(1)).subscribe(hands => {
          const ok = this.users.map(player => player.name);
          this.afs.dealHands(hands, ok, this.code);
        });
    }

    this.afs.getJudge(this.code).subscribe(j => {
      this.judgeName = j.judgeName;
      if (j.ready) {
        this.ready = true;
        this.bCard = j.blackCard.text.replace('_', '_____');
        this.winner = '';
        this.wCard = '';
        if (j.whiteCards !== undefined) {
          console.log('white cards in');

          if (Object.keys(j.whiteCards).length === (this.players.length - 1)) {
            console.log('white cards` in and players in');
            this.afs.allIn(this.code).catch(err => console.error(err));
          }
        }
        if (j.done && this.newJudge) {
          this.currentJudge += 1;
          if (this.currentJudge > (this.players.length - 1)) {
            this.currentJudge = 0;
          }

          this.newJudge = false;
          this.afs.setJudge(this.players[this.currentJudge], this.code).subscribe(() => {
            console.log('start another Game with set judge');
            this.wCard = j.winner.text;
            this.winner = j.winner.playerName;
            this.newJudge = true;
          });
          this.afs.okSend(this.code, this.players);
        }
      }

    });

    localStorage.setItem(`started:${this.code}`, 'true');
    this.started = true;
  }

  endGame() {
    this.afs.endGame(this.code).then(() => {
      this.router.navigateByUrl('/');
    });
    this.started = false;
  }

  nextCard() {
    this.afs.setJudge(this.players[this.currentJudge], this.code, true).subscribe(() => console.log('Next Card'));
    this.afs.okSend(this.code, this.players);
  }

}
