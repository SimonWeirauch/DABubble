import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { sendPasswordResetEmail } from "firebase/auth";
import { getDocs, query, where } from "firebase/firestore";
import { Firestore, collection } from '@angular/fire/firestore';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-dialog-password-reset',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-password-reset.component.html',
  styleUrl: './dialog-password-reset.component.scss'
})
export class DialogPasswordResetComponent {
  http = inject(HttpClient);
  authService = inject(AuthService);
  firestore: Firestore = inject(Firestore)
  myForm: FormGroup;
  emailSent: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private us: UserService) {
    this.myForm = this.formBuilder.group({
      mail: ['', [Validators.required, Validators.email]],
    });
  }


  post = {
    endPoint: 'https://simon-weirauch.de/da-bubble/sendPwResetlink.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };


  onSubmit() {
    this.checkEmail(this.myForm.value.mail);
  }


  /**
 * Asynchronous function to check email and send password reset email
 * @param email The email to check
 * @returns Promise<void>
 */
  async checkEmail(email: string): Promise<void> {
    sendPasswordResetEmail(this.authService.firebaseAuth, email)
      .then(() => {
        this.emailSent = true;
        setTimeout(() => {
          this.emailSent = false;
          this.router.navigate(['/']);
        }, 2000);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Kein User mit der angegebenen E-Mail-Adresse gefunden');
      });
  }

}