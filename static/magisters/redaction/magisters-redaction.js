import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { Magister } from "../../-models/magister.model.js";
import { MagistersService } from "../../-services/magisters.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);

const WAS_NOT_CHOSEN = 'Запись преподавателя не была выбрана';

let id;
let errorBar;
let authType;
let authorizedData;
let fieldsNames = [
    'idField',        
    'facultyField',   
    'departmentField',
    'surnameField',      
    'nameField',      
    'patronymicNameField',      
    'loginField',
    'passwordField',     
];

async function save(){
    let departmentId   = getValueById('departmentField');
    let surname        = getValueById('surnameField');
    let name           = getValueById('nameField');
    let patronymicName = getValueById('patronymicNameField');
    let login          = getValueById('loginField');
    let password       = getValueById('passwordField');
    let magister = new Magister(id,login,password,surname,name,patronymicName,departmentId);
    let response;
    if(authType == "admin")
        response = await MagistersService.redactAsAdministrator(magister);
    else response = await MagistersService.redactEntry(magister);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно отредактирована', errorBar);
}

async function deleteEntry(){
    let surname        = getValueById('surnameField');
    let name           = getValueById('nameField');
    let patronymicName = getValueById('patronymicNameField');
    let answer = confirm(`Вы уверены, что хотите удалить запись '${surname} ${name} ${patronymicName}'?`);
    if(!answer) return;
    let response;
    if(authType == "admin") 
        response = await MagistersService.deleteAsAdministartor(id);
    else response = await MagistersService.deleteEntry(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно удалена', errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('departmentId');
        redirect('/magisters/list');
    }, 1200)
}

function fillFields(magister){
    setValueById('idField',             magister.id);
    setValueById('facultyField',        magister.department.faculty.id);
    setValueById('departmentField',     magister.department.id);
    setValueById('surnameField',        magister.surname);
    setValueById('nameField',           magister.name);
    setValueById('patronymicNameField', magister.patronymicName);
    setValueById('loginField',          magister.login);
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
    id = sessionStorage.getItem('magisterId');
    if(id == null) {
        showError(WAS_NOT_CHOSEN, errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/magisters/list'), 1200);
        return;
    }
    let response;
    if(authType == "admin")
        response = await MagistersService.getConcreteAsAdministrator(id);
    else response = await MagistersService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    await loadAndFillData(response.department.faculty.id);
    fillFields(response);
    let saveButton = document.getElementById('saveButton');
    saveButton.onclick = save;
    let deleteButton = document.getElementById('deleteButton');
    deleteButton.onclick = deleteEntry;
}