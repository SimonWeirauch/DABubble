import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject} from '@angular/core';
import { Channel } from '../../models/channel.class';
import {MatRadioModule} from '@angular/material/radio'; 
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { FormsModule } from '@angular/forms';
import { DialogShowSelectedUserComponent } from '../dialog-show-selected-user/dialog-show-selected-user.component';
import { UserService } from '../user.service';



@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule],
  templateUrl: './dialog-add-channel-members.component.html',
  styleUrls: ['./dialog-add-channel-members.component.scss', './dialog-add-channel-membersResp.component.scss' ]
})
export class DialogAddChannelMembersComponent {
  database = inject(DatabaseService)
  
  channelCache: Channel;
  
  hideUserInput: boolean = true;
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;
  
  activeUser: string = this.us.activeUserObject.userId
  searchUser: string = '';
  resultRadioButton: string;

  memberIdList: Array<string> = [];
  userlist: Array<User> = [];
  foundUserList: Array<User> = [];
  selectedUserList: Array<User> = [];
 
  @ViewChild('errorMsg') errorMessage: ElementRef


  constructor(public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>, public dialog: MatDialog, public us: UserService){
    this.loadUserList();
  }


  /**
  * loads the userlist from database
  */
  loadUserList(){
    this.database.loadAllUsers().then(allUsers =>{
      this.userlist = allUsers
      this.userlist.forEach(user => {
        if(user.userId == this.activeUser){
          this.userlist.splice(this.userlist.indexOf(user), 1);
        }
      })
    })
  }


  /**shows the found users */
  showFilteredUser(){
    this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(this.searchUser));
  }


  /**
   * checks if the selected User was already selected and give notice to the user or
   * adds the selected user to the selected user list
   * @param user userobject
   */
  selectUser(user: User){
    let doubleSelection: boolean = false
    this.selectedUserList.forEach(selectedUser => {if(selectedUser.email == user.email){doubleSelection = true;}})
    if(doubleSelection){
      this.errorMessage.nativeElement.innerHTML = 'Nutzer wurde bereits ausgewählt';
      this.inputFocused =  false;
      this.hideUserContainer = true;
      this.searchUser = '';
    }
    else{
      this.selectedUserList.push(user);
      this.setDefault();
    }
  }

  
  /**
   * removes the user from the selected user list
   * @param user userobject
   */
  removeUser(user: User){
    this.selectedUserList.splice(this.selectedUserList.indexOf(user), 1);
    this.setDefault();
  }
 

  /**
   * sets all variables to their default value
   */
  setDefault(){
    this.inputFocused =  false;
    this.hideUserContainer = true;
    this.searchUser = '';
    this.errorMessage.nativeElement.innerHTML = '';
  }

  
  /**
   * creates a new channel either with the specific user selection as members or with all user
   * as members of the new channel
   */
  createNewChannel(){    
    if(this.resultRadioButton == "selection"){
      this.checkSelection();
    }
    else{
      this.userlist.forEach(user => {
        this.memberIdList.push(user.userId)
      })
      this.memberIdList.push(this.activeUser)
      this.database.addChannel(this.database.createChannel(this.channelCache.createdBy, this.channelCache.description, this.memberIdList, this.channelCache.name))
      this.us.loadActiveUserChannels();
      this.us.loadActiveUserConversations();
      this.dialogRef.close();
    }
  }


  /**
   * checks if there was made a selection of at least one user
   */
  checkSelection(){
    if(this.selectedUserList.length == 0){
      this.errorMessage.nativeElement.innerHTML = 'Bitte wählen Sie weitere Nutzer aus';
    }
    else{
      this.addSelectionToDB();
    }
  }


  /**
   * creates a new channel and adds that channel to every member
   * of the channel in the database
   */
  addSelectionToDB(){
      this.selectedUserList.forEach(user => {
        this.memberIdList.push(user.userId)
      })
      this.memberIdList.push(this.activeUser);
      this.database.addChannel(this.database.createChannel(this.channelCache.createdBy, this.channelCache.description, this.memberIdList, this.channelCache.name))
      this.us.loadActiveUserChannels();
      this.us.loadActiveUserConversations();
      this.dialogRef.close();
  }


  /**
   * if the value of the radio button is show the input field to add a 
   * user selection is shown
   * @param value hide or show to check the value of the radiobutton
   */
  changeUserInputVisibility(value: string){
    if(value == 'hide'){
      this.hideUserInput = true;
    }
    else{
      this.hideUserInput = false;
    }
  }


  /**
   * hides or shows the container where the filtered users are displayed
   */
  changeUserContainerVisibility(){
    if(this.hideUserContainer){
      this.hideUserContainer = false;
    }
    else{
      this.hideUserContainer = true;
    }
  }


  /**
   * detects if the inputfield is focused or not at thats the varibles accordingly
   */
  detectInputFocus(){
    if(this.inputFocused){
      this.inputFocused = false;
    }
    else{
      this.inputFocused = true;
    }
  }


  /**
   * opens a list of the currently selected users of the channel
   */
  openSelectedUserList(){
    const userlistInfo = this.dialog.open(DialogShowSelectedUserComponent);
    userlistInfo.componentInstance.selectedUserList = this.selectedUserList;
  }
}
