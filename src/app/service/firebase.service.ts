import { Injectable, ɵPlayerHandler } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, mergeMap, take } from 'rxjs/operators';
import { Observable, Subject, of, forkJoin } from 'rxjs';
import { all } from '../decks';
import { HandCards } from '../components/mobile/mobile.component';
import { AttachSession } from 'protractor/built/driverProviders';


export interface BlackCard {
  text: string;
  pick: number;
}

export interface Box {
  name: string;
  black: number[];
  white: number[];
  icon: number;
}

export interface Decks {
  blackCards: BlackCard[];
  whiteCards: string[];
}

export interface PlayersWhiteCard {
  whiteCard: string;
  player: string;
}

export interface Judge {
  blackCard: BlackCard;
  whiteCards: { [key: string]: PlayersWhiteCard }[];
  judgeName: string;
  allIn: boolean;
  done: boolean;
  ready: boolean;
  winner: HandCards;
}

export interface Player {
  playerName: string;
  whiteCards?: string[];
  blackCards?: { [key: string]: BlackCard };
  score?: number;
  send?: boolean;
  judge?: boolean;
}

export interface Players {
  [key: string]: Player;
}

export interface Game {
  decks: Decks;
  players: Players;
  judge: Judge;
  discard: Decks;
}


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  userPath: string;
  basePath: string;
  username: string;

  constructor(
    private af: AngularFireDatabase,
  ) {
  }

  isMobileDevice(userAgent: string): boolean {
    return /Android|iP(hone|od|ad)|Opera Mini|IEMobile/i.test(userAgent);
  }

  getDeckCount(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.list<BlackCard>(`${this.basePath}/decks/whiteCards`).valueChanges();
  }
  // Create game from a computer screen
  createGame(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.object<Decks>(`/decks`).valueChanges().pipe(
      map(f => {
        return {
          whiteCards: f.whiteCards.filter((card, index) => {
            return f.whiteCards.indexOf(card) === index;
          }), blackCards: f.blackCards.filter((card, index) => {
            return card.pick === 1 && f.blackCards.indexOf(card) === index;
          })
        };
      }),
      mergeMap(decks => {
        console.log('decks ========', decks);
        const game = {
          decks,
          game: true
        };
        return this.af.object(`/games/${code}`).set(game);
      })
    );
  }


  // addPlayer adds player to realtime database.
  addPlayer(name: string, code: string) {
    this.basePath = `/games/${code}`;
    this.userPath = `${this.basePath}/players/${name}`;

    return this.af.object<Player>(this.userPath).valueChanges().pipe(
      take(1),
      mergeMap(player => {
        if (player === null) {
          const newPlayer: Player = {
            playerName: name,
            blackCards: {},
            score: 0,
            send: false,
            judge: false,
            whiteCards: ['Wait for for cards to be dealt or next round to start.']
          };
          return this.af.object<Player>(this.userPath).set(newPlayer).then(() => {
            return true;
          });
        }
        return of(false);
      }));
  }

  // This is to first populate the database, only need to do this once.
  setDecks() {
    this.af.object('/decks').set(all);
  }

  // get player from firebase
  getPlayer(code: string, name: string): Observable<Player> {
    this.basePath = `/games/${code}`;
    this.userPath = `${this.basePath}/players/${name}`;
    return this.af.object<Player>(this.userPath).valueChanges();
  }

  sendCard(card: string, code: string, name: string) {
    this.basePath = `/games/${code}`;
    const whiteCard: PlayersWhiteCard = {
      player: name,
      whiteCard: card
    };

    return this.af.object<boolean>(`${this.basePath}/players/${name}/send`).set(true).then(() => {
      this.af.list<PlayersWhiteCard>(`${this.basePath}/judge/whiteCards`).push(whiteCard).catch(err => console.error(err));
    }).catch(err => console.error(err));
  }

  getJudge(code: string): Observable<Judge> {
    this.basePath = `/games/${code}`;
    return this.af.object<Judge>(`${this.basePath}/judge`).valueChanges();
  }

  verify(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.object<Judge>(`${this.basePath}/game`).valueChanges();
  }

  setJudge(name: string, code: string, ready: boolean = false) {
    this.basePath = `/games/${code}`;
    return this.drawBlackCard(code).pipe(
      take(1),
      mergeMap(bCard => {
        const judge: Judge = {
          blackCard: bCard,
          judgeName: name,
          whiteCards: [],
          allIn: false,
          done: false,
          ready,
          winner: null
        };
        console.log('set judge =', judge);

        return this.af.object<Judge>(`${this.basePath}/judge`).set(judge).then(() => {
          this.playerJudge(name, code).then(() => {
            console.log(name, 'This is cool');
          });
        });
      })
    );
  }

  playerJudge(name: string, code: string) {
    this.basePath = `/games/${code}`;
    return this.af.object(`${this.basePath}/players/${name}/judge`).set(true).catch(err => console.error(err));
  }

  allIn(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.object(`${this.basePath}/judge/allIn`).set(true).catch(e => console.log(e));
  }

  ready(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.object(`${this.basePath}/judge/ready`).set(true).catch(e => console.log(e));
  }

  okSend(code: string, players: string[]) {
    this.basePath = `/games/${code}`;
    for (const p of players) {
      console.log('players ==', p);

      this.af.object<boolean>(`${this.basePath}/players/${p}/send`).set(false)
        .then(() => console.log('can send ==', p)).catch(err => {
          console.log(err);
        });
    }
  }

  sendWinner(winner: HandCards, text: string, code: string, judgeName: string) {
    this.basePath = `/games/${code}`;

    this.af.object(`${this.basePath}/players/${judgeName}/judge`).set(false).then(() => {
      console.log(`${judgeName} == set to false`);

    }).catch(err => console.error(err));

    return this.af.object<Judge>(`${this.basePath}/judge`).update({ winner, done: true }).then(() => {
      return this.af.list<Partial<BlackCard>>(`${this.basePath}/players/${winner.playerName}/blackCards`)
        .push({ text })
        .then(() => console.log('set winner'));
    }).catch(err => console.error(err));
  }

  drawCard(code: string, amt: number) {
    this.basePath = `/games/${code}`;
    return this.af.list<string>(`${this.basePath}/decks/whiteCards`).snapshotChanges().pipe(
      take(1),
      map(cards => {
        const newHand = [];
        for (let i = 0; i < amt; i++) {
          const randI = Math.floor(Math.random() * cards.length);
          const card = cards.splice(randI, 1);

          this.af.list<string>(`${this.basePath}/decks/whiteCards`).remove(card[0].key).catch(err => {
            console.error(err);
          });

          newHand.push(card[0].payload.val());
        }

        return newHand;
      }));
  }

  setHand(hand: string[], code: string, name: string) {
    this.basePath = `/games/${code}`;
    console.log(`${this.basePath}/players/${name}/whiteCards`);

    const setPlyerHand = this.af.object<string[]>(`${this.basePath}/players/${name}/whiteCards`).set(hand)
      .catch(err => console.error(err));
    return setPlyerHand;
  }

  resetMyCards(code: string, name: string) {

  }

  reSetWhiteCards(code: string, cards: string[]) {
    this.basePath = `/games/${code}`;
    return this.af.object<string[]>(`${this.basePath}/decks/whiteCards`).set(cards).catch(err => console.log(err));
  }

  drawBlackCard(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.list<BlackCard>(`${this.basePath}/decks/blackCards`).snapshotChanges().pipe(
      take(1),
      map(cards => {
        const randI = Math.floor(Math.random() * cards.length);
        const card = cards.splice(randI, 1);

        this.af.list<BlackCard>(`${this.basePath}/decks/blackCards`).remove(card[0].key).catch(err => {
          console.error(err);
        });
        return card[0].payload.val();
      }));
  }

  drawHands(numOfHands: number, code: string): Observable<string[][]> {
    this.basePath = `/games/${code}`;
    return this.af.list<string>(`/games/${code}/decks/whiteCards`).valueChanges().pipe(
      take(1),
      map(cards => {
        console.log('cards ==', numOfHands);

        const hands: string[][] = [[]];
        for (let i = 0; i < numOfHands; i++) {
          const hand: string[] = [];
          for (let j = 0; j < 5; j++) {
            const randI = Math.floor(Math.random() * cards.length);
            const card = cards.splice(randI, 1);
            hand.push(card[0]);
          }
          hands.push(hand);
        }

        this.reSetWhiteCards(code, cards);

        return hands;
      }));
  }

  dealHands(hands: string[][], players: string[], code: string) {
    this.basePath = `/games/${code}`;
    hands.shift();
    if (hands.length !== players.length) {
      console.log('need same amount of hands as players');
      return;
    }

    console.log('dalHand players ==', players);

    for (const p of players) {
      console.log('players ==', p);

      this.af.object<string[]>(`${this.basePath}/players/${p}/whiteCards`)
        .set(hands.pop()).then(() => console.log('all ok ==', p)).catch(err => {
          console.log(err);
        });
    }
  }

  getPlayers(code: string): Observable<Player[]> {
    this.basePath = `/games/${code}`;
    console.log(`${this.basePath}/players`);

    return this.af.list<Player>(`${this.basePath}/players`).valueChanges();
  }

  endGame(code: string): Promise<void> {
    this.basePath = `/games/${code}`;
    return this.af.object(this.basePath).remove();
  }

  test() {
    this.af.list(`test`).push('cool');
  }

  testGet(code) {
    this.basePath = `/games/${code}`;
    return this.af.list<BlackCard>(`${this.basePath}/decks/blackCards`).snapshotChanges()
      .pipe(map(items => {
                 // <== new way of chaining
        return items.map(a => {
          const data = a.payload.val();
          const key = a.payload.key;
          return { key, data };           // or {key, ...data} in case data is Obj
        });
      }));
    }

}
