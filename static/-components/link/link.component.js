import { redirect } from "../../-functions/redirect.js";

export const LIST_LINK_TEXT      = "Список";
export const REDACTION_LINK_TEXT = "Редактировать";

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