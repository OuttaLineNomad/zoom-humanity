import { Component, OnInit } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { FirebaseService } from 'src/app/service/firebase.service';
import { Observable } from 'rxjs';
import { AngularFireAnalytics } from '@angular/fire/analytics';

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
  };

  test: Observable<string[]>;

  isMobile: boolean;

  constructor(
    private route: ActivatedRoute,
    private afs: FirebaseService,
    private analytics: AngularFireAnalytics,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const idk = this.titles[params.id];

      this.edition = idk ? idk : params.id;
      if (params.id) {
        if (!idk && params.id.length === 4) {
          this.router.navigateByUrl(`/mobile/${params.id}`);
        }
      }
    });

    this.isMobile = this.afs.isMobileDevice(navigator.userAgent);
    if (this.isMobile) {
      if (this.edition === undefined || this.edition === 'mobile') {
        return;
      }
      this.router.navigateByUrl(`/mobile/${this.edition}`);
    }
  }

  playGame() {
    this.analytics.logEvent('play game', { time: new Date() });
    if (this.isMobile) {
      this.router.navigateByUrl(`/mobile/`);
      return;
    }

    const code = this.makeRandom();
    this.afs.verify(code).pipe(take(1)).subscribe(val => {
      if (val === null) {
        this.afs.createGame(code).subscribe(() => {
          this.router.navigate(['screen', code]);
        });
      } else {
        alert('Something went wrong hit that play button one more time.');
      }

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

}
