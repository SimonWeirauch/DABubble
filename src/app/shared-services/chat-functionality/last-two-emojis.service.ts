import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, onSnapshot } from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LastTwoEmojisService {

  private firestore: Firestore;
   private userEmojisSubject: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);

  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  /**
   * Updates the last two used emojis 
   * @param userId User Id of a user whos used last two emijos needs to be watched
   * @returns 
   */
  watchUserEmojis(userId: string): Observable<Array<string>> {
    const userDocRef = doc(this.firestore, 'users', userId);
    onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.userEmojisSubject.next(data['usedLastTwoEmojis'] || []);
      }
    });
    return this.userEmojisSubject.asObservable();
  }
}
