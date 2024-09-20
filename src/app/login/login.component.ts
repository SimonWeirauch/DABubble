import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgStyle, NgClass, FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  checkLoginData: boolean = false;
  falseLoginAnimation: boolean = false;
  borderAnimation: boolean = false;
  invalidMail: boolean = false;
  invalidPassword: boolean = false;
  intro = true;
  switchlogo = false;
  textVisible = false;
  navLogoAnimation = false;
  authService = inject(AuthService);
  errorMessage: string | null = null;
  authMessage: boolean | null = false;
  hub = inject(UserService)
  isPressed = false;
  myForm: FormGroup;
  guestPw: string = 'guest123';
  guestLog: User = new User({
    email: 'guest@mail.com',
    name: 'John Doe',
    status: 'offline',
    avatarUrl: '../../assets/img/unUsedDefault.png',
    userId: '',
    logIn: 'https://bubble.ishakates.com/',
    usedLastTwoEmojis: ['✅', '🙌'],
    uid: null
  });

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    this.hub.guestData = this.guestLog;
    this.us.wrongLogin = false;
    this.checkLoginData = false;
    this.myForm = this.fb.group({
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
    });
  }


  /**
 * Initialization function
 */
  ngOnInit(): void {
    setTimeout(() => {
      this.switchlogo = true;
      setTimeout(() => {
        this.textVisible = true;
        setTimeout(() => {
          this.intro = false;
          this.navLogoAnimation = true;
        }, 1000);
      }, 1000);
    }, 125);
  }

  
  /**
 * Asynchronous function to handle form submission
 */
  async onSubmit() {
    if (this.us.guest) {
      this.myForm.setValue({
        pw: this.guestPw,
        mail: this.guestLog.email
      });
      await this.signIn();
    } else {
      await this.signIn(); 
    }
  }


  /**
 * Function to initiate Google authentication
 */
  googleAuthentification() {
    this.authService.googleAuth();
  }


  /**
 * Function to perform guest login
 */
  guestLogin() {
    this.us.guest = true;
    this.onSubmit()
  }


  /**
 * Asynchronous function to sign in
 */
  async signIn() {
    if (this.us.guest) {
      try {
        this.authAsGuest();
      } catch (error) {
        // console.log('Kein Gastbenutzer gefunden, erstelle neuen Gastbenutzer');
        this.authService.register(this.guestLog.email, this.guestLog.name, this.guestPw);
      }
    } else {
      this.acceptedAuth(); 
    }
  }


  /**
 * Function to authenticate as a guest user.
 * Attempts to login using the provided email and password.
 * If successful, logs the correct user.
 * If an error occurs, sets the error message and registers a new guest user with the provided credentials.
 */
  authAsGuest() {
    this.authService
      .login(this.myForm.value.mail, this.myForm.value.pw)
      .subscribe({
        next: () => {
        this.logCorrectUser();
      },
      error: (err) => {
        this.errorMessage = err.code;
        this.authService.register(this.guestLog.email, this.guestLog.name, this.guestPw);
      },
    });
  }


/**
 * Function to handle accepted authentication.
 */
  acceptedAuth() {
    this.authService
      .login(this.myForm.value.mail, this.myForm.value.pw)
      .subscribe({
        next: () => {
        this.logCorrectUser();
      },
      error: (err) => {
        this.errorMessage = err.code;
        this.errorMessage = this.errorMessage ? this.errorMessage.split(/\//)[1] || '' : '';
        this.checkLoginData = true;
        this.errorEvaluation();
        console.log(this.errorMessage);
      },
    });
  }


  /**
 * Function to evaluate errors during authentication.
 */
  errorEvaluation() {
    if (this.checkLoginData) {
      this.borderAnimation = true;
        if (this.errorMessage === 'invalid-email' || this.errorMessage === 'user-not-found') {
          this.invalidMail = true;
        }
        if (this.errorMessage === 'wrong-password') {
          this.invalidPassword = true;
        }
        if (this.errorMessage === 'too-many-requests') {
          alert('Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.')
        }
      this.invalidLogAnimation();
    }
  }


  /**
 * Function to handle invalid login animation.
 */
  invalidLogAnimation() {
    setTimeout(() => {
      this.borderAnimation = false;
      this.falseLoginAnimation = true;
      setTimeout(() => {
        this.falseLoginAnimation = false;
        this.checkLoginData = false;
        this.invalidMail = false;
        this.invalidPassword = false;
      }, 1000)
    }, 2000)
  }


  /**
 * Asynchronous function to log the correct user.
 * Retrieves the accepted user based on the provided email and user token.
 * Updates user information and navigates to the main page if user is valid.
 * If error occurs during user retrieval, logs the error message.
 */
  async logCorrectUser() {
    const acceptedUser = await this.us.getUser(this.myForm.value.mail, this.us.userToken);
    if (this.myForm.valid && acceptedUser || this.authMessage) {
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
    } else {
      this.us.userToken = '';
    }
  }


  /**
 * Function to handle mouse down event
 */
  onMouseDown() {
    this.isPressed = true;
  }


  /**
 * Function to handle mouse up event
 */
  onMouseUp() {
    this.isPressed = false;
  }

}
