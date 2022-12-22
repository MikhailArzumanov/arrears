export class DepartmentRedactionRequest{
    authData;
    departmentData;
    constructor(authData, departmentData){
        this.authData       = authData      ;
        this.departmentData = departmentData;
    }
}