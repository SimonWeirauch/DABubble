import { ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp } from "firebase/app";
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {provideFirebaseApp } from '@angular/fire/app';
import * as firebaseConfig from '../assets/firebaseConfig.json';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import {AngularFireModule} from '@angular/fire/compat'
import {AngularFireAuthModule} from '@angular/fire/compat/auth'
import { GoogleAuthProvider } from 'firebase/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAuth, getAuth } from '@angular/fire/auth';



export const appConfig: ApplicationConfig = {

  providers: [provideHttpClient(), provideRouter(routes), provideFirebaseApp(() => 
    initializeApp(
      { "projectId": firebaseConfig.projectId,
        "appId":firebaseConfig.appId,
        "storageBucket":firebaseConfig.storageBucket,
        "apiKey":firebaseConfig.apiKey,
        "authDomain":firebaseConfig.authDomain,
        "messagingSenderId":firebaseConfig.messagingSenderId
      })),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()), provideAnimationsAsync(),

      provideStorage(() => getStorage()),
  ]
};
