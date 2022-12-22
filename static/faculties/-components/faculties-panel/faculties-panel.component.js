import { AuthorizedService } from "../../../-services/-base-services/authorized.service.js";
import { redirect } from "../../../-functions/redirect.js";
import { Link } from "../../../-components/-models/link.model.js";


export class FacultiesPanelComponent extends HTMLElement{

    links = [
        new Link('/faculties/list',      'Список', ['admin']),
        new Link('/faculties/redaction', 'Редактировать', ['admin']),
    ];

    constructor(){
        super();
        this.setAttribute('class', 'facultiesPanel');
        let currentLink     = this.getAttribute('currentLink');
        let authorizedType  = AuthorizedService.getAuthorizedType;
        if(authorizedType){
            for(let theLink of this.links){
                if(theLink.accessTo.includes(authorizedType)){
                    let link = document.createElement('panel-link');
                    this.appendChild(link);
                    setTimeout(()=> link.render(theLink), 120);
                    if(theLink.href == currentLink) link.style.textDecoration = 'underline';
                }
            }        
        }
    }

}