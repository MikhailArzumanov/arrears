export class Arrear{
    id           ;
    formationDate;      
    status       ;   
    mark         ;   
    magister     ; 
    magisterId   ;      
    discipline   ;  
    disciplineId ;      
    student      ;  
    studentId    ;
    constructor(id,formationDate,status,mark,magisterId,disciplineId,studentId,magister=null,discipline=null,student=null){
        this.id            = id           ;
        this.formationDate = formationDate;
        this.status        = status       ;
        this.mark          = mark         ;
        this.magister      = magister     ;
        this.magisterId    = magisterId   ;
        this.discipline    = discipline   ;
        this.disciplineId  = disciplineId ;
        this.student       = student      ;
        this.studentId     = studentId    ;
    }      
}