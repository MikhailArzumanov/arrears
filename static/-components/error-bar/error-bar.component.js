export class ErrorBarComponent extends HTMLElement{
    
    
    constructor(){
        super();
        this.setAttribute('class', 'errorBar');
        this.addEventListener('click', this.onClick);
        this.style.opacity = "0.0";
    }

    show(message, duration, width){
        this.innerHTML = message;
        this.style.width = `${width}px`;
        this.style.left = `calc(50% - ${width}px/2`;
        this.style.opacity = "1.0";
        if(duration != 0){
            this.hideWithDelay(duration)
        }
    }

    hideWithDelay(delay){
        setTimeout(()=>this.hide(), delay);
    }

    hide(){
        this.style.opacity = "0.0";
        this.innerHtml = "";
    }

    onClick(){
        this.hide();
    }

    connectedCallback(){
        //console.log('Error bar component was connected');
    }

}