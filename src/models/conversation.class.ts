export class Conversation {
    conversationId: string;
    conversationNameCreator: string;
    conversationNameRecipient: string;
    createdBy: string;
    fileUrl: string;
    recipientId: string;
    


    constructor(obj?: any){
        this.conversationId = obj ? obj.conversationId : '';
        this.conversationNameCreator = obj ? obj.conversationNameCreator : '';
        this.conversationNameRecipient = obj ? obj.conversationNameRecipient : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.fileUrl = obj ? obj.fileUrl : '';
        this.recipientId = obj ? obj.recipientId : '';
       
    }

    public toJSON(){
        return {
            conversationId: this.conversationId,
            conversationNameCreator: this.conversationNameCreator,
            conversationNameRecipient: this.conversationNameRecipient,
            createdBy: this.createdBy,
            fileUrl: this.fileUrl,
            recipientId: this.recipientId,
        }
    }

}