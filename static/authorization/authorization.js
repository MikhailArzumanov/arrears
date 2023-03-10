import { fadeIn } from "../-functions/fade.js";
import { redirect } from "../-functions/redirect.js";
import { FacultiesService } from "../-services/faculties.service.js";
//import { ErrorsService } from "../-services/-base-services/errors.service.js";
import { TokensService } from "../-services/-base-services/tokens.service.js";
import { showError } from "../-functions/showError.js";
import { DepartmentsService } from "../-services/departments.service.js";
import { GroupsService } from "../-services/groups.service.js";
import { MagistersService } from "../-services/magisters.service.js";
import { StudentsService } from "../-services/students.service.js";
import { AdministratorService } from "../-services/administrators.service.js";
import { setOnClick } from "../-functions/setHandler.js";


setTimeout(fadeIn, 1200);

const CHOOSE_AUTH_TYPE = "Выберите тип авторизации.";
const AUTH_TYPE_ERROR = "Ошибка типа авторизации.";
const INCORRECT_DATA = "Введённые данные некорректны.";
const INTERNAL_ERROR = "Внутренняя ошибка.";

document.addEventListener('keydown', (event)=>{
    if(event.code == "Enter") login();
    else if(event.code == "ArrowDown"
         || event.code == "ArrowUp") changeFocus();
});

function getValById(id){
    let element = document.getElementById(id);
    return element.value;
}


async function login(){
    let login    = getValById('loginField');
    let password = getValById('passwordField');
    let type     = getValById('typeField');
    if(type == 0) {showError(CHOOSE_AUTH_TYPE, errorBar); return;}
    
    let response

    switch(type){
        case 'student':
            response = await StudentsService.login(login,password);
            break;
        case 'magister':
            response = await MagistersService.login(login, password);
            break;
        case 'group':
            response = await GroupsService.login(login, password);
            break;
        case 'department':
            response = await DepartmentsService.login(login, password);
            break;
        case 'faculty':
            response = await FacultiesService.login(login, password);
            break;
        case 'administrator':
            response = await AdministratorService.login(login, password);
            break;
        default:
            showError(AUTH_TYPE_ERROR, errorBar);
    }

    if(response == null){
        showError(INCORRECT_DATA, errorBar);
    }
    else if(!!response){
        TokensService.setAuthData(response);
        redirect("/");
    }
    else showError(INTERNAL_ERROR, errorBar);
}

function changeFocus(){
    let loginField = document.getElementById("loginField");
    let passwordField = document.getElementById("passwordField");
    if(loginField == document.activeElement) passwordField.focus();
    else loginField.focus();
}

let errorBar;
window.onload = init;

function init(){
    setOnClick('loginButton',login);
    errorBar = document.getElementsByTagName('error-bar')[0];
}