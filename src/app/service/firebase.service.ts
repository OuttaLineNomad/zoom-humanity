import { Injectable, ɵPlayerHandler } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, mergeMap, take } from 'rxjs/operators';
import { Observable, Subject, of, forkJoin } from 'rxjs';
import { all } from '../decks';
import { HandCards } from '../components/mobile/mobile.component';


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
  whiteCards: PlayersWhiteCard[];
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

  // Create game from a computer screen
  createGame(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.object<Decks>(`/decks`).valueChanges().pipe(
      map(f => {
        return { whiteCards: f.whiteCards, blackCards: f.blackCards.filter(card => card.pick === 1) };
      }),
      mergeMap(decks => {
        const game = {
          decks,
          game: true
        }
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

    const setWhiteCard = this.af.object<PlayersWhiteCard[]>(`${this.basePath}/judge/whiteCards`).valueChanges()
      .pipe(
        take(1),
        map(data => {
          if (data === null) {
            data = [];
          }
          data.push(whiteCard);
          return this.af.object<PlayersWhiteCard[]>(`${this.basePath}/judge/whiteCards`).set(data);
        }));

    return setWhiteCard;
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

        return this.af.object<Judge>(`${this.basePath}/judge`).set(judge);
      })
    );
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

      this.af.object<boolean>(`${this.basePath}/players/${p}/send`).set(true)
        .then(() => console.log('can send ==', p)).catch(err => {
          console.log(err);
        });
    }
  }

  sendWinner(winner: HandCards, text: string, code: string) {
    this.basePath = `/games/${code}`;

    this.af.object(`${this.basePath}/judge/winner`).set(winner).then(() => {
      this.af.object(`${this.basePath}/judge/done`).set(true).catch(err => {
        console.log(err);
      });
    }).catch(err => {
      console.log(err);
    });

    return this.af.list<Partial<BlackCard>>(`${this.basePath}/players/${winner.playerName}/blackCards`)
      .push({ text })
      .then(() => console.log('set winner'));
  }

  drawCard(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.list<string>(`${this.basePath}/decks/whiteCards`).valueChanges().pipe(
      take(1),
      map(cards => {
        const randI = Math.floor(Math.random() * cards.length);
        const card = cards.splice(randI, 1);
        this.reSetWhiteCards(code, cards);
        return card[0];
      }));
  }

  setHand(hand: string[], code: string, name: string) {
    this.basePath = `/games/${code}`;
    console.log(`${this.basePath}/players/${name}/whiteCards`);

    const setPlyerHand = this.af.object<string[]>(`${this.basePath}/players/${name}/whiteCards`).set(hand)
      .catch(err => console.error(err));
    return setPlyerHand;
  }

  reSetWhiteCards(code: string, hands: string[]) {
    this.basePath = `/games/${code}`;
    return this.af.object<string[]>(`${this.basePath}/decks/whiteCards`).set(hands).catch(err => console.log(err));
  }

  drawBlackCard(code: string) {
    this.basePath = `/games/${code}`;
    return this.af.list<BlackCard>(`${this.basePath}/decks/blackCards`).valueChanges().pipe(
      take(1),
      map(cards => {
        const randI = Math.floor(Math.random() * cards.length);
        const card = cards.splice(randI, 1);
        return card[0];
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
          console.log('oneHand ==', hand);

          hands.push(hand);
        }
        console.log(hands);

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


}
