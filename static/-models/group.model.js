export class Group{
    id          ;
    login       ;
    password    ;
    name        ;
    department  ;
    departmentId;
    disciplines ;
    constructor(id,login,password,name,departmentId,department=null,disciplines=[]){
        this.id           = id          ;
        this.login        = login       ;
        this.password     = password    ;
        this.name         = name        ;
        this.department   = department  ;
        this.departmentId = departmentId;
        this.disciplines  = disciplines ;
    }
}