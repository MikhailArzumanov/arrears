export class Student{

    id            ;
    login         ;
    password      ;
    surname       ;
    name          ;
    patronymicName;
    group         ;
    groupId       ;
    constructor(id, login,password,surname,name,patronymicName,groupId,group=null){
        this.id             = id            ;
        this.login          = login         ;
        this.password       = password      ;
        this.surname        = surname       ;
        this.name           = name          ;
        this.patronymicName = patronymicName;
        this.group          = group         ;
        this.groupId        = groupId       ;
    }
}