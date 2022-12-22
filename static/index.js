import { fadeIn } from "./-functions/fade.js";
import { redirect } from "./-functions/redirect.js";
import { redirectIfIsntAuthorized } from "./-functions/redirection.js";
import { AuthorizedService } from "./-services/-base-services/authorized.service.js";

redirectIfIsntAuthorized();
init();
setTimeout(fadeIn,400);

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
    paragraph.innerHTML += annotation +' ';
    if(type != 'admin'){
        let link = document.createElement('a');
        link.href = '/self-redaction';
        link.innerHTML = '(редактировать запись)';
        link.onclick = ()=>{
            redirect('/self-redaction');
        }
        paragraph.appendChild(link);
    }
}