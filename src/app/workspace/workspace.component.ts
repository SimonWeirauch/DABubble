import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { CommonModule } from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { UserService } from '../user.service';
import { ChannelComponent } from '../channel/channel.component';
import { FormsModule } from '@angular/forms';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { AuthService } from '../shared-services/auth.service';



@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, ChannelComponent, FormsModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss', './workspaceResp.component.scss']
})
export class WorkspaceComponent {
  database = inject(DatabaseService);
  userService = inject(UserService);
  
  inputUser: string = '';

  inputFocused: boolean =  false;
  isdataLoaded: boolean = true;
  hideUserContainer: boolean = true;
  hideConversationBody: boolean = false;
  hideChannelBody: boolean = false;

  userlist: Array<User> = [];
  channelList: Array<Channel> = [];
  foundUserList: Array<User> = [];
  foundChannelList: Array<Channel> = [];
  filteredList: Array<ConversationMessage> = [];
  conversationList: Array<Conversation> = [];


  @Input() activeUserChannels: Array<Channel> 
  @Input() activeUserConversationList: Array<Conversation> 
  @Input() usersFromActiveUserConversationList: Array<User> 
  @Input() activeUser: User
  @Input() reload: boolean;



  @Output() changeToChannel = new EventEmitter<Channel>();
  @Output() changeToConversation = new EventEmitter<Conversation>();
  @Output() changeToNewConversation = new EventEmitter<Conversation>();
  


  constructor(public dialog: MatDialog, public us: UserService, public auth: AuthService){  
    if(auth.checkUserStatus()){
      setTimeout(() => {
        this.loadUserList();
        this.loadUserChannel();
        this.loadUserConversation();
      }, 1000);
    }


  }


  /**
  * loads the userlist from database
  */
  loadUserList() {
    setTimeout(() => {
      this.userlist = [];
      this.database.loadAllUsers().then(allUsers =>{
        this.userlist = allUsers;
      })
    }, 500);
  }


  /**
   * loads the channellist for the user from database
  */
  loadUserChannel(){
    setTimeout(() => {
      this.channelList = [];
      this.database.loadAllUserChannels(this.activeUser.userId).then(allChannel => {
        this.channelList = allChannel;
      })
    }, 1000);
  }


  /**
   * loads the conversationlist for the user from database
  */
  loadUserConversation(){
    setTimeout(() => {
      this.conversationList = [];
      this.database.loadAllUserConversations(this.activeUser.userId).then(allConversations => {
        this.conversationList = allConversations;
      })
    }, 1000);
  }


  /**
   * sends conversationobject to main component to be opened
   * @param conversation conversationobject
   */
  openConversation(conversation: Conversation){
    this.changeToConversation.emit(conversation);
  }


  /**
   * opens the view to create a new conversation
   */
  openNewConversation(){
    this.changeToNewConversation.emit();
  }


  /**
   * creates a new conversation with the selected user and thats the new conversation
   * information to the main component ot be opened
   * @param user userobject
   */
  createNewConversation(user: User){
    let newConversation = this.database.createConversation(this.activeUser.userId, user.userId)
    this.database.addConversation(newConversation);
    this.us.loadActiveUserConversations();
    setTimeout(() => {
      this.changeToConversation.emit(newConversation);
    }, 200);
  }


  /**
   * sends channelobject to main component to be opened
   * @param channel channelobject
  */
  openChannel(channel: Channel){
    this.changeToChannel.emit(channel);
  }


  /**
   * shows or hides the list of channels
   */
  switchVisibilityChannelbody(){
    if(this.hideChannelBody){
      this.hideChannelBody = false;
    }
    else{
      this.hideChannelBody = true;
    }
  }


  /**
   * shows or hides the list of conversations
   */
  switchVisibilityConversationbody(){
    if(this.hideConversationBody){
      this.hideConversationBody = false;
    }
    else{
      this.hideConversationBody = true;
    }
  }

  
  /**
   * opens the dialog to create a new channel
   */
  openCreateChannelDialog(){
    this.dialog.open(DialogCreateChannelComponent, {
      panelClass: 'customDialog',
    })
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
   * filters the channel or users depending on the input of the user
   */
  showFilteredUser(){
    if(this.inputUser.startsWith('@')){
      let searchUser = this.inputUser.substring(1);
      this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(searchUser));
    }
    else if(this.inputUser.startsWith('#')){
      let searchChannel = this.inputUser.substring(1);
      this.foundChannelList = this.channelList.filter((channel) => channel.name.toLowerCase().startsWith(searchChannel))
    }
    else{
      this.foundUserList = this.userlist.filter((user) => user.email.toLowerCase().startsWith(this.inputUser));
    }
  }


  /**
   * Sends the channelobject to main component
   * @param channel channelobject that will be send to main component
   */
  selectChannel(channel: Channel){
    this.changeToChannel.emit(channel);
  }


  /**
   * opens a conversation with the selected User
   * @param user userobject
   */
  selectUser(user: User){
    for(let conversation of this.conversationList){
      if(conversation.createdBy == this.us.activeUserObject.userId){
        if(this.checkSelectedUser(conversation, user)){break;};
      }
      else if(conversation.createdBy == user.userId){
        if(this.checkActiveUser(conversation, user)){break;};
      }
      else{
        this.createNewConversationFromSearch(conversation, user);
      }
    }
  }


  /**
   * checks the current conversation in the for-loop (for-loop through all conversations of the user) 
   * if the recipient or the creator of the conversation matches the selected user and opens the conversation
   * if true
   * @param conversation conversationobject
   * @param user userobject
   */
  checkSelectedUser(conversation: Conversation, user: User): boolean{
    if(conversation.recipientId == user.userId){
      this.changeToConversation.emit(conversation);
      return true
    }
    else if(conversation.createdBy == user.userId){
      if(conversation.recipientId == this.us.activeUserObject.userId){
        this.changeToConversation.emit(conversation);
        return true
      }
    }
    return false
  }


  /**
   * checks the current conversation in the for-loop (for-loop through all conversations of the user) 
   * if the recipient or the creator of the conversation matches the active user and opens the conversation
   * if true
   * @param conversation conversationobject
   * @param user userobject
   */
  checkActiveUser(conversation: Conversation, user: User): boolean{
    if(conversation.recipientId == this.us.activeUserObject.userId){
      this.changeToConversation.emit(conversation);
      return true;
    }
    else if(conversation.createdBy == this.us.activeUserObject.userId){
      if(conversation.recipientId == user.userId){
        this.changeToConversation.emit(conversation);
        return true;
      }
    }
    return false;
  }


  /**
   * Creates a new Conversation with the selected user and opens it
   *  because the previous checks did not result in true
   * @param conversation conversationobject
   * @param user userobject
   */
  createNewConversationFromSearch(conversation: Conversation, user: User){
    if((this.conversationList.indexOf(conversation) +1) == this.conversationList.length) {
      this.openNewConversationFromSearch(user);
    }
  }


    /**
   * creates a new conversation with a user and sends the information regarding the new created conversation
   * to the main component
   * @param user userObject
   */
    openNewConversationFromSearch(user: User){
      let newConversation = this.database.createConversation(this.us.activeUserObject.userId, user.userId)
      this.database.addConversation(newConversation);
      this.us.loadActiveUserConversations();
      setTimeout(() => {
        this.changeToConversation.emit(newConversation);
      }, 200);
    }
}