import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-show-selected-user',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-show-selected-user.component.html',
  styleUrl: './dialog-show-selected-user.component.scss'
})
export class DialogShowSelectedUserComponent {
  
  selectedUserList: Array<User> = [];
  
  constructor(public dialogRef: MatDialogRef<DialogShowSelectedUserComponent>, public dialog: MatDialog, public us: UserService){

  }


  /**
   * opens the profile dialog of the selected user
   * @param user userobject
  */
  openProfile(user: User){
    const profileInfo = this.dialog.open(DialogUserProfileComponent);
    profileInfo.componentInstance.shownUser = user;
  }


  /**
   * removes the user from the selected user list
   * @param user userobject
   */
  removeUser(user: User){
    this.selectedUserList.splice(this.selectedUserList.indexOf(user), 1);
  }
}
