export class FacultyRedactionRequest{
    authData;
    facultyData;
    constructor(authData, facultyData){
        this.authData    = authData   ;
        this.facultyData = facultyData;
    }
}