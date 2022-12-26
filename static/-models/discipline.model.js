export class Discipline{
    id             ;
    name           ;
    shortName      ;
    passType       ;
    year           ;
    semestr        ;
    groups         ;
    magisters      ;

    constructor(id, name, shortName, passType, year, semestr, groups=[], magisters=[]){
        this.id             = id            ;
        this.name           = name          ;
        this.shortName      = shortName     ;
        this.passType       = passType      ;
        this.year           = year          ;
        this.semestr        = semestr       ;
        this.groups         = groups        ;
        this.magisters      = magisters     ;
    }
}