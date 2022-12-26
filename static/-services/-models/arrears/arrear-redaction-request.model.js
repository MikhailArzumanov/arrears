export class ArrearRedactionRequest{
    authData       ;
    arrearSheetData;
    constructor(authData, arrearSheetData){
        this.authData        =  authData       ;
        this.arrearSheetData =  arrearSheetData;
    }
}