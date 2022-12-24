export class Magister{
    id              ;
    login           ;
    password        ;
    surname         ;
    name            ;
    patronymicName  ;
    department      ;
    departmentId    ;
    disciplines     ;
    constructor(id,login,password,surname,name,patronymicName,departmentId,department=null,disciplines=[]){
        this.id             = id             ;
        this.login          = login          ;
        this.password       = password       ;
        this.surname        = surname        ;
        this.name           = name           ;
        this.patronymicName = patronymicName ;
        this.department     = department     ;
        this.departmentId   = departmentId   ;
        this.disciplines    = disciplines    ;
    }
    
}