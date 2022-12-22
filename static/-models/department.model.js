export class Department{
    id       ;
    login    ;
    password ;
    name     ;
    shortName;
    facultyId;
    faculty  ;
    constructor(id,login,password,name,shortName,facultyId,faculty=null){
        this.id        = id       ; 
        this.login     = login    ; 
        this.password  = password ;
        this.name      = name     ; 
        this.shortName = shortName;
        this.facultyId = facultyId;
        this.faculty   = faculty  ;
    }
}