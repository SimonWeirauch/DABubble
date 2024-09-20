import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-change-password',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-change-password.component.html',
  styleUrl: './dialog-change-password.component.scss'
})

export class DialogChangePasswordComponent implements OnInit {
  userId: any = '';
  myForm: FormGroup;
  passworChanged: boolean = false;

  constructor(public route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router, private us: UserService) {
    this.myForm = this.formBuilder.group({
      newPass1: ['', [Validators.required, Validators.minLength(5)]],
      newPass2: ['', [Validators.required, Validators.minLength(5)]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit():void {
    this.userId = this.route.snapshot.paramMap.get('id');
  }


  /**
 * Custom validator function to check if passwords match
 * @param group The form group containing the passwords
 * @returns Validation error if passwords do not match
 */
  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPass1 = group.get('newPass1')?.value;
    const newPass2 = group.get('newPass2')?.value;
    return newPass1 === newPass2 ? null : { passwordMismatch: true };
  }


  /**
 * Function to handle form submission
 */
  onSubmit() {
    if (this.myForm.valid && this.myForm.get('newPass1')?.value === this.myForm.get('newPass2')?.value) {
      this.us.changePassword(this.userId, this.myForm.value.newPass1);
      this.passworChanged = true;
      setTimeout(() => {
        this.passworChanged = false;
        this.router.navigate(['/']);
      }, 2000);
    } else {
      // console.log('Form not valid');
    }
  }

}
