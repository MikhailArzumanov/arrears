import { redirect } from "../../-functions/redirect.js";

export class LinkComponent extends HTMLElement{
    constructor(){
        super();
        this.setAttribute('class', 'panelLink');
        this.addEventListener('click', this.onClick);
    }
    render(link){
        this.innerHTML = link.text;
        this.setAttribute('href', link.href);
    }
    onClick(){
        let ref = this.getAttribute('href');
        if(ref != window.location.href){
            redirect(ref);
        }
    }
}