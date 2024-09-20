import { Component, ElementRef, Input, ViewChild, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { ChannelMessage } from '../../models/channelMessage.class';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddAdditionalMemberComponent } from '../dialog-add-additional-member/dialog-add-additional-member.component';
import { DialogShowMemberListComponent } from '../dialog-show-member-list/dialog-show-member-list.component';
import { DialogShowChannelSettingsComponent } from '../dialog-show-channel-settings/dialog-show-channel-settings.component';
import { UserService } from '../user.service';
import { TimeFormatingService } from '../shared-services/chat-functionality/time-formating.service';
import { EditMessageService } from '../shared-services/chat-functionality/edit-message.service';
import { FileUploadService } from '../shared-services/chat-functionality/file-upload.service';
import { GeneralChatService } from '../shared-services/chat-functionality/general-chat.service';
import { LastTwoEmojisService } from '../shared-services/chat-functionality/last-two-emojis.service';
import { MentionAndChannelDropdownService } from '../shared-services/chat-functionality/mention-and-channel-dropdown.service';
import { Reaction } from '../../models/reactions.class';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Conversation } from '../../models/conversation.class';
import { ChannelThread } from '../../models/channelThread.class';
import { combineLatest, from, map, Observable, switchMap, take } from 'rxjs';



@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss', './channelResp.component.scss']
})
export class ChannelComponent implements OnInit {

  @Input() channel: Channel
  @Input() reload: boolean;
  @Input() activeUser: User;

  @Input() channelSizeSmaller: boolean;
  @Input() channelSizeSmall: boolean;
  @Input() channelSizeBig: boolean;
  @Input() channelSizeBigger: boolean;
  @Input() filterQuery: string = '';

  @Output() changeReloadStatus = new EventEmitter<boolean>();
  @Output() userLeftChannel = new EventEmitter<boolean>();
  @Output() updatedMemberList = new EventEmitter<boolean>();
  @Output() openConversation = new EventEmitter<Conversation>();
  @Output() emitThread = new EventEmitter<ChannelThread>();

  memberList: Array<User> = [];
  messageList$: Observable<Array<ChannelMessage>>;
  private originalMessageList$: Observable<Array<ChannelMessage>>;
  filteredMessageList: Array<ChannelMessage>
  reactions: Array<Reaction> = [];
  groupedReactions: Map<string, Array<{ emoji: string, count: number, users: string[] }>> = new Map();
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;

  channelCreator: User;

  content: string = '';

  isdataLoaded: boolean = false;
  fileUploadError: string | null = null;

  @ViewChild('main') main: ElementRef
  @ViewChild('lastDiv') lastDiv: ElementRef<HTMLDivElement>;
  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(public dialog: MatDialog, private database: DatabaseService,
    public us: UserService,
    public editService: EditMessageService,
    public fileService: FileUploadService,
    public chatService: GeneralChatService,
    public twoEmoji: LastTwoEmojisService,
    public mAndC: MentionAndChannelDropdownService,
    public time: TimeFormatingService) {

    this.allChannels = mAndC.allChannels;
    this.allUsers = mAndC.allUsers;
    this.reactions = chatService.reactions;
    this.chatService.groupedReactions$.subscribe(groupedReactions => { this.groupedReactions = groupedReactions; });
    const newContent = '';
    this.mAndC.content.next(newContent);
    this.mAndC.content.subscribe(newContent => { this.content = newContent; });
    this.handleFileUploadError();
    this.mAndC.getFocusTrigger().subscribe(() => {
      if (this.myTextarea) {
        this.myTextarea.nativeElement.focus();
      }
    });
    this.fileService.downloadURL = '';
  }


  /**
   * handles the fileupload error
   */
  handleFileUploadError() {
    this.fileService.fileUploadError$.subscribe(error => {
      this.fileUploadError = error;
      setTimeout(() => {
        this.fileUploadError = null;
      }, 2500);
    });
  }


  /**
   * loads all needed data after DOM is loaded
   */
  ngOnInit() {
    this.messageList$ = this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId);
    this.originalMessageList$ = this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId);
    this.messageList$ = this.originalMessageList$;
  }


  /**
   * reloads the data after a change happend in the channel
   */
  ngOnChanges(changes?: SimpleChanges) {
    this.isdataLoaded = false;
    this.setDefaultForNgOnChange();
    setTimeout(() => {
      Promise.all([
        this.loadMemberList(),
        // this.loadChannelMessages(),
        this.loadChannelCreator(),
      ]).then(() => {
        this.reload = false;
        this.initializeChannelAfterChange()
      }).catch(error => { /* console.log('this ', error)*/ });
    }, 1000);
   if (changes != undefined && changes!['filterQuery']) {
      this.filterMessages(this.filterQuery);
   }
  }


  /**
   * reset all neccessary variables to default before loading
   */
  setDefaultForNgOnChange() {
    this.chatService.reactions = [];
    this.reactions = this.chatService.reactions;
    this.chatService.groupedReactions$.subscribe(groupedReactions => { this.groupedReactions = groupedReactions; });
    this.memberList = [];
  }



  /**
   * searches for already sent messages
   * @param query the content of the searchbar
   */
  filterMessages(query: string): void {
    if (query) {
      this.messageList$ = this.originalMessageList$.pipe(
        map(messages => messages.filter(message =>
          message.content.toLowerCase().includes(query.toLowerCase())
        ))
      );
    } else {
      this.messageList$ = this.originalMessageList$;
    }
  }


  /**
     * loads all message reactions and groups them after something changed
     * in the conversation
   */
  initializeChannelAfterChange() {
    this.messageList$ = this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId);
    this.originalMessageList$ = this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId);
    this.messageList$ = this.originalMessageList$;
    this.loadAllMessageReactions();
    this.messageList$.pipe(take(1)).subscribe(messageList => {
        this.chatService.groupReactions(messageList)
          .then(() => {
            this.isdataLoaded = true;
            setTimeout(() => {
              this.scrollToBottom();
              this.setFocus();
            }, 1000);
          });
   
    });
  }


  /**
   * sends the info to reload the channel to main component
   */
  changeReload() {
    this.changeReloadStatus.emit()
  }


  /**
   * loads the memberlist of the channel
   * @returns  promise
   */
  loadMemberList(): Promise<void> {
    const memberPromises = this.channel.membersId.map(member => {
      this.database.loadUser(member)
        .then(user => {
          this.memberList.push(user);
        })
    });
    return Promise.all(memberPromises).then(() => { });
  }


  /**
   * loads the creator of the channel
   * @returns promise
   */
  loadChannelCreator(): Promise<void> {
    return this.database.loadUser(this.channel.createdBy)
      .then(user => {
        this.channelCreator = user;
      })
  }


  /**
   * loads all message reactions and groups them after DOM is loaded
   */
  loadAllMessageReactions() {
    this.messageList$.pipe(
      take(1),
      switchMap(messages => {
        const reactionObservables = messages.map(message =>
          this.database.loadChannelMessagesReactions(this.activeUser.userId, this.channel.channelId, message.messageId)
        );
        return combineLatest(reactionObservables);
      })
    ).subscribe(reactionLists => {
      this.reactions = reactionLists.flat();
      this.chatService.reactions = this.reactions;
      this.messageList$.pipe(take(1)).subscribe(messages => {
        this.chatService.groupReactions(messages);
      });
    });
  }


  /**
   * saves the new message into the database and displays it in the chat area
   */
  saveNewMessage() {
    if (this.content == '' && this.fileService.downloadURL == '') {
      this.displayEmptyContentError();
    } else {
      let newMessage: ChannelMessage = this.database.createChannelMessage(this.channel, this.content, this.activeUser.userId, this.fileService.downloadURL);
      this.database.addChannelMessage(this.channel, newMessage).then(() => {
        this.content = '';
        const newContent = '';
        this.mAndC.content.next(newContent);
        
        // Aktualisieren Sie die messageList$
        this.messageList$ = this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId);
        
        // Aktualisieren Sie auch die originalMessageList$
        this.originalMessageList$ = this.messageList$;
  
        // Laden Sie die Reaktionen neu
        this.loadAllMessageReactions();
  
        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);
        
        this.fileService.downloadURL = '';
      }).catch(error => {
        console.error("Error adding message: ", error);
        // Hier können Sie eine Fehlermeldung für den Benutzer anzeigen
      });
    }
  }


  /**
   * avoids sending empty messages
   */
  displayEmptyContentError() {
    this.fileUploadError = 'Das abschicken von leeren Nachrichten ist nicht möglich';
    setTimeout(() => {
      this.fileUploadError = null;
    }, 2500);
  };


  /**
   * saves the message reaction to the database
   * @param event
   * @param message channelmessage object
   * @param userId userid
   * @param reactionbar infos about the last two used emoji
   * @returns returns nothing if the user already used the selected emoji
   */
  async saveNewMessageReaction(event: any, message: ChannelMessage, userId: string, reactionbar?: string) {
    let emoji: string = reactionbar || event.emoji.native;

    const userAlreadyReacted = this.reactions.some(reaction =>
      reaction.messageId === message.messageId && reaction.emoji === emoji && reaction.userId === userId
    );

    if (userAlreadyReacted) return;

    await this.createAndSaveChannelReaction(message, emoji, userId);
    this.loadAllMessageReactions();

    this.chatService.checkIfEmojiIsAlreadyInUsedLastEmojis(this.activeUser, emoji, userId);
    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser();
    this.mAndC.selectedMessageId = null;
  }


  /**
     * Creates and saves the reaction in the database
     * @param message channelnmessage object
     * @param emoji emoji
     * @param userId userId
     */
  private async createAndSaveChannelReaction(message: ChannelMessage, emoji: string, userId: string): Promise<void> {
    this.reactions = [];
    let reaction = this.database.createChannelMessageReaction(emoji, userId, this.activeUser.name, message);
    await this.database.addChannelMessageReaction(this.channel, message, reaction);
    await this.loadAllMessageReactions();
    this.chatService.reactions = this.reactions;
  }


  /**
   * updates the edited channel message to the database
   * @param message channelmessageobject
   */
  updateMessage(message: ChannelMessage) {
    const updatedContent = this.editService.editContent;
    this.editService.isEditing = false;
    this.editService.selectedMessageIdEdit = null;
    message.content = updatedContent;
    this.database.updateChannelMessage(message, this.channel)
  }


  /**
   * focuses the inputfield of the textarea after
   * initialization
   */
  setFocus(): void {
    setTimeout(() => {
      this.myTextarea.nativeElement.focus();
    }, 10);
  }


  /**
   * scrolls to the newest message of the channel
   */
  scrollToBottom(): void {
    setTimeout(() => {
        this.lastDiv.nativeElement.scrollIntoView();
     }, 250);
  }


  /**
   * opens the dialog to upload a file
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }


  /**
   * opens a dialog where new members can be added to the channel
   */
  showAddMember() {
    const channelInfo = this.dialog.open(DialogAddAdditionalMemberComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.afterClosed().subscribe(() => {
      this.isdataLoaded = false;
      this.memberList = [];
      this.loadMemberList().then(() => {
        this.isdataLoaded = true;
      })
    })
  }


  /**
   * opens the dialog with a list of all channel members
   */
  showMemberList() {
    const channelInfo = this.dialog.open(DialogShowMemberListComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.afterClosed().subscribe((conversation) => {
      if (conversation) {
        this.openConversation.emit(conversation)
      }
    })
  }


  /**
   * opens the dialog with the channel settings
   */
  showChannelSettings() {
    const channelInfo = this.dialog.open(DialogShowChannelSettingsComponent, {
      panelClass: 'customDialog'
    })
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.componentInstance.channelCreator = this.channelCreator;
    channelInfo.afterClosed().subscribe(result => {
      if (result) {
        this.userLeftChannel.emit(true);
      }
    })
  }


  /**
   * creates a new or opens an already existing thred
   * @param message channel message object
   */
  createOrOpenThread(message: ChannelMessage) {
    if (message.threadId !== '') {
      this.database.loadSpecificChannelThread(message, this.channel)
        .then(oldThread => {
          this.openThread(oldThread);
        })
        .catch(error => console.error('Error loading thread:', error));
    } else {
      const thread: ChannelThread = this.database.createChannelThread(message, this.channel);
      this.database.addChannelThread(thread, this.channel)
      this.database.updateMessageChannelThreadId(thread, this.channel)
      this.openThread(thread);
    }
  }


  /**
   * Opens a thread
   * @param thread thread that should be opened
   */
  openThread(thread: ChannelThread) {
    this.emitThread.emit(thread)
  }
}