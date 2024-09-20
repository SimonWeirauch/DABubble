import { Timestamp } from "firebase/firestore";

export class ChannelMessage {
    channelId: string;
    content: string;
    createdAt: Timestamp;
    createdBy: string;
    fileUrl: string;
    threadId: string;
    messageId: string;
    threadMessageCount: number;
    lastThreadMessage: Timestamp | null;


    constructor(obj?: any){
        this.channelId = obj ? obj.channelId : '';
        this.content = obj ? obj.content : '';
        this.createdAt = obj ? obj.createdAt : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.fileUrl = obj ? obj.fileUrl : '';
        this.threadId = obj ? obj.threadId : '';
        this.messageId = obj ? obj.messageId : '';
        this.threadMessageCount = obj ? obj.threadMessageCount : '';
        this.lastThreadMessage = obj ? obj.lastThreadMessage : '';
    }

    public toJSON(){
        return {
            channelId: this.channelId,
            content: this.content,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            fileUrl: this.fileUrl,
            threadId: this.threadId,
            messageId: this.messageId,
            threadMessageCount: this.threadMessageCount,
            lastThreadMessage: this.lastThreadMessage,
        }
    }

}