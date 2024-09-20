import { Timestamp } from "firebase/firestore";

export class ChannelThreadMessage {
    threadMessageId: string;
    channelId: string;
    content: string;
    createdAt: Timestamp;
    createdBy: string;
    fileUrl: string;
    threadId: string;
    messageId: string;


    constructor(obj?: any){
        this.threadMessageId = obj ? obj.threadMessageId : '';
        this.channelId = obj ? obj.channelId : '';
        this.content = obj ? obj.content : '';
        this.createdAt = obj ? obj.createdAt : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.fileUrl = obj ? obj.fileUrl : '';
        this.threadId = obj ? obj.threadId : '';
        this.messageId = obj ? obj.messageId : '';
    }

    public toJSON(){
        return {
            threadMessageId: this.threadMessageId,
            channelId: this.channelId,
            content: this.content,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            fileUrl: this.fileUrl,
            threadId: this.threadId,
            messageId: this.messageId,
        }
    }
}
