import { Injectable } from '@angular/core';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { DatabaseService } from '../../database.service';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../user.service';

@Injectable({
  providedIn: 'root'
})
export class MentionAndChannelDropdownService {

  content: BehaviorSubject<string> = new BehaviorSubject<string>('');
  contentThread: BehaviorSubject<string> = new BehaviorSubject<string>('');
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;

  focusTrigger = new BehaviorSubject<void>(undefined);
  selectedMessageId: string | null = null;
  showEmoticons: boolean = false;
  showMention: boolean = false;
  showEmoticonsThread: boolean = false;
  showMentionThread: boolean = false;


  constructor(private data: DatabaseService, public userService: UserService) {
    this.loadUsersOfUser();
    this.loadChannlesofUser()
  }

/**
 * load all useres known by the active user
 */
  loadUsersOfUser() {
    this.data.loadAllUsers().then(userList => {
      this.allUsers = userList;
    })
  }

/**
 * load all channels of the active user
 */
  loadChannlesofUser() {
    this.data.loadAllUserChannels(this.userService.activeUserObject.userId).then(channel => {
      this.allChannels = channel;
    })
  }
  showDropdown: boolean = false;
  showDropdownThread: boolean = false;
  filteredItems: Array<User | Channel> = [];

  onInput(event: any, thread?: string): void {
    const input = event.target.value;
    if (thread) {
      this.contentThread.next(input);
    } else {
      this.content.next(input);
    }
    
    const cursorPosition = event.target.selectionStart;

    if (cursorPosition > 0) {
      const lastTypedChar = input[cursorPosition - 1];
      if (lastTypedChar === '#' || lastTypedChar === '@') {
        if (thread) {
          this.showDropdownThread = true;
        } else {
          this.showDropdown = true;
        }
        this.filterItems(input, lastTypedChar, cursorPosition);
      } else if (this.showDropdown) {
        const hashIndex = input.lastIndexOf('#', cursorPosition - 1);
        const atIndex = input.lastIndexOf('@', cursorPosition - 1);

        if (hashIndex === -1 && atIndex === -1) {
          if (thread) {
            this.showDropdownThread = false;
          } else {
            this.showDropdown = false; 
          }
        }
        else if (lastTypedChar === ' ' || cursorPosition === 0) {
          if (thread) {
            this.showDropdownThread = false;
          } else {
            this.showDropdown = false; 
          }
        }
        else {
          const triggerChar = hashIndex > atIndex ? '#' : '@';
          this.filterItems(input, triggerChar, cursorPosition);
        }
      }
    } else {
      if (thread) {
        this.showDropdownThread = false;
      } else {
        this.showDropdown = false; 
      }
    }
  }

  /**
   * shows items that fit in the search 
   * @param input input after a triggerchar
   * @param triggerChar '#' : '@' in the input that trigger a search 
   * @param cursorPosition current cursor position
   */
  filterItems(input: string, triggerChar: string, cursorPosition: number): void {
    const queryArray = input.slice(0, cursorPosition).split(triggerChar);
    const query = queryArray.length > 1 ? queryArray.pop()?.trim().toLowerCase() : '';

    if (query !== undefined) {
      if (triggerChar === '#') {
        this.filteredItems = this.allChannels.filter(channel => channel.name.toLowerCase().includes(query));
      } else if (triggerChar === '@') {
        this.filteredItems = this.allUsers.filter(user => user.name.toLowerCase().includes(query));
      }
    }
  }

/**
 * selects the chosen item from the filtered ones 
 * @param item name of a user or channel
 * @param textarea the textarea in witch the user writes 
 * @param thread variable to check if the item was selected in a thread
 */
  selectItem(item: User | Channel, textarea: HTMLTextAreaElement, thread?: string): void {
    const triggerChar = item.hasOwnProperty('channelId') ? '#' : '@';
    const currentContent = textarea.value;
    const cursorPosition = textarea.selectionStart;

    const lastTriggerIndex = currentContent.lastIndexOf(triggerChar, cursorPosition - 1);

    const beforeTrigger = currentContent.slice(0, lastTriggerIndex);
    const afterTrigger = currentContent.slice(cursorPosition);

    const newContent = beforeTrigger + `${triggerChar}${item.name} ` + afterTrigger;

    textarea.value = newContent;
    if (thread) {
      this.contentThread.next(newContent);
      this.showDropdownThread = false;
    } else {
      this.content.next(newContent);
      this.showDropdown = false;
    }

    const newCursorPosition = beforeTrigger.length + triggerChar.length + item.name.length + 1;
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    textarea.focus();
  }

  /**
   * focuses the textarea 
   */
  triggerFocus() {
    this.focusTrigger.next();
  }

  /**
   * @returns the focusTrigger obseravle 
   */
  getFocusTrigger() {
    return this.focusTrigger.asObservable();
  }

/**
 * 
 * @param thread shows and hides the emojis
 */
  toggleEmoticons(thread?: string) {
    if (thread) {
      if (this.showMentionThread) {
        this.showMentionThread = false;
      }
      this.showEmoticonsThread = !this.showEmoticonsThread;
    } else {
      if (this.showMention) {
        this.showMention = false;
      }
      this.showEmoticons = !this.showEmoticons;
    }

  }


  /**
   * shows and hides the reactionsbar of a message 
   * @param messageId the message if of the message thats reactionsbar need to be toggled
   */
  toggleEmoticonsReactionbar(messageId: string) {
    if (this.selectedMessageId === messageId) {
      this.selectedMessageId = null;
    } else {
      this.selectedMessageId = messageId;
    }
  }

  /**
   * shows and hides the mentions
   * @param thread variable to check if mentions within a thread a toggled 
   */
  toggleMention(thread?: string) {
    if (thread) {
      if (this.showEmoticonsThread) {
        this.showEmoticonsThread = false;
      }
      this.showMentionThread = !this.showMentionThread;
    } else {
      if (this.showEmoticons) {
        this.showEmoticons = false;
      }
      this.showMention = !this.showMention;
    }

  }

  /**
   * adds emoji to textarea content 
   * @param event emoji elections
   * @param thread variable to check if emoji was selected within a thread
   */
  addEmoji(event: any, thread?: string) {
    if (thread) {
      const currentValue = this.contentThread.value;
      const newValue = `${currentValue}${event.emoji.native}`;
      this.contentThread.next(newValue);
      this.showEmoticonsThread = false;
    } else {
      const currentValue = this.content.value;
      const newValue = `${currentValue}${event.emoji.native}`;
      this.content.next(newValue);
      this.showEmoticons = false;
      this.triggerFocus();
    }
  }

  /**
   * adds mentions to textarea content
   * @param mention the added mention 
   * @param thread variable to check if mentions was selected within a thread
   */
  addMention(mention: string, thread?: string) {
    if (thread) {
      const currentValue = this.contentThread.value;
      const newValue = `${currentValue} @${mention}`
      this.contentThread.next(newValue);
      this.showMentionThread = false;
    } else {
      const currentValue = this.content.value;
      const newValue = `${currentValue} @${mention}`
      this.content.next(newValue);
      this.showMention = false;
      this.triggerFocus();
    }
  }
}
