import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, user, updateProfile, sendEmailVerification } from '@angular/fire/auth';
import { catchError, EMPTY, from, Observable, tap } from 'rxjs';
import { EmailAuthProvider, getAuth, onAuthStateChanged, UserCredential, reauthenticateWithCredential, AuthProvider, getAdditionalUserInfo } from "firebase/auth";
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { signInWithRedirect, getRedirectResult, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  us = inject(UserService);
  errorMessage: string | null = null;
  activeUser? = user(this.firebaseAuth);
  currentUserSignal = signal<User | null | undefined>(undefined);
  wrongEmail = false;
  infos: any ;
  

  constructor(private router: Router) {
    // console.log('googleInfos', this.infos);
    // console.log('observ', this.activeUser);
  }


  /**
   * Function to change some user data on firebase
   * @param email actually email
   * @param newEmail entered new Email by the user
   * @param currentPassword current Password entered by the user
   * @param name provided name
   * @param avatar provided avatar url
   */
  async changeUserData(email: string, newEmail: string, currentPassword: string | null, name: string, avatar: string | undefined | null) {
    const auth = this.firebaseAuth;
    const fbUser = auth.currentUser;
      try {
        if (fbUser) {
          if (newEmail !== fbUser.email && currentPassword) {
            try {
              const credential = EmailAuthProvider.credential(email, currentPassword ?? '');
              await reauthenticateWithCredential(fbUser, credential);
              await updateEmail(fbUser, newEmail);
              await sendEmailVerification(fbUser);
              await this.us.changeEmail(email, newEmail, name, avatar)
              console.log(await this.us.changeEmail(email, newEmail, name, avatar));
            } catch (error) {
              this.wrongEmail = true;
            }
          }

          if (name !== fbUser.displayName) {
            await updateProfile(fbUser, { displayName: name });
            await this.us.changeUserName(name, fbUser.uid);
          }
          if (avatar !== fbUser.photoURL) {
            await this.us.changeAvatar(avatar, fbUser.uid);
          }
      } else {
        console.error('Current user or password is null');
      }
      } catch (error: any) {
        this.errorMessage = error.message;
      }
  }

  /**
   * function to provide google
   */
  googleAuth() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    this.getToken(provider);
  }


  /**
   * 
   * @param provider interface from google
   */
  getToken(provider: any) {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential: any = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        this.infos = result;
        // IdP data available using getAdditionalUserInfo(result)
        // console.log(user, token, getAdditionalUserInfo(result));
        this.handleUserAfterGoogleLogin(user);
      }).catch((error) => {
        // console.log(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }


  /**
   * get Data from Google and create a new User
   * @param user user information received by google
   */
  async handleUserAfterGoogleLogin(user: any) {
    const userDoc = await this.us.getUserAfterGoogleAuth(user.email!, user.uid);

    if (!userDoc) {
        this.us.userCache = new User();
        this.us.userCache.email = user.email;
        this.us.userCache.name = user.displayName;
        this.us.userCache.avatarUrl = user.photoURL;
        this.us.userToken = user.uid
        // Save user object to Firestore
        this.us.createAndSaveUser();
        const getUserAgain = await this.us.getUserAfterGoogleAuth(user.email!, user.uid);
        this.logGoogleUser(this.us.userCache);
    } else {
        this.logGoogleUser(userDoc);
    }
}


/**
 * Login with user that was created with google auth
 * @param acceptedUser 
 */
logGoogleUser(acceptedUser: User) {
  try {
    this.us.loggedUser = acceptedUser;
    this.us.loadActiveUserChannels();
    this.us.loadActiveUserConversations();
    this.us.userOnline(this.us.loggedUser.userId);
    this.router.navigate(['/main']);
    this.us.guest = false;
    this.us.userToken = '';
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
  }
}


/**
 * Register a new user in firebase authentication
 * @param email email address entered
 * @param username name entered
 * @param password password entered
 * @returns An Observable that resolves when the user is successfully created and profile updated.
 * @throws Will throw an error if user registration or profile update fails.
 */
register(email: string, username: string, password: string): Observable<void> {
  const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(response => {
      return updateProfile(response.user, {
        displayName: username,
        photoURL: this.us.userCache.avatarUrl
      }).then(() => {
        this.us.userToken = response.user.uid;
        if (this.us.guest) {
          this.us.createAndSaveGuest();
        }
      });
    })
    .catch((error) => {
      console.error('Error during registration:', error);
      throw error;
    });
  return from(promise);
}


/**
 * After Registreiting user in firebase authentication create an userobject in firestore with the function createAndSaveUser() or log an error
 */
authRegistration() {
  this.register(this.us.userCache.email, this.us.userCache.name, this.us.pwCache)
    .subscribe({
      next: () => {
        this.us.pwCache = '';
        this.us.createAndSaveUser();
      },
      error: (err) => {
        console.error('Error during registration:', err);
        this.errorMessage = err.code;
      }
    });
}


/**
 * This method log the user with the credentials and, upon successful login, stores the user's unique identifier (UID) in the service for further use.
 * @param email entered email
 * @param password entered password
 * @returns An Observable that resolves when the user has successfully signed in.
 */
  login(email: string, password: string,): Observable <void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password
    ).then((response) => {
      this.us.userToken = response.user.uid;
    });
    return from(promise);
  }


  /**
   * This method set the user in firestore offline, and logged him out
   * @returns An Observable that resolves, when the user is logged out and the status ist offline
   */
  logout(): Observable<void> {
    if(this.us.loggedUser){
      this.us.loggedUser.status = 'offline';
      this.us.userOffline(this.us.loggedUser.userId);
      const promise = signOut(this.firebaseAuth);
      return from(promise);
    }
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }


  /**
   * this method navigate to the login Component
   */
  redirectToLogin() {
    this.router.navigateByUrl('');
  }


/**
 * Checks the current user's authentication status using Firebase Authentication.
 * @returns  A boolean value indicating whether the user is authenticated or not. The method resolves `true` if the user is authenticated, otherwise `false`.
 */
  checkUserStatus(): boolean {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.us.getUser(user.email ?? '', user.uid).then((activeUser) => {
          this.us.loggedUser = activeUser;
          this.us.activeUserObject = activeUser;
          return true;
        }).catch((error) => {
          this.redirectToLogin();
          return false
        });
        return false;
      } else {
        this.redirectToLogin();
        return false;
      }
    });
    return false;
  }


}