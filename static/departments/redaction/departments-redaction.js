import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { Department } from "../../-models/department.model.js";
import { fillRequiredSelect } from "../../-functions/fillSelect.js";
import { getOptionSN } from "../../-functions/getOption.js";
import { setOnClick } from "../../-functions/setHandler.js";
import { setDisable } from "../../-functions/setDisabled.js";

window.onload = init;
setTimeout(fadeIn, 1200);

const WAS_NOT_CHOSEN = 'Кафедра не была выбрана';

let id;
let errorBar;
let authType;
//let authorizedData;

let fieldsNames = [
    'idField',
    'facultyField',      
    'nameField',    
    'shortNameField',
    'loginField',
    'passwordField',   
]

async function save(){
    let facultyId = getValueById('facultyField');
    let name = getValueById('nameField');
    let shortName = getValueById('shortNameField');
    let login = getValueById('loginField');
    let password = getValueById('passwordField');
    let department = new Department(id,login,password,name,shortName, facultyId);
    let response;
    if(authType == "admin")
        response = await DepartmentsService.redactAsAdministrator(department);
    else response = await DepartmentsService.redactDepartment(department);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно отредактирована', errorBar);
}

async function deleteEntry(){
    let name = getValueById('shortNameField');
    let answer = confirm(`Вы уверены, что хотите удалить ${name}?`);
    if(!answer) return;
    let response;
    if(authType == "admin") 
        response = await DepartmentsService.deleteDepartmentAsAdministartor(id);
    else response = await DepartmentsService.deleteDepartment(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно удалена', errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('departmentId');
        redirect('/departments/list');
    }, 1200)
}

function fillFields(department){
    setValueById('idField',         department.id);
    setValueById('facultyField',    department.faculty.id);
    setValueById('nameField',       department.name);
    setValueById('shortNameField',  department.shortName);
    setValueById('loginField',      department.login);
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

async function loadFaculties(){
    return await FacultiesService.getAll();
}

async function loadAndFillData(){
    let faculties = await loadFaculties();
    fillRequiredSelect('facultyField', faculties, getOptionSN);
    switch(authType){
        case 'faculty':
            document.getElementById('facultyField').disabled = true;
        case 'admin':
            break;
    }
}

async function init(){
    setOnClick('saveButton', save);
    setOnClick('deleteButton', deleteEntry);

    authType       = AuthorizedService.getAuthorizedType;
    //authorizedData = AuthorizedService.getAuthorizedData;

    await loadAndFillData();

    errorBar = document.getElementsByTagName('error-bar')[0];

    id = sessionStorage.getItem('departmentId');
    if(id == null) {
        showError(WAS_NOT_CHOSEN, errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/departments/list'), 1200);
        return;
    }

    let response;
    if(authType == "admin")
        response = await DepartmentsService.getConcreteAsAdministrator(id);
    else response = await DepartmentsService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    fillFields(response);
}