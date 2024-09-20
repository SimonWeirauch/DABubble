export class Thread {
    conversationId: string;
    messageId: string;
    threadId: string;
    threadNameCreator: string;
    threadNameRecipient: string;
    createdBy: string;
    recipientId: string;

    constructor(obj?: any){
        this.conversationId = obj ? obj.conversationId : '';
        this.messageId = obj ? obj.messageId : '';
        this.threadId = obj ? obj.threadId : '';
        this.threadNameCreator = obj ? obj.threadNameCreator : '';
        this.threadNameRecipient = obj ? obj.threadNameRecipient : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.recipientId = obj ? obj.recipientId : '';
    }

    public toJSON(){
        return {
            conversationId: this.conversationId,
            messageId: this.messageId,
            threadId: this.threadId,
            threadNameCreator: this.threadNameCreator,
            threadNameRecipient: this.threadNameRecipient,
            createdBy: this.createdBy,
            recipientId: this.recipientId,
        }
    }
}