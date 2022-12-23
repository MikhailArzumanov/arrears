import { AuthorizedService } from "../../../-services/-base-services/authorized.service.js";
import { Link } from "../../../-components/-models/link.model.js";


export class GroupsPanelComponent extends HTMLElement{

    links = [
        new Link('/groups/list',      'Список',        ['admin','faculty']),
        new Link('/groups/redaction', 'Редактировать', ['admin','faculty']),
    ];

    constructor(){
        super();
        this.setAttribute('class', 'groupsPanel');
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