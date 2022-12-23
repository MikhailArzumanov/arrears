import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { Faculty } from "../../-models/faculty.model.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);

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
    console.log(response);
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
    //setValueById('passwordField', faculty.password);
}

function clearFieldsAndDisableControls(){
    for(let fieldName of fieldsNames){
        let field = document.getElementById(fieldName);
        field.value = '';
        field.disabled = true;
    }
    document.getElementById('saveButton').disabled = true;
    document.getElementById('deleteButton').disabled = true;
}

async function init(){
    errorBar = document.getElementsByTagName('error-bar')[0];
    id = sessionStorage.getItem('facultyId');
    if(id == null) {
        showError('Институт не был выбран', errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/faculties/list'), 1200);
        return;
    }
    let response = await FacultiesService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    fillFields(response);
    let saveButton = document.getElementById('saveButton');
    saveButton.onclick = save;
    let deleteButton = document.getElementById('deleteButton');
    deleteButton.onclick = deleteFaculty;
}