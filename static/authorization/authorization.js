import { fadeIn } from "../-functions/fade.js";
import { redirect } from "../-functions/redirect.js";
import { FacultiesService } from "../-services/faculties.service.js";
//import { ErrorsService } from "../-services/-base-services/errors.service.js";
import { TokensService } from "../-services/-base-services/tokens.service.js";
import { showError } from "../-functions/showError.js";


fadeIn();
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
    if(type == 0) showError("Выберите тип авторизации");
    
    let response

    switch(type){
        case 'student':
            console.log('Student login attemption');
            break;
        case 'magister':
            console.log('Magister login attemption');
            break;
        case 'department':
            console.log('Department login attemption');
            break;
        case 'faculty':
            console.log('Faculty login attemption');
            response = await FacultiesService.login(login, password);
            break;
        default:
            showError("Ошибка типа авторизации", errorBar);
    }

    if(response == null){
        showError("Введённые данные некорректны");
    }
    else if(!!response){
        console.log(response);
        TokensService.setAuthData(response);
        redirect("/");
    }
    else{
        console.log('Auth type error.');
    }
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
    let loginButton = document.getElementById('loginButton');
    loginButton.onclick = login;
    errorBar = document.getElementsByTagName('error-bar')[0];
}