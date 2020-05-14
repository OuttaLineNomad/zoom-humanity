import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { FirebaseService } from 'src/app/service/firebase.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
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
export class WelcomeComponent implements OnInit {
  name: string;
  code: string;
  msg: string;
  signedIn = false;

  constructor(
    private route: ActivatedRoute,
    private afs: FirebaseService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      if (params.id === undefined) {
        params.id = '';
      }
      this.code = params.id;
      this.name = localStorage.getItem(`player:${params.id}`);

      if (this.name !== null) {
        console.log('I am signed in');
        this.signedIn = true;
      }
    });

  }

  playGame(form: NgForm) {
    if (form.invalid) {
      this.msg = 'Are you kidding me! There are only two fields to fill out!';
      return;
    }
    this.afs.verify(this.code).subscribe(val => {
      if (val !== null) {
        this.afs.addPlayer(this.name, this.code).subscribe(resp => {
          localStorage.setItem(`player:${this.code}`, this.name);
          this.signedIn = true;
          console.log('new user ', resp);
          return;
        });
      }
      this.msg = 'I guess your "friends" gave you the wrong code.';
    });
  }
}
