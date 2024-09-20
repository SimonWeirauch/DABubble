import { Component, EventEmitter, inject, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Conversation } from '../../models/conversation.class';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-dialog-show-user-profil',
  standalone: true,
  imports: [NgIf, FormsModule, NgStyle, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-show-user-profil.component.html',
  styleUrl: './dialog-show-user-profil.component.scss'
})
export class DialogShowUserProfilComponent implements OnInit {
  userData: User;
  database = inject(DatabaseService);
  us = inject(UserService);
  authService = inject(AuthService);
  editMode: boolean = false;
  selectedAvatar: string = '/da-bubble/assets/img/unUsedDefault.png';
  newData: User;
  myForm: FormGroup;
  showPasswordInput: boolean = false;
  userPassword: string = '';

  @Input() activeUser: User

  @Output() changeToConversation = new EventEmitter<Conversation>();

  /**
 * Function to check if the screen width is small
 * @returns boolean
 */
  isScreenSmall(): boolean {
    return window.innerWidth <= 850;
  }

  constructor(
    public dialogRef: MatDialogRef<DialogShowUserProfilComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder
  ) {
    this.userData = data.user;
  }


  /**
 * Function called when the component is initialized
 */
  ngOnInit() {
    this.myForm = this.fb.group({
      name: [this.userData.name, [Validators.required, Validators.minLength(6)]],
      email: [this.userData.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
    this.authService.activeUser?.subscribe((user) => {
      if (user) {
        const customUser = new User({
          email: user.email!,
          name: user.displayName!,
          status: 'online',
          avatarUrl: user.photoURL,
          userId: this.authService.us.loggedUser.userId,
          logIn: this.authService.us.loggedUser.logIn,
          usedLastTwoEmojis: this.authService.us.loggedUser.usedLastTwoEmojis,
          uid: user.uid
        });
        this.authService.currentUserSignal.set(customUser);
      } else {
        this.authService.currentUserSignal.set(null);
      }
    })
  }


  /**
 * Function to handle email change
 */
  onEmailChange(): void {
    this.showPasswordInput = this.userData.email !== this.myForm.get('email')?.value;
  }


  /**
 * Asynchronous function to edit user data
 */
  async editUser() {
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      const usedMail = this.userData.email;
      const currentPassword = this.showPasswordInput ? formData.password : null;
      this.userData.avatarUrl = this.selectedAvatar;
      try {
        await this.authService.changeUserData(
          this.userData.email,
          formData.email,
          currentPassword,
          formData.name,
          this.selectedAvatar
        );
        this.authService.checkUserStatus();
        // Aktualisiere die lokalen Daten
        this.userData.name = formData.name;
        this.userData.email = formData.email;
        this.editMode = false;
        this.userPassword = '';

        setTimeout(() => {
          this.emailNotChanged(formData, usedMail);
        }, 512)
        
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Benutzerdaten:', error);
      }
    } else {
      // Markiere alle Formularfelder als berührt, um Validierungsfehler anzuzeigen
      Object.values(this.myForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }


  /**
 * Function to handle email not changed scenario
 * @param formData The form data with email
 * @param usedMail The email that was being used
 */
  emailNotChanged(formData: { email: string; }, usedMail: string) {
    if (this.authService.wrongEmail) {
      this.authService.wrongEmail = false;
      this.myForm.value.email = usedMail;
      this.us.loggedUser.email = usedMail;
      formData.email = usedMail;
      console.log(usedMail);
      
      this.myForm.patchValue({
        email: usedMail,
        password: ''
      });
      this.userData.email = this.us.loggedUser.email;
      formData.email = this.us.loggedUser.email
      alert('Falsches Passwort oder E-Mail');
      this.editMode = true;
    }
  }


  /**
 * Function to handle file selection
 * @param event The event containing the file input
 */
  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }


  /**
 * Function to trigger file upload by clicking the file input element
 * @param fileInput The HTMLInputElement for file upload
 */
  triggerFileUpload(fileInput: HTMLInputElement): void {
    fileInput.click();
  }


  /**
 * Function to open the edit template
 */
  openEditTemplate() {
    this.editMode = true;
    this.showPasswordInput = false;
    this.newData = this.userData;
    this.selectedAvatar = this.userData.avatarUrl ?? '/da-bubble/assets/img/unUsedDefault.png';
    this.myForm.patchValue({
      name: this.userData.name,
      email: this.userData.email
    });
  }


  /**
 * Function to open a conversation
 * @param conversation The conversation to open
 */
  openConversation(conversation: Conversation){
      this.dialogRef.close(conversation);
  }


  /**
 * Function to close the edit mode
 */
  closeEdit() {
    this.editMode = false;
    this.myForm.reset({
      name: this.userData.name,
      email: this.userData.email
    });
    this.showPasswordInput = false;
    this.userPassword = '';
  }


  /**
 * Function to handle dialog close
 */
  onClose(): void {
    this.editMode = false;
    this.dialogRef.close();
  }

}
