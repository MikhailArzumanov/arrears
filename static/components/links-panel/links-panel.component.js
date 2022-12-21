import { Link } from "../-models/link.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { redirect } from "../../functions/redirect.js";


export class LinksPanelComponent extends HTMLElement{

    links = [
        new Link('/faculties',      'Институты',        ['admin']),
        new Link('/departments',    'Кафедры',          ['admin', 'faculty']),
        new Link('/groups',         'Группы',           ['admin', 'faculty', 'department']),
        new Link('/students',       'Студенты',         ['admin', 'faculty', 'department', 'group']),
        new Link('/disciplines',    'Дисциплины',       ['admin', 'faculty', 'department']),
        new Link('/arrears',        'Долговые листы',   ['admin', 'faculty', 'department', 'group', 'magister', 'student']),
    ];

    constructor(){
        super();
        this.setAttribute('class', 'linksPanel');
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
            let logoutBtn = document.createElement('button');
            logoutBtn.innerHTML = 'Выйти';
            logoutBtn.onclick = this.logout;
            logoutBtn.setAttribute('class', 'panelLogoutButton');
            this.appendChild(logoutBtn);            
        }
    }

    logout(){
        AuthorizedService.logout();
        redirect('/authorization');
    }

}