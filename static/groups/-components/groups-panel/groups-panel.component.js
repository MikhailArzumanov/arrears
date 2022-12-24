import { AuthorizedService } from "../../../-services/-base-services/authorized.service.js";
import { Link, LIST_LINK_TEXT, REDACTION_LINK_TEXT } from "../../../-components/-models/link.model.js";


export class GroupsPanelComponent extends HTMLElement{

    links = [
        new Link('/groups/list',      LIST_LINK_TEXT,      ['admin','faculty','department']),
        new Link('/groups/redaction', REDACTION_LINK_TEXT, ['admin','faculty','department']),
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