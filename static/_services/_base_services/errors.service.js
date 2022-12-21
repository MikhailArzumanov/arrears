export class ErrorsService{
    static errorStack = [];

    static pushError(errorMsg){
        this.errorStack.push(errorMsg);
    }

    static getLastError(){
        return this.errorStack.pop();
    }

}