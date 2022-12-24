import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { Group } from "../../-models/group.model.js";
import { GroupsService } from "../../-services/groups.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);

let id;
let errorBar;
let authType;
let authorizedData;
let fieldsNames = [
    'idField',        
    'facultyField',   
    'departmentField',
    'nameField',      
    'loginField',
    'passwordField',     
];

async function save(){
    let departmentId = getValueById('departmentField');
    let name         = getValueById('nameField');
    let login        = getValueById('loginField');
    let password     = getValueById('passwordField');
    let group = new Group(id,login,password,name,departmentId);
    let response;
    if(authType == "admin")
        response = await GroupsService.redactAsAdministrator(group);
    else response = await GroupsService.redactEntry(group);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    console.log(response);
    showError('Запись была успешно отредактирована', errorBar);
}

async function deleteEntry(){
    let name = getValueById('nameField');
    let answer = confirm(`Вы уверены, что хотите удалить ${name}?`);
    if(!answer) return;
    let response;
    if(authType == "admin") 
        response = await GroupsService.deleteAsAdministartor(id);
    else response = await GroupsService.deleteEntry(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно удалена', errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('departmentId');
        redirect('/groups/list');
    }, 1200)
}

function fillFields(group){
    setValueById('idField',         group.id);
    setValueById('facultyField',    group.department.faculty.id);
    setValueById('departmentField', group.department.id);
    setValueById('nameField',       group.name);
    setValueById('loginField',      group.login);
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

function getOptionSN(faculty){
    let option = document.createElement('option');
    option.innerHTML = faculty.shortName;
    option.value     = faculty.id;
    return option;
}

function clearSelect(selectId){
    document.getElementById(selectId).innerHTML = '';
}

function fillSelect(selectId, dataArray, optionFn){
    let select = document.getElementById(selectId);
    for(let dataCol of dataArray){
        let option = optionFn(dataCol);
        select.appendChild(option);
    }
}

async function loadAndFillData(facultyId){
    let faculties = await FacultiesService.getAll();
    fillSelect('facultyField', faculties, getOptionSN);
    switch(authType){
        case 'department':
            document.getElementById('departmentField').disabled = true;
        case 'faculty':
            document.getElementById('facultyField').disabled = true;
        case 'admin':
            break;
    }
    let departments = await DepartmentsService.getList(facultyId);
    fillSelect('departmentField', departments, getOptionSN);
}

async function selectFacultyOnChange(event){
    let facultyId = event.originalTarget.value;
    let departments = await DepartmentsService.getList(facultyId);
    clearSelect("departmentField");
    fillSelect("departmentField", departments, getOptionSN);
}

async function init(){
    document.getElementById('facultyField').onchange = selectFacultyOnChange;
    authType       = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    errorBar = document.getElementsByTagName('error-bar')[0];
    id = sessionStorage.getItem('groupId');
    if(id == null) {
        showError('Кафедра не была выбрана', errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/groups/list'), 1200);
        return;
    }
    let response;
    if(authType == "admin")
        response = await GroupsService.getConcreteAsAdministrator(id);
    else response = await GroupsService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    await loadAndFillData(response.department.faculty.id);
    fillFields(response);
    let saveButton = document.getElementById('saveButton');
    saveButton.onclick = save;
    let deleteButton = document.getElementById('deleteButton');
    deleteButton.onclick = deleteEntry;
}