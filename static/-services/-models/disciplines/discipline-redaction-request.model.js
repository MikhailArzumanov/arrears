export class DisciplineRedactionRequest{
    discipline  ;
    groupsIds   ;
    magistersIds;
    constructor(discipline, groupsIds, magistersIds){
        this.discipline   = discipline  ;
        this.groupsIds    = groupsIds   ;
        this.magistersIds = magistersIds;
    }
}