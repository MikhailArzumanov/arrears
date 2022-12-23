export class GroupRedactionRequest{
    authData ;
    groupData;
    constructor(authData, groupData){
        this.authData  = authData ;
        this.groupData = groupData;
    }
}