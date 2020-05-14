import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() { }

  isMobileDevice(userAgent: string): boolean {
    return /Android|iP(hone|od|ad)|Opera Mini|IEMobile/i.test(userAgent);
  }
}
