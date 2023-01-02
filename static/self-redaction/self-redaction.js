import { fadeIn } from "../-functions/fade.js";
import { redirect } from "../-functions/redirect.js";
import { ADDRESS, redirectIfIsntAuthorized } from "../-functions/redirection.js";
import { setOnClick } from "../-functions/setHandler.js";
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

const PASSWORDS_DOESNT_MATCH = "Поля нового пароля не совпадают";
const CONSOLE_AUTH_TYPE_ERROR = "Auth type error";
const REDACTION_SUCCESS = "Редактирование прошло успешно.";

let annotationMap = {
    "admin":      "",
    "faculty":    "зайдите как администратор",
    "department": "зайдите под именем института",
    "group":      "обратитесь к представителям кафедры",
    "magister":   "зайдите под именем кафедры",
    "student":    "обратитесь к старосте группы",
}

redirectIfIsntAuthorized();
init();
setTimeout(fadeIn, 1200);


function init(){
    authorizedType = AuthorizedService.getAuthorizedType;
    let authorizedData = AuthorizedService.getAuthorizedData;
    let annotation = annotationMap[authorizedType];
    let redactingAnnotation = "";
    switch(authorizedType){
        case "admin":
            redirect(ADDRESS);
            break;
        case "faculty":
        case "department":
        case "group":
            redactingAnnotation += authorizedData.name;
            break;
        case "magister":
        case "student":
            redactingAnnotation += `${authorizedData.surname} ${authorizedData.name} ${authorizedData.patronymicName}`;
            break;
        default:
            console.log(CONSOLE_AUTH_TYPE_ERROR);
    }
    let redactingAnnotationBlock = document.getElementById('redacting');
    redactingAnnotationBlock.innerHTML += redactingAnnotation + "'.";
    let annotationBlock = document.getElementById('annotation');
    annotationBlock.innerHTML += annotation + ".";
    setOnClick('confirmBtn',confirm);
    errorBar = document.getElementsByTagName('error-bar')[0];
}



async function confirm(){
    let oldLogin    = getValueById("oldLoginField");
    let oldPassword = getValueById("oldPasswordField");

    let newLogin    = getValueById("loginField");
    let newPassword = getValueById("passwordField");
    let passConfirm = getValueById("passRepeatField");

    if(newPassword != passConfirm) {
        showError(PASSWORDS_DOESNT_MATCH, errorBar);
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
            console.log(CONSOLE_AUTH_TYPE_ERROR );
    }
    if(response == null){
        let errorText = ErrorsService.getLastError();
        showError(errorText, errorBar);
        return;
    }

    showError(REDACTION_SUCCESS, errorBar);
}


