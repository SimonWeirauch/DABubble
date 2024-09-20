import { Component, inject, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../database.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';
import { DialogShowSelectedUserComponent } from '../dialog-show-selected-user/dialog-show-selected-user.component';
import { UserService } from '../user.service';


@Component({
  selector: 'app-dialog-add-additional-member',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-add-additional-member.component.html',
  styleUrls: ['./dialog-add-additional-member.component.scss', './dialog-add-additional-memberResp.component.scss']
})
export class DialogAddAdditionalMemberComponent {

  database = inject(DatabaseService)
  
  currentChannel: Channel;
  newChannel: Channel;
  
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;

  selectedListWidthMobile: number;

  searchUser: string = '';

  userlist: Array<User> = [];
  foundUserList: Array<User> = [];
  selectedUserList: Array<User> = [];

  @ViewChild('errorMsg') errorMessage: ElementRef 
  @ViewChild('selectedList') selectedList: ElementRef 


  constructor(public dialogRef: MatDialogRef<DialogAddAdditionalMemberComponent>, public dialog: MatDialog, public us: UserService){
    this.setUserlist();
  }

  
  /**
   * loads userlist and creates the selection of users that could
   * possibly be added to channel
   */
  setUserlist(){
    this.loadUserList();
    this.createPossibleUserSelection();
  }
  

  /**
   * loads all users into a userlist variable
   */
  loadUserList(){
    setTimeout(() => {
      this.userlist = [];
      this.database.loadAllUsers().then(allUsers =>{
        allUsers.forEach(member => {
          this.database.loadUser(member.userId)
            .then(user =>{
              this.userlist.push(user)
            })
        })
      })
    }, 100);
  }


  /**
   * takes the list of all users and splices the
   * members of the current channel to get the possible
   * new members
   */
  createPossibleUserSelection(){
    setTimeout(() => {
      this.currentChannel.membersId.forEach(memberid => {
        this.userlist.forEach(user => {
          if(memberid == user.userId){
            this.userlist.splice(this.userlist.indexOf(user), 1)
          }
        })
      })
    }, 150);
  }


  /**
   * checks if the selected User was already selected and give notice to the user or
   * adds the selected user to the selected user list
   * @param user userobject
   */
  selectUser(user: User){
    let doubleSelection: boolean = false
    this.selectedUserList.forEach(selectedUser => {
      if(selectedUser.email == user.email){doubleSelection = true;}
    })
    if(doubleSelection){
      this.errorMessage.nativeElement.innerHTML = 'Nutzer wurde bereits ausgewählt';
      this.inputFocused =  false;
      this.hideUserContainer = true;
      this.searchUser = '';
    }
    else{
      this.addUserToSelectedUserList(user)
    }
  }


  /**
   * add the user to the selected user list and sets everything to default
   * @param user userobject
   */
  addUserToSelectedUserList(user: User){
    this.selectedUserList.push(user);
    this.setDefault();
    this.checkInputWidth();
  }


  /**
   * checks the length of the inputfield
   */
  checkInputWidth(){
    if(this.selectedList.nativeElement.offsetWidth > 500){
      this.selectedListWidthMobile = this.selectedList.nativeElement.offsetWidth
    }
    else{
      this.selectedListWidthMobile = this.selectedList.nativeElement.offsetWidth
    }
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
   * removes the user from the selected user list
   * @param user userobject
   */
  removeUser(user: User){
    this.selectedUserList.splice(this.selectedUserList.indexOf(user), 1);
    this.setDefault();
    this.checkInputWidth();
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


  /**shows the found users */
  showFilteredUser(){
    this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(this.searchUser));
  }


  /**
   * creates the new channelobject with the new added members after checking if
   * at least one new member was added to the selected user list
   */
  addNewMembers(){
    if(this.selectedUserList.length == 0){
      this.errorMessage.nativeElement.innerHTML = 'Bitte wählen Sie weitere Nutzer aus';
    }
    else{
      this.newChannel = new Channel(this.currentChannel);
      this.addChannelToNewMembers();
      this.updateChannel();
      this.dialogRef.close();
    }
  }


  /**
   * adds the new channel to the new Members in the database
   */
  addChannelToNewMembers(){
    this.newChannel.membersId = [];
    this.selectedUserList.forEach(user =>{
      this.newChannel.membersId.push(user.userId)
    })
    this.database.addChannel(this.newChannel);
  }


  /**
   * updates the channelobject for the old members in the database
   */
  updateChannel(){
    this.selectedUserList.forEach(user => {
      this.currentChannel.membersId.push(user.userId)
    })
    this.database.updateChannelMembers(this.currentChannel);
    this.setUserlist();
  }


  /**
   * opens a list that shows the current selection of users which
   * will be added to the channel
   */
  openSelectedUserList(){
    const userlistInfo = this.dialog.open(DialogShowSelectedUserComponent);
    userlistInfo.afterClosed().subscribe( () => {
      this.selectedUserList = userlistInfo.componentInstance.selectedUserList;
    })
    userlistInfo.componentInstance.selectedUserList = this.selectedUserList;
  }

}
