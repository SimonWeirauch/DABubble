import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../user.service';
import { Firestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgStyle, FormsModule, ReactiveFormsModule, CommonModule, RouterLink, MatCheckboxModule, NgClass],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  isPressed = false;
  firestore: Firestore = inject(Firestore)
  myForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      pw: ['', [Validators.required, Validators.minLength(6)]],
      mail: ['', [Validators.required, Validators.email]],
      box: ['', [Validators.requiredTrue]],
    });
  }


  onSubmit() {
    this.us.checkEmail(this.myForm.value.mail, this.myForm)
  }

}
