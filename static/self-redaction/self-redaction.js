import { fadeIn } from "../-functions/fade.js";
import { redirect } from "../-functions/redirect.js";
import { ADDRESS, redirectIfIsntAuthorized } from "../-functions/redirection.js";
import { showError } from "../-functions/showError.js";
import { getValueById } from "../-functions/valById.js";
import { AuthData } from "../-models/auth-data.model.js";
import { AuthorizedService } from "../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../-services/departments.service.js";
import { FacultiesService } from "../-services/faculties.service.js";
import { GroupsService } from "../-services/groups.service.js";
import { MagistersService } from "../-services/magisters.service.js";
import { StudentsService } from "../-services/students.service.js";

let authorizedType;
let errorBar;

redirectIfIsntAuthorized();
init();
setTimeout(fadeIn, 1200);

function init(){
    authorizedType = AuthorizedService.getAuthorizedType;
    let authorizedData = AuthorizedService.getAuthorizedData;
    let annotation = "";
    let logAnnotation = "";
    switch(authorizedType){
        case "admin":
            redirect(ADDRESS);
            break;
        case "faculty":
            annotation += "зайдите как администратор";
            logAnnotation += authorizedData.name;
            break;
        case "department":
            annotation += "зайдите под именем института";
            logAnnotation += authorizedData.name;
            break;
        case "group":
            annotation += "обратитесь к представителям кафедры";
            logAnnotation += authorizedData.name;
            break;
        case "magister":
            annotation += "зайдите под именем кафедры";
            logAnnotation += `${authorizedData.surname} ${authorizedData.name} ${authorizedData.patronymicName}`;
            break;
        case "student":
            annotation += "обратитесь к старосте группы";
            logAnnotation += `${authorizedData.surname} ${authorizedData.name} ${authorizedData.patronymicName}`;
            break;
        default:
            console.log("Authorized type error");
    }
    let logAnnotationBlock = document.getElementById('redacting');
    logAnnotationBlock.innerHTML += logAnnotation + "'.";
    let annotationBlock = document.getElementById('annotation');
    annotationBlock.innerHTML += annotation + ".";
    let confirmButton = document.getElementById('confirmBtn');
    confirmButton.onclick = confirm;
    errorBar = document.getElementsByTagName('error-bar')[0];
}



async function confirm(){
    let oldLogin    = getValueById("oldLoginField");
    let oldPassword = getValueById("oldPasswordField");

    let newLogin    = getValueById("loginField");
    let newPassword = getValueById("passwordField");
    let passConfirm = getValueById("passRepeatField");

    if(newPassword != passConfirm) {
        showError("Поля нового пароля не совпадают", errorBar);
        return;
    }

    let newAuthData = new AuthData(newLogin,newPassword);
    let oldAuthData = new AuthData(oldLogin,oldPassword);

    let response;

    switch(authorizedType){
        case "faculty":
            response = await FacultiesService.selfRedact(newAuthData, oldAuthData);
            break;
        case "department":
            response = await DepartmentsService.selfRedact(newAuthData, oldAuthData);
            break;
        case "group":
            response = await GroupsService.selfRedact(newAuthData, oldAuthData);
            break;
        case "magister":
            response = await MagistersService.selfRedact(newAuthData,oldAuthData);
            break;
        case "student":
            response = await StudentsService.selfRedact(newAuthData, oldAuthData);
            break;
        default:
            console.log("Authorized type error");
    }
    if(response == null){
        let errorText = ErrorsService.getLastError();
        showError(errorText, errorBar);
        return;
    }

    showError('Редактирование прошло успешно.', errorBar);
}


