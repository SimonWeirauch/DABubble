export class Reaction {
    emoji: string;
    userId: string;
    userName: string;
    messageId: string;
    reactionId: string;

    constructor(obj?: any){
        this.emoji = obj ? obj.emoji : '';
        this.userId = obj ? obj.userId : '';
        this.userName = obj ? obj.userName : '';
        this.messageId = obj ? obj.messageId : '';
        this.reactionId = obj ? obj.reactionId : '';
    }

    public toJSON(){
        return {
            emoji: this.emoji,
            userId: this.userId,
            userName: this.userName,
            messageId: this.messageId,
            reactionId: this.reactionId,
        }
    }
}