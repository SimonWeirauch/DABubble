import { Injectable } from '@angular/core';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class TimeFormatingService {

  constructor() { }

  /**
   * formating timestamp into date
   * @param timestamp time from firebase databse
   * @returns 
   */
  formatTimestamp(timestamp: Timestamp): Date {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return new Date(date)
  }

  /**
   * formating hours and minuts from date
   * @param date time from formatTimestamp function 
   * @returns 
   */
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * formating days and months from date
   * @param date time from formatTimestamp function 
   * @returns 
   */
  formatDate(date: Date): string {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];

    return `${dayName}, ${day} ${monthName}`;
  }
}
