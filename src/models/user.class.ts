export class User {
    email: string;
    name: string;
    status: string;
    avatarUrl: string | undefined | null;
    userId: string;
    logIn: string;
    usedLastTwoEmojis: Array<string> | string[];
    uid: string | null;

    constructor(obj?: any){
        this.email = obj ? obj.email : '';
        this.name = obj ? obj.name : '';
        this.status = obj ? obj.status : 'offline';
        this.avatarUrl = obj ? obj.avatarUrl : '/da-bubble/assets/img/unUsedDefault.png';
        this.userId = obj ? obj.userId : '';
        this.logIn = obj && obj.logIn || 'https://bubble.ishakates.com/';
        this.usedLastTwoEmojis = obj && obj.usedLastTwoEmojis ? obj.usedLastTwoEmojis : ['✅', '🙌'];
        this.uid = obj ? obj.uid : null;
    }

    public toJSON(){
        return {
            email: this.email,
            name: this.name,
            status: this.status,
            avatarUrl: this.avatarUrl,
            userId: this.userId,
            logIn: this.logIn,
            usedLastTwoEmojis: this.usedLastTwoEmojis,
            uid: this.uid
        }
    }
}
