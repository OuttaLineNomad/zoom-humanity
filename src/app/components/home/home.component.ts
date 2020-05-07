import { Component, OnInit } from '@angular/core';
import { transition, trigger, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { FirebaseService } from 'src/app/service/firebase.service';

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
    nn: 'Naughty Nataly Edition'
  };

  isMobile: boolean;

  constructor(
    private route: ActivatedRoute,
    private afs: FirebaseService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const idk = this.titles[params.id];

      this.edition = idk ? idk : params.id;
    });


    this.isMobile = this.afs.isMobileDevice(navigator.userAgent);
    if (this.isMobile) {
      this.router.navigateByUrl(`/mobile/${this.edition}`);
    }
  }

  playGame() {
    const code = this.makeRandom();
    this.afs.createGame(code).subscribe(resp => {
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

}
