import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DatabaseService } from '../database.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../models/channel.class';
import { DialogAddChannelMembersComponent } from '../dialog-add-channel-members/dialog-add-channel-members.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {
  
  database = inject(DatabaseService)
  
  description: string;
  channelName: string;
  activeUser: string = this.userService.activeUserObject.userId
  channelCache: Channel;

  buttonDisabled: boolean = true;
  
  @ViewChild('errorMsg') errorMessage: ElementRef
  

  constructor(public dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, public userService: UserService){
    
  }


  /**
   * checks if the name input field is empty and enables / disables
   * the button
   */
  checkContent(){
    if(this.channelName == ''){
      this.buttonDisabled = true;
    }
    else{
      this.buttonDisabled = false;
    }
  }


  /**
   * checks if the channel name already exists in the database
   * @returns boolean
   */
  validateContent(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) =>{
      this.database.loadAllChannels()
        .then(channelList => {
          let result = true;
           for (let channel of channelList) {
            if(this.channelName.toLowerCase() == channel.name.toLowerCase()){
              result = false;
              break;
            }
           }
           resolve(result);
          })
          .catch(error => {reject(error)})
    },)
  }
  

  /**
   * checks the content and if the content is valid a channel object
   * with all the relevant information is created and passed to the next dialog
   */
  saveChannelInformation(){
    this.validateContent()
      .then(bool => {
        if(bool){
          this.channelCache = this.database.createChannel(this.activeUser, this.description, [], this.channelName)
          const channelInfo = this.dialog.open(DialogAddChannelMembersComponent, {panelClass: 'customDialog'})
          channelInfo.componentInstance.channelCache = this.database.createChannel(this.activeUser, this.description, [], this.channelName);
          this.dialogRef.close();
        }
        else{
          this.errorMessage.nativeElement.innerHTML = 'Channel-Name existiert bereits'
        }
      })
  }
}
