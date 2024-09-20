export class ChannelThread {
    channelId: string;
    messageId: string;
    threadId: string;
    threadNameCreator: string;
    threadNameRecipients: Array<string>;
    createdBy: string;
    recipientIds: Array<string>;;

    constructor(obj?: any){
        this.channelId = obj ? obj.channelId : '';
        this.messageId = obj ? obj.messageId : '';
        this.threadId = obj ? obj.threadId : '';
        this.threadNameCreator = obj ? obj.threadNameCreator : '';
        this.threadNameRecipients = obj ? obj.threadNameRecipients : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.recipientIds = obj ? obj.recipientIds : '';
    }

    public toJSON(){
        return {
            channelId: this.channelId,
            messageId: this.messageId,
            threadId: this.threadId,
            threadNameCreator: this.threadNameCreator,
            threadNameRecipients: this.threadNameRecipients,
            createdBy: this.createdBy,
            recipientIds: this.recipientIds,
        }
    }
}