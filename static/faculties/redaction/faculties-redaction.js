import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { redirectIfIsntAuthorized } from "../../-functions/redirection.js";
import { setDisable } from "../../-functions/setDisabled.js";
import { setOnClick } from "../../-functions/setHandler.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { Faculty } from "../../-models/faculty.model.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const WAS_NOT_CHOSEN = 'Институт не был выбран';

let id;
let errorBar;
let fieldsNames = [
    'idField',      
    'nameField',    
    'shortNameField',
    'loginField',
    'passwordField',   
]

async function save(){
    let name = getValueById('nameField');
    let shortName = getValueById('shortNameField');
    let login = getValueById('loginField');
    let password = getValueById('passwordField');
    let faculty = new Faculty(id,login,password,name,shortName);
    let response = await FacultiesService.redactAsAdministrator(faculty);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно отредактирована', errorBar);
}

async function deleteFaculty(){
    let name = getValueById('shortNameField');
    let answer = confirm(`Вы уверены, что хотите удалить ${name}?`);
    if(!answer) return;
    let response = await FacultiesService.deleteFaculty(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно удалена', errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('facultyId');
        redirect('/faculties/list');
    }, 1200)
}

function fillFields(faculty){
    setValueById('idField',         faculty.id);
    setValueById('nameField',       faculty.name);
    setValueById('shortNameField',  faculty.shortName);
    setValueById('loginField',      faculty.login);
}

function clearFieldsAndDisableControls(){
    for(let fieldName of fieldsNames){
        let field = document.getElementById(fieldName);
        field.value = '';
        field.disabled = true;
    }
    setDisable('saveButton', true);
    setDisable('deleteButton', true);
}

async function init(){
    errorBar = document.getElementsByTagName('error-bar')[0];

    id = sessionStorage.getItem('facultyId');
    if(id == null) {
        showError(WAS_NOT_CHOSEN, errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/faculties/list'), 1200);
        return;
    }

    let response = await FacultiesService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}

    fillFields(response);
    setOnClick('saveButton', save);
    setOnClick('deleteButton',deleteFaculty);
}