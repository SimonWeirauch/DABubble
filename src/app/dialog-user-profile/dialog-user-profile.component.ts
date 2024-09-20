import { Component } from '@angular/core';
import { User } from '../../models/user.class';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { DatabaseService } from '../database.service';
import { Conversation } from '../../models/conversation.class';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-user-profile.component.html',
  styleUrl: './dialog-user-profile.component.scss'
})
export class DialogUserProfileComponent {
  shownUser: User;
  activeUser: User = this.userService.activeUserObject;
  conversationList: Array<Conversation> = this.userService.activeUserConversationList;

  constructor(public dialogRef: MatDialogRef<DialogUserProfileComponent>, public dialog: MatDialog, public database: DatabaseService, public userService : UserService){
    
  }


  /**
   * opens a conversation with the selected User
   * @param user userobject
   */
  openConversation(user: User){
    for(let conversation of this.conversationList){
      if(conversation.createdBy == this.activeUser.userId){
        if(this.checkSelectedUser(conversation, user)){break;}
      }
      else if(conversation.createdBy == user.userId){
        if(this.checkActiveUser(conversation, user)){break;}
      }
      else{
        if((this.conversationList.indexOf(conversation) +1) == this.conversationList.length) {
          this.openNewConversation(user);
        }
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
      this.dialogRef.close(conversation);
      return true;
    }
    else if(conversation.createdBy == user.userId){
      if(conversation.recipientId == this.activeUser.userId){
        this.dialogRef.close(conversation);
        return true;
      }
    }
    return false;
  }


  /**
   * checks the current conversation in the for-loop (for-loop through all conversations of the user) 
   * if the recipient or the creator of the conversation matches the active user and opens the conversation
   * if true
   * @param conversation conversationobject
   * @param user userobject
   */
  checkActiveUser(conversation: Conversation, user: User): boolean{
    if(conversation.recipientId == this.activeUser.userId){
      this.dialogRef.close(conversation);
      return true;;
    }
    else if(conversation.createdBy == this.activeUser.userId){
      if(conversation.recipientId == user.userId){
        this.dialogRef.close(conversation);
        return true;;
      }
    }
    return false;
  }


  /**
   * opens a conversation with the user of the opened profile
   * @param user userobject
   */
  openNewConversation(user: User){
    let newConversation = this.database.createConversation(this.activeUser.userId, user.userId);
    this.database.addConversation(newConversation);
    this.userService.loadActiveUserConversations();
    
    setTimeout(() => {
      this.dialogRef.close(newConversation);
    }, 400);
  }

}