export class StudentRedactionRequest{
    authData    ;
    studentData;
    constructor(authData, studentData){
        this.authData    = authData   ;
        this.studentData = studentData;
    }
}