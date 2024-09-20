import { Component, ElementRef, ViewChild, inject, OnChanges } from '@angular/core';
import { Channel } from '../../models/channel.class';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { DialogAddAdditionalMemberComponent } from '../dialog-add-additional-member/dialog-add-additional-member.component';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';
import { DialogAddMembersFromSettingsComponent } from '../dialog-add-members-from-settings/dialog-add-members-from-settings.component';


@Component({
  selector: 'app-dialog-show-channel-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogAddMembersFromSettingsComponent],
  templateUrl: './dialog-show-channel-settings.component.html',
  styleUrls: ['./dialog-show-channel-settings.component.scss', './dialog-show-channel-settingsResp.component.scss']
})
export class DialogShowChannelSettingsComponent {
  currentChannel: Channel;
  newChannel: Channel;

  database = inject(DatabaseService);

  activeUser: User;
  channelCreator: User;

  newChannelName: string = '';
  newChannelDescription: string = '';
  
  showEditNameInput: boolean = false;
  showEditDescriptionInput: boolean = false

  userlist: Array<User> = [];

  @ViewChild('errorMsg') errorMessage: ElementRef

  
  constructor(public dialogRef: MatDialogRef<DialogShowChannelSettingsComponent>, public dialog: MatDialog, public us: UserService){
    this.database.loadUser(us.activeUserObject.userId)
      .then(user =>{
        this.activeUser = user;
    })
    this.setUserlist();
  }


  /**
   * creates the userlist of the channel members
   */
  setUserlist(){
    setTimeout(() => {
      this.currentChannel.membersId.forEach(userId => {
        this.database.loadUser(userId)
          .then(user => {
            this.userlist.push(user);
          })
      })
    }, 100);
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
   * lets the active user leave the channel
   */
  leaveChannel(){
    this.newChannel = new Channel(this.currentChannel);
    this.newChannel.membersId.splice(this.newChannel.membersId.indexOf(this.activeUser.userId), 1)
    this.database.updateChannelMembers(new Channel(this.newChannel));
    this.database.deleteChannel(new Channel(this.newChannel), this.activeUser.userId)
    this.us.loadActiveUserChannels();
    this.us.loadActiveUserConversations();
    this.dialogRef.close(true);
  }


  /**
   * changes the view of the name or description input field to edit mode
   * @param value name or descritpion
   */
  changeToEditView(value: string){
    if(value == 'name'){
      if(this.showEditNameInput){this.showEditNameInput = false;}
      else{this.showEditNameInput = true;}
    }
    else{
      if(this.showEditDescriptionInput){this.showEditDescriptionInput = false;}
      else{this.showEditDescriptionInput = true;}
    }
  }


  /**
   * checks the content and if the content is valid a channel object
   * with the new name is created and updated in the database
   */
  saveChangedChannelName(){
    this.validateContent()
    .then(bool => {
      if(bool){
        this.currentChannel.name = this.newChannelName;
        this.database.updateChannelName(new Channel(this.currentChannel))
        this.showEditNameInput = false;
        this.us.loadActiveUserChannels();
        this.us.loadActiveUserConversations();
      }
      else{
        this.errorMessage.nativeElement.innerHTML = 'Channel-Name existiert bereits'
      }
    })
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
            if(this.newChannelName.toLowerCase() == channel.name.toLowerCase()){
              result = false;
              break;
            }
           }
           resolve(result);
          })
          .catch(error =>{reject(error)})
    },)
  }


  /**
   * checks the content and if the content is valid a channel object
   * with the new description is created and updated in the database
   */
  saveChangedChannelDescription(){
    this.currentChannel.description = this.newChannelDescription;
    this.database.updateChannelName(new Channel(this.currentChannel))
    this.showEditDescriptionInput = false;
    this.us.loadActiveUserChannels();
    this.us.loadActiveUserConversations();
  }


  /**
   * sets all variables to their default value
   */
  setDefault(){
    this.errorMessage.nativeElement.innerHTML = '';
  }


  /**
   * opens a dialog where new members can be added to the channel
   */
  showAddMember(){
    const channelInfo = this.dialog.open(DialogAddMembersFromSettingsComponent);
    channelInfo.componentInstance.currentChannel = this.currentChannel;
    this.dialogRef.close();
  }

}