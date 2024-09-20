export class Channel {
    createdAt: Date;
    createdBy: string;
    description: string;
    membersId: Array<string>;
    name: string;
    channelId: string;


    constructor(obj?: any){
        this.createdAt = obj ? obj.createdAt : '';
        this.createdBy = obj ? obj.createdBy : '';
        this.description = obj ? obj.description : 'test';
        this.membersId = obj ? obj.membersId : [];
        this.name = obj ? obj.name : '';
        this.channelId = obj ? obj.channelId : '';
    }

    public toJSON(){
        return {
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            description: this.description,
            membersId: this.membersId,
            name: this.name,
            channelId: this.channelId,
        }
    }
}