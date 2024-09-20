import { Component, ElementRef, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { MatDialog} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../models/conversation.class';
import { UserService } from '../user.service';
import { AuthService } from '../shared-services/auth.service';


@Component({
  selector: 'app-create-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-conversation.component.html',
  styleUrl: './create-conversation.component.scss'
})
export class CreateConversationComponent {

  @Input() channelSizeSmaller: boolean;
  @Input() channelSizeSmall: boolean;
  @Input() channelSizeBig: boolean;
  @Input() channelSizeBigger: boolean;

  @Output() changeReloadStatus = new EventEmitter<boolean>();
  @Output() changeToChannel = new EventEmitter<Channel>()
  @Output() changeToConversation = new EventEmitter<Conversation>()
  
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;
  isdataLoaded: boolean = false;

  inputUser: string = '';

  userlist: Array<User> = [];
  channelList: Array<Channel> = [];
  conversationList: Array<Conversation> = [];
  foundUserList: Array<User> = [];
  foundChannelList: Array<Channel> = [];


  constructor(public dialog: MatDialog, private database: DatabaseService, public us: UserService, public auth: AuthService){
    setTimeout(() => {
    if(us.loggedUser){
        this.loadUserList();
        this.loadUserChannel();
        this.loadUserConversation();
     }
    }, 1000);

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
    }, 1000);
  }


  /**
   * loads the channellist for the user from database
  */
  loadUserChannel(){
    setTimeout(() => {
      this.channelList = [];
      this.database.loadAllUserChannels(this.us.activeUserObject.userId).then(allChannel => {
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
      this.database.loadAllUserConversations(this.us.activeUserObject.userId).then(allConversations => {
        this.conversationList = allConversations;
        this.isdataLoaded = true;
      })
    }, 1000);
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
   * creates a new conversation with a user and sends the information regarding the new created conversation
   * to the main component
   * @param user userObject
   */
  openNewConversation(user: User){
    let newConversation = this.database.createConversation(this.us.activeUserObject.userId, user.userId)
    this.database.addConversation(newConversation);
    this.us.loadActiveUserConversations();
    setTimeout(() => {
      this.changeToConversation.emit(newConversation);
    }, 200);
  }


  /**
   * Sends the channelobject to main component
   * @param channel channelobject that will be send to main component
   */
  selectChannel(channel: Channel){
    this.changeToChannel.emit(channel);
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
   * opens a conversation with the selected User
   * @param user userobject
   */
  selectUser(user: User){
    for(let conversation of this.conversationList){
      if(conversation.createdBy == this.us.activeUserObject.userId){
        if(this.checkSelectedUser(conversation, user)){
          break;
        }
        else{
          this.createNewConversation(conversation, user);
        }
       
      }
      else if(conversation.createdBy == user.userId){
        if(this.checkActiveUser(conversation, user)){
          break;
        }
        else{
          this.createNewConversation(conversation, user);
        }
        
      }
      else{
        this.createNewConversation(conversation, user);
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
  createNewConversation(conversation: Conversation, user: User){
    if((this.conversationList.indexOf(conversation) +1) == this.conversationList.length) {
      this.openNewConversation(user);
    }
  }

}
