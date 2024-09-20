import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConversationMessage } from '../../../models/conversationMessage.class';
import { Reaction } from '../../../models/reactions.class';
import { ChannelMessage } from '../../../models/channelMessage.class';
import { User } from '../../../models/user.class';
import { DatabaseService } from '../../database.service';
import { ThreadMessage } from '../../../models/threadMessage';
import { ChannelThreadMessage } from '../../../models/channelThreadMessage';
import { UserService } from '../../user.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralChatService {


  constructor(public databaseService: DatabaseService, public userService: UserService) { }

  private groupedReactions: BehaviorSubject<Map<string, Array<{ emoji: string, count: number, users: string[] }>>> = new BehaviorSubject(new Map());
  groupedReactions$ = this.groupedReactions.asObservable();
  reactions: Array<Reaction> = [];

  private groupedReactionsThread: BehaviorSubject<Map<string, Array<{ emoji: string, count: number, users: string[] }>>> = new BehaviorSubject(new Map());
  groupedReactionsThread$ = this.groupedReactionsThread.asObservable();
  reactionsThread: Array<Reaction> = [];

/**
 * Groupes together all reations of a chat to a new map with count, names for every emoji
 * @param messageList The List of all messages within a chat
 */
  async groupReactions(messageList: Array<ConversationMessage> | Array<ChannelMessage>) {
    const groupedReactions = new Map<string, Array<{ emoji: string, count: number, users: string[] }>>();
    messageList.forEach(message => {
      const reactionMap = new Map<string, { count: number, users: string[] }>();
      this.reactions
        .filter(reaction => reaction.messageId === message.messageId)
        .forEach(reaction => {
          if (!reactionMap.has(reaction.emoji)) {
            reactionMap.set(reaction.emoji, { count: 0, users: [] });
          }
          const reactionData = reactionMap.get(reaction.emoji)!;
          reactionData.count += 1;
          reactionData.users.push(reaction.userName);
        });

      groupedReactions.set(
        message.messageId,
        Array.from(reactionMap.entries()).map(([emoji, { count, users }]) => ({ emoji, count, users }))
      );
    });

    this.groupedReactions.next(groupedReactions);
  }

  /**
   * Groupes together all reations of a thread chat to a new map with count, names for every emoji
   * @param messageList The List of all messages within a thread
   */
  async groupReactionsThread(messageList: Array<ThreadMessage> | Array<ChannelThreadMessage>) {
    const groupedReactionsThread = new Map<string, Array<{ emoji: string, count: number, users: string[] }>>();
    messageList.forEach(message => {
      const reactionMap = new Map<string, { count: number, users: string[] }>();
      this.reactionsThread
        .filter(reaction => reaction.messageId === message.threadMessageId)
        .forEach(reaction => {
          if (!reactionMap.has(reaction.emoji)) {
            reactionMap.set(reaction.emoji, { count: 0, users: [] });
          }
          const reactionData = reactionMap.get(reaction.emoji)!;
          reactionData.count += 1;
          reactionData.users.push(reaction.userName);
        });

      groupedReactionsThread.set(
        message.threadMessageId,
        Array.from(reactionMap.entries()).map(([emoji, { count, users }]) => ({ emoji, count, users }))
      );
    });

    this.groupedReactionsThread.next(groupedReactionsThread);

  }

/**
 * Checks if the last used emoji is already in the last used two emojis of the user
 * @param user User who reacted 
 * @param emoji Emoji with which was reacted 
 * @param userId Id of the user that reacted 
 */
  checkIfEmojiIsAlreadyInUsedLastEmojis(user: User, emoji: string, userId: string) {
    let usedLastEmoji = user.usedLastTwoEmojis[0]

    let usedSecondEmoji = user.usedLastTwoEmojis[1]
    if (usedSecondEmoji != emoji && usedLastEmoji != emoji) {
      this.databaseService.updateUsedLastTwoEmojis(userId, usedSecondEmoji || usedLastEmoji, emoji)
    }
  }

  emojiInfoVisible: boolean = false;
  hoveredReaction: { emoji: string, count: number, users: string[] } | null = null;

  /**
   * Shows the reaction info
   * @param reaction the grouped together reaction
   */
  showTooltip(reaction: { emoji: string, count: number, users: string[] }) {
    this.hoveredReaction = reaction;
    this.emojiInfoVisible = true;
  }

  /**
   * Hides the reaction info
   */
  hideTooltip() {
    this.emojiInfoVisible = false;
    this.hoveredReaction = null;
  }

  /**
   * Displays all names of users that reacted with an emojis
   * @param users Names of the user that reacted with an emoji
   * @returns 
   */
  getReactionUser(users: string[]): string {
    const userName = this.userService.activeUserObject.name;
    const userText = users.map(user => user === userName ? 'du' : user);
    const formattedUserText = userText.map(user => `${user}`);

    if (userText.length === 1) {
      return formattedUserText[0];
    } else if (userText.length === 2) {
      return `${formattedUserText[0]} und ${formattedUserText[1]}`;
    } else {
      return `${formattedUserText.slice(0, -1).join(', ')} und ${formattedUserText[formattedUserText.length - 1]}`;
    }
  }

/**
 *  Displays the necessary text fot the emoji info 
 * @param users the user objects of the users that reacted with an emoji
 * @returns 
 */
  getReactionText(users: string[]): string {
    const userName = this.userService.activeUserObject.name;
    const userText = users.map(user => user === userName ? 'du' : user);

    if (userText.length === 1) {
      return userText[0] === 'du' ? 'hast darauf reagiert' : 'hat darauf reagiert';
    } else {
      return 'haben darauf reagiert';
    }
  }
}