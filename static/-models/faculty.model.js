export class Faculty{
    id       ;
    login    ;
    password ;
    name     ;
    shortName;
    constructor(id,login,password,name,shortName){
        this.id        = id       ; 
        this.login     = login    ; 
        this.password  = password ;
        this.name      = name     ; 
        this.shortName = shortName;
    }
}