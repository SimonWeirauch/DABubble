import { Component, inject, OnInit} from '@angular/core';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { ChannelComponent } from '../channel/channel.component';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { DatabaseService } from '../database.service';
import { Channel } from '../../models/channel.class';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../models/conversation.class';
import { CreateConversationComponent } from '../create-conversation/create-conversation.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../shared-services/auth.service';
import { Thread } from '../../models/thread.class';
import { ChannelThread } from '../../models/channelThread.class';
import { NavigationStart, Router } from '@angular/router';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, HeaderComponent , ChannelComponent, ChatComponent, ThreadComponent, CommonModule, CreateConversationComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit{
  authService = inject(AuthService);
  conversation: boolean = false;
  channel: boolean = false;
  isWSVisible: boolean = true;
  reloadChannel: boolean = false;
  reloadChat: boolean = false;
  thread: boolean = false;
  channelThread: boolean = false;

  channelBig: boolean = false;

  channelSizeSmaller: boolean = false;
  channelSizeSmall: boolean = false;
  channelSizeBig: boolean = true;
  channelSizeBigger: boolean = false;
  
  
  currentConversation: Conversation;
  currentChannel: Channel;
  currentThread: Thread;
  currentChannelThread: ChannelThread;

  searchQuery: string = '';



  constructor(public userservice: UserService, public database: DatabaseService, router: Router){
    userservice.getDeviceWidth();
    this.authService.checkUserStatus();
    router.events.forEach((event) => {    
      if(event instanceof NavigationStart){
        if(event.navigationTrigger === "popstate"){
          if(event.url == '/main'){
            window.location.href = "https://bubble.ishakates.com"
          }
        }
      }
    })
  }


  ngOnInit(): void {
    // this.authService.checkActiveUser();
  }


  /**
   * Sets the size of the channel or Chat to Big
   */
  setSizeToBig(){
    this.channelSizeSmaller = false;
    this.channelSizeSmall = false;
    this.channelSizeBig = true;
    this.channelSizeBigger = false;
  }


  /**
   * Sets the size of the channel or Chat to Small
   */
  setSizeToSmall(){
    this.channelSizeSmaller = false;
    this.channelSizeSmall = true;
    this.channelSizeBig = false;
    this.channelSizeBigger =  false;
  }


  /**
   * Sets the size of the channel or Chat to Smaller
   */
  setSizeToSmaller(){
    this.channelSizeSmaller = true;
    this.channelSizeSmall = false;
    this.channelSizeBig = false;
    this.channelSizeBigger =  false;
  }


  /**
   * Sets the size of the channel or Chat to Bigger
   */
  setSizeToBigger(){
    this.channelSizeSmaller = false;
    this.channelSizeSmall = false;
    this.channelSizeBig = false;
    this.channelSizeBigger = true;
  }


  /**
   * opens a the channel view
   * @param channel channelobject
   */
  changeChannel(channel: Channel){
    if(this.userservice.deviceWidth > 850){
      this.getDesktopChannelView(channel);
    }
    else{
      this.getMobileChannelView(channel);
    }
  }


  /**
   * sets the variables according to deskotp view
   * @param channel channelobject
   */
  getDesktopChannelView(channel: Channel){
    if(this.channel){
      this.reloadChannel = true;
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
      this.thread = false;
      this.setSizeToBig();
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
      this.thread = false;
      this.setSizeToBig();
    }
  }


  /**
   * sets the variables according to mobile view
   * @param channel channelobject
   */
  getMobileChannelView(channel: Channel){
    if(this.channel){
      this.currentChannel = channel;
      this.reloadChannel = true;
      this.conversation = false;
      this.channel = true;
      this.thread = false;
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
      this.thread = false;
    }
    this.isWSVisible = false;
  }


  /** 
   * changes the view to the an existing conversation
   */
  changeConversation(conversation: Conversation){
    if(this.userservice.deviceWidth > 850){
      this.currentConversation = conversation;
      this.conversation = true;
      this.channel = false;
      this.thread = false;
      this.setSizeToBig();
    }
    else{
      this.currentConversation = conversation;
      this.conversation = true;
      this.channel = false;
      this.isWSVisible = false;
      this.thread = false;
    }
  }


  /**
   * opens a Thread from a Conversation
   * @param thread Thread of Conversation
   */
  openThread(thread: Thread){
    this.currentThread = thread;
    if(this.userservice.deviceWidth < 1200){
      this.thread = true;
      this.channelThread = false;
      this.conversation = false;
      this.channel = false;
      this.reloadChat = true;
    }
    else{
      this.thread = true;
      this.channelThread = false;
      this.reloadChat = true;
      if(this.isWSVisible){this.setSizeToSmaller();}
      else{this.setSizeToSmall();}
    }
  }


  /**
   * Opens a Thread from a Channel
   * @param thread Thread of Channel
   */
  openChannelThread(thread: ChannelThread){
    this.currentChannelThread = thread;
    if(this.userservice.deviceWidth < 1200){
      this.thread = true;
      this.channelThread = true;
      this.conversation = false;
      this.channel = false;
      this.reloadChannel = true;
    }
    else{
      this.thread = true;
      this.channelThread = true;
      this.reloadChannel = true;
      if(this.isWSVisible){this.setSizeToSmaller();}
      else{this.setSizeToSmall();}
    }
  }


  /**
   * closes the open thread and returns the user to the
   * previous channel or conversation
   */
  closeThread(){
    this.setChannelSizeAfterClosingThread();
    if(this.channelThread){
      this.thread = false;
      this.channelThread = false;
      this.channel = true;
      this.conversation = false;
    }
    else{
      this.thread = false;
      this.channelThread = false;
      this.channel = false;
      this.conversation = true;
    }
  }


  /**
   * sets channel size after closing thread
   */
  setChannelSizeAfterClosingThread(){
    if(this.isWSVisible){
      this.setSizeToBig();
    }
    else{
      this.setSizeToBigger();
    }
  }

  
  /**
  * reloads the channel component
  * @param reload boolean
  */
  setReloadToFalse(reload: boolean){
    this.reloadChannel = false;
    this.reloadChat = true;
  }


  /**
   * stops channel from reloading
   */
  setChannelReloadToTrue(){
    this.reloadChannel = true;
  }


  /**
   * triggers the ngonchange functions (empties chat messagelist to avoid duplicated messages in chat window )
   * @param reload 
   */
  setChatReloadToTrue(reload: boolean){
    this.reloadChat = true
  }


  /**
   * switches view to workspace
   */
  viewWorkspace(){
    this.isWSVisible = true
    this.channel = false;
    this.conversation = false;
  }


  /**
   * shows the default view after leaving a channel
   */
  userLeftChannel(){
    this.conversation = false;
    this.channel = false;
  }


  /**
   * changes the visibility of the workspace
   */
  changeWSVisibility(){
    if(this.isWSVisible){
      this.adjustSizeToWSVisible();
    }
    else{
      this.adjustSizeToWSNotVisible();
    }
  }


  /**
   * Adjust the Size of the channel/thread for the
   * option that the workspace is visible
   */
  adjustSizeToWSVisible(){
    if(this.thread){
      this.isWSVisible = false;
      this.setSizeToSmall();
    }
    else{
      this.isWSVisible = false;
      this.setSizeToBigger();
    }
  }


  /**
   * Adjust the Size of the channel/thread for the
   * option that the workspace is not visible
   */
  adjustSizeToWSNotVisible(){
    if(this.thread){
      this.setSizeToSmaller();
      this.isWSVisible = true;
    }
    else{
      this.isWSVisible = true;
      this.setSizeToBig();
    }
  }


  /**
   * changes the view to the create new conversation
  */
  changeNewConversation(){
    if(this.userservice.deviceWidth > 850){
      this.reloadChannel = false;
      this.conversation = false;
      this.channel = false;
      this.thread = false;
    }
    else{
      this.reloadChannel = false;
      this.conversation = false;
      this.channel = false;
      this.isWSVisible = false;
      this.thread = false;
    }
  }


  /**
   * sets the search string to the value from the user
   * @param query search  string
   */
  onSearch(query: string) {
    this.searchQuery = query;
  }
}
