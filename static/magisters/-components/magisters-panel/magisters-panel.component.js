import { AuthorizedService } from "../../../-services/-base-services/authorized.service.js";
import { Link } from "../../../-components/-models/link.model.js";


export class MagistersPanelComponent extends HTMLElement{

    links = [
        new Link('/magisters/list',      'Список',        ['admin','faculty','department']),
        new Link('/magisters/redaction', 'Редактировать', ['admin','faculty','department']),
    ];

    constructor(){
        super();
        this.setAttribute('class', 'magistersPanel');
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