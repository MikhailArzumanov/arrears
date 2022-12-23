import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { Department } from "../../-models/department.model.js";

window.onload = init;
setTimeout(fadeIn, 1200);

let id;
let errorBar;
let authType;
let authorizedData;
let fieldsNames = [
    'idField',
    'facultyField',      
    'nameField',    
    'shortNameField',
    'loginField',
    'passwordField',   
]
let faculties;

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
    console.log(response);
    showError('Запись была успешно отредактирована', errorBar);
}

async function deleteFaculty(){
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
    //setValueById('passwordField', department.password);
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

async function loadFaculties(){
    faculties = await FacultiesService.getAll();
}

function getFacultyOption(faculty){
    let option = document.createElement('option');
    option.innerHTML = faculty.shortName;
    option.value     = faculty.id;
    return option;
}

function fillSelect(selectId, dataArray, optionFn){
    let select = document.getElementById(selectId);
    for(let dataCol of dataArray){
        let option = optionFn(dataCol);
        select.appendChild(option);
    }
}

async function loadAndFillData(){
    await loadFaculties();
    fillSelect('facultyField', faculties, getFacultyOption);
    switch(authType){
        case 'faculty':
            document.getElementById('facultyField').disabled = true;
        case 'admin':
            break;
    }
}

async function init(){
    authType       = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    await loadAndFillData();
    errorBar = document.getElementsByTagName('error-bar')[0];
    id = sessionStorage.getItem('departmentId');
    if(id == null) {
        showError('Кафедра не была выбрана', errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/departments/list'), 1200);
        return;
    }
    let response = await DepartmentsService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    fillFields(response);
    let saveButton = document.getElementById('saveButton');
    saveButton.onclick = save;
    let deleteButton = document.getElementById('deleteButton');
    deleteButton.onclick = deleteFaculty;
}