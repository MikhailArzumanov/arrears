export class MagisterRedactionRequest{
    authData ;
    magisterData;
    constructor(authData, magisterData){
        this.authData  = authData ;
        this.magisterData = magisterData;
    }
}