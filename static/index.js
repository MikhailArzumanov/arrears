import { fadeIn } from "./-functions/fade.js";
import { redirectIfIsntAuthorized } from "./-functions/redirection.js";
import { AuthorizedService } from "./-services/-base-services/authorized.service.js";
redirectIfIsntAuthorized();
setTimeout(fadeIn,400);
init();

function init(){
    let type = AuthorizedService.getAuthorizedType;
    let data = AuthorizedService.getAuthorizedData;
    let annotation = "";
    switch(type){
        case "group":
            annotation += "Группа ";
        case "faculty":
        case "department":
            annotation += data.name;
            break;
        case "magister":
        case "student":
            annotation = `${data.surname} ${data.name} ${data.patronymicName}`;
            break;
        case "admin":
            annotation = 'администратор'
    } 

    let paragraph = document.getElementById('annotation');
    paragraph.innerHTML += annotation;
    if(type != 'admin') 
        paragraph.innerHTML += '<a href="/self-redaction">(редактировать запись)</a>'
}