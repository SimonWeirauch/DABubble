import { Injectable, inject, OnInit, Component } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot, getDoc } from '@angular/fire/firestore';
import { DocumentReference, getDocs, query, where } from "firebase/firestore";
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.class';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import { Conversation } from '../models/conversation.class';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './shared-services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  loggedUser: User;
  firestore: Firestore = inject(Firestore)
  dataBase = inject(DatabaseService);
  userCache: User;
  wrongLogin: boolean = false;
  resetUserPw: any;
  guest: boolean = false;
  guestData: User;
  userToken: string;
  pwCache: string = '';
  deviceMobileWidth: number = window.innerWidth;
  private baseUrl = 'http://localhost:4200';

  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];
  activeUserOwnConversation: Conversation;

  activeUserObject: User;
  isWorkspaceDataLoaded: boolean = true;
  deviceWidth: number;


  constructor(private http: HttpClient, private router: Router, public database: DatabaseService) { 
    this.isWorkspaceDataLoaded = false,
    setTimeout(() => {
      if(this.loggedUser){
          this.loadActiveUserChannels();
          this.loadActiveUserConversations();
        }
    }, 1000);
  }


  /**
   * Function for changing some user data
   * @param currentMail actually used email
   * @param newEmail new Email that was entered by the user
   * @param newName provided name
   * @param avatar
   * @returns Promise<any>
   */
  changeEmail(currentMail: string, newEmail: string, newName: string, avatar: string | undefined | null): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');

      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['email'] === currentMail) {
            const userDocRef = doc(this.firestore, "users", userData['userId']);
            updateDoc(userDocRef, {
              email: newEmail,
              name: newName,
              avatarUrl: avatar
            });
            return resolve(userData);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
   * Function for changing the user's name
   * @param newName The new name to be set for the user
   * @param uid The unique identifier of the user
   * @returns Promise<any>
 */
  changeUserName(newName: string, uid: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');
      const userQuery = query(usersCollection, where('uid', '==', uid));

      getDocs(userQuery).then(snapshot => {
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const userDocRef = doc(this.firestore, "users", userDoc.id);
          
          updateDoc(userDocRef, {
            name: newName,
          }).then(() => {
            resolve(newName);
          }).catch(error => {
            console.error('Error updating user name:', error);
            reject(error);
          });
        } else {
          reject('No user found with this uid.');
        }
      }).catch(error => {
        console.error('Error fetching user document:', error);
        reject(error);
      });
    });
  }


  /**
   * Function for changing the user's avatar
   * @param avatar The new avatar to be set for the user
   * @param token The token used to identify the user
   * @returns Promise<any>
   */
  changeAvatar(avatar: string | undefined | null, token: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');

      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['uid'] === token) {
            const userDocRef = doc(this.firestore, "users", userData['userId']);
            updateDoc(userDocRef, {
              avatarUrl: avatar
            });
            resolve(avatar);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }


  // /**
  //  * Function for creating and saving a user
  //  */
  // createAndSaveUser() {
  //   this.userCache['uid'] = this.userToken;
  //   this.addUser(this.userCache);
  //   setTimeout(() => {
  //     this.database.getUser(this.userCache.email)
  //       .then(user =>{
  //         this.database.addConversation(this.database.createConversation(user.userId, user.userId));
  //         this.userToken = '';
  //       })
  //   }, 1000);
  // }

  async createAndSaveUser() {
    try {
      this.userCache['uid'] = this.userToken;  //Für Login? TODO  
      const userRef = await this.addUser(this.userCache);
      const userId = userRef.id;
      this.userCache.userId = userId;
      await this.pushUserId(userId);

      // Create own conversation for the user
      const conversation = this.database.createConversation(userId, userId);
      await this.database.addConversation(conversation);

      this.userToken = '';
      return this.userCache;
    } catch (error) {
      console.error('Error in createAndSaveUser:', error);
      throw error;
    }
  }




  /**
   * Function for creating and saving a guest user
   */
  createAndSaveGuest() {
    this.guestData.uid = this.userToken;
    this.addUser(this.guestData);
    setTimeout(() => {
      this.database.getUser(this.guestData.email)
        .then(user =>{
          this.database.addConversation(this.database.createConversation(user.userId, user.userId));
          this.userToken = '';
        })
    }, 1000);
  }

  
  /**
   * Function for uploading a file
   * @param file The file to be uploaded
   * @returns Observable<HttpEvent<any>>
   */
  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      responseType: 'json'
    });
    return this.http.request(req);
  }


  /**
   * Function for getting files from the server
   * @returns Observable<any>
   */
  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }


  /**
   * Check if useraccount exist, and create one if user not registered
   * @param email entered email
   * @param myForm data that was entered by the user
   */
  async checkEmail(email: string, myForm: FormGroup): Promise<void> {
    try {
      const q = query(collection(this.firestore, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty && myForm.valid) {
          const formValues = myForm.value;
          const newUser = new User({
            email: formValues.mail,
            name: formValues.name,
            status: 'offline',
            avatarUrl: '',
            userId: '',
            uid: null,
          });
          this.userCache = newUser;
          this.pwCache = formValues.pw;
          this.router.navigate(['/choosingAvatar']);
      } else {
        querySnapshot.forEach((doc) => {
          alert('Die angegebene email adresse, existiert bereits')
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Dokumente:', error);
    }
  }


  /**
   * Function for changing the user's password
   * @param id The user ID
   * @param pw The new password to be set
   */
  changePassword(id: string, pw: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      password: pw
    });
  }


  /**
 * Function to set a user's status as online
 * @param id The user ID
 */
  userOnline(id: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      status: "online"
    });
  }


  /**
 * Function to set a user's status as offline
 * @param id The user ID
 */
  userOffline(id: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      status: "offline"
    });
  }


  /**
 * Function for adding a user to the database
 * @param user The user object to be added
 */
  // addUser(user: User) {
  //   addDoc(collection(this.firestore, 'users'), user.toJSON())
  //   .then((data) => {
  //     this.pushUserId(data.id);
  //   })
  //   // .catch((error) => console.error('Fehler beim Hinzufügen des Benutzers:', error));
  // }

  addUser(user: User): Promise<DocumentReference> {
    return addDoc(collection(this.firestore, 'users'), user.toJSON());
  }


  /**
 * Function for updating the user's ID in the database
 * @param id The user ID to be updated
 */
  pushUserId(id: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      userId: id
    });
  }


  /**
 * Function to get a user after Google authentication
 * @param email The user's email
 * @param token The authentication token
 * @returns Promise<User | null>
 */
  getUserAfterGoogleAuth(email: string, token: string): Promise<User | null> {
    return new Promise<User | null>((resolve, reject) => {
        const usersCollection = collection(this.firestore, 'users');
        let foundUser: User | null = null;

        onSnapshot(usersCollection, (users) => {
            users.forEach(user => {
                const userData = user.data();

                if (userData['email'] === email && userData['uid'] === token) {
                    foundUser = new User({
                        email: userData['email'],
                        name: userData['name'],
                        status: userData['status'],
                        avatarUrl: userData['avatarUrl'],
                        userId: user.id,
                        logIn: userData['logIn'],
                        usedLastTwoEmojis: userData['usedLastTwoEmojis'],
                        uid: userData['uid']
                    });
                }
            });

            if (foundUser) {
                resolve(foundUser);
            } else {
                resolve(null); // Anstatt ein Fehler zurückzugeben, löse null auf
            }
        }, (error) => {
            reject(error); // Falls es einen Fehler bei der Datenbankabfrage gibt
        });
    });
}


/**
 * Function to get a user based on email and token
 * @param email The user's email
 * @param token The authentication token
 * @returns Promise<User>
 */
  getUser(email: string, token: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');
      this.wrongLogin = true; // Setze standardmäßig auf true, bis ein gültiger Benutzer gefunden wird
  
      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['email'] === email && userData['uid'] === token) {
            const activeUser = new User({
              email: userData['email'],
              name: userData['name'],
              status: userData['status'],
              avatarUrl: userData['avatarUrl'],
              userId: user.id,
              logIn: userData['logIn'],
              usedLastTwoEmojis: userData['usedLastTwoEmojis'],
              uid: userData['uid']
            });
            this.wrongLogin = false; // Setze auf false, da gültiger Benutzer gefunden wurde
            resolve(activeUser);
          }
        });
        // Wenn nach Durchlauf der Benutzer keine Übereinstimmung gefunden wurde
        if (this.wrongLogin) {
          reject('User not found or wrong credentials');
        }
      }, (error) => {
        reject(error);
      });
    });
  }


  /**
 * Function to load all users from the database
 * @returns Promise<Array<any>>
 */
  loadAllUsers(): Promise<Array<any>>{
    return new Promise<Array<any>>((resolve, reject) =>{
      const userList = [] as Array<any>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          userData['id'] = user.id; 
          userList.push(userData);
          resolve(userList);
        })
        }, (error) => {
          reject(error)
        })
    })
  }


  /**
   * loads all channels for the active user
   */
  loadActiveUserChannels(){

    this.activeUserChannels = [];
    this.isWorkspaceDataLoaded = false;
    this.database.getUser(this.loggedUser.email).then(user =>{
      this.activeUserObject = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        this.activeUserChannels = userChannels
      });
    })
  }


  /**
 * Function to load active user conversations
 */
  loadActiveUserConversations() {
    this.isWorkspaceDataLoaded = false;
    this.activeUserConversationList = [];
    this.usersFromActiveUserConversationList = [];

    this.database.getUser(this.loggedUser.email).then(user => {
      this.database.loadAllUserConversations(user.userId)
        .then(userConversations => {
          const promises = userConversations.map(conversation => {
            this.activeUserConversationList.push(conversation);
            const userPromise = conversation.createdBy === user.userId
              ? this.getUserRecievedBy(conversation)
              : this.getUserCreatedBy(conversation);
  
            return userPromise.then(() => {
              this.checkOwnConversation(this.activeUserConversationList);
            }).then(() => {
              if (conversation.createdBy === this.activeUserObject.userId &&
                  conversation.recipientId === this.activeUserObject.userId) {
                  this.activeUserOwnConversation = conversation;
              }
            });
          });
          return Promise.all(promises);
        })
        .then(() => {
          
          // this.database.loadSpecificUserConversation(this.activeUserObject.userId, this.activeUserOwnConversation.conversationId)
          //   .then((conversation => {
          //     this.activeUserOwnConversation = conversation
          //     this.isWorkspaceDataLoaded = true;
          //   }))
          if (this.activeUserOwnConversation && this.activeUserOwnConversation.conversationId) {
            return this.database.loadSpecificUserConversation(this.activeUserObject.userId, this.activeUserOwnConversation.conversationId);
          } else {
            console.warn('No own conversation found for user');
            return null;
          }
        })
        .then((conversation) => {
          if (conversation) {
            this.activeUserOwnConversation = conversation;
          }
          this.isWorkspaceDataLoaded = true;
        })
        .catch(error => {
          console.error('Error in loadActiveUserConversations:', error);
          this.isWorkspaceDataLoaded = true;
        });
    });
  }


  /**
   * searches the conversation list and looks for the own conversation with the
   * active user
   * @param conversationList conversationlist
   */
  checkOwnConversation(conversationList: Conversation[]){
    conversationList.forEach(conversation => {
      if(conversation.createdBy == this.activeUserObject.userId && conversation.recipientId == this.activeUserObject.userId){
        this.activeUserConversationList.splice(this.activeUserConversationList.indexOf(conversation), 1);
      }
    });
    this.usersFromActiveUserConversationList.forEach(user => {
      if(user.userId == this.activeUserObject.userId){
        this.usersFromActiveUserConversationList.splice(this.usersFromActiveUserConversationList.indexOf(user), 1);
      }
    })
  }


  /**
   * loads a user from the database based on the creator
   * of the current conversation
   * @param conversation conversationobject
   * @returns userobject
   */
  getUserCreatedBy(conversation: Conversation): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      this.database.loadUser(conversation.createdBy)
      .then(loadedUser => {
        this.usersFromActiveUserConversationList.push(loadedUser);
        resolve(loadedUser)
      },
      (error) =>{
        reject(error)
      }
    )
    })
  }


  /**
   * loads a user from the database based on the recipient
   * of the current conversation
   * @param conversation conversationobject
   * @returns userobject
  */
  getUserRecievedBy(conversation: Conversation): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      this.database.loadUser(conversation.recipientId)
      .then(loadedUser => {
        this.usersFromActiveUserConversationList.push(loadedUser);
        resolve(loadedUser)
      },
      (error) =>{
        reject(error)
      }
    )
    })
  }


  /**
   * gehts the width of the current device
   */
  getDeviceWidth(){
    this.deviceWidth = window.innerWidth;
  }


}