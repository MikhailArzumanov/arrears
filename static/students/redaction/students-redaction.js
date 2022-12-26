import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { Student } from "../../-models/student.model.js";
import { StudentsService } from "../../-services/students.service.js";
import { GroupsService } from "../../-services/groups.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);

const WAS_NOT_CHOSEN = 'Запись студента не была выбрана';

let id;
let errorBar;
let authType;
let authorizedData;

let fieldsNames = [
    'idField',        
    'facultyField',   
    'departmentField',
    'groupField',
    'surnameField',      
    'nameField',      
    'patronymicNameField',      
    'loginField',
    'passwordField',     
];

async function save(){
    let groupId        = getValueById('groupField');
    let surname        = getValueById('surnameField');
    let name           = getValueById('nameField');
    let patronymicName = getValueById('patronymicNameField');
    let login          = getValueById('loginField');
    let password       = getValueById('passwordField');
    let student = new Student(id,login,password,surname,name,patronymicName,groupId);
    let response;
    if(authType == "admin")
        response = await StudentsService.redactAsAdministrator(student);
    else response = await StudentsService.redactEntry(student);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    console.log(response);
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
        response = await StudentsService.deleteAsAdministartor(id);
    else response = await StudentsService.deleteEntry(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError('Запись была успешно удалена', errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('departmentId');
        redirect('/students/list');
    }, 1200)
}

function fillFields(student){
    setValueById('idField',             student.id);
    setValueById('facultyField',        student.group.department.faculty.id);
    setValueById('departmentField',     student.group.department.id);
    setValueById('groupField',          student.group.id);
    setValueById('surnameField',        student.surname);
    setValueById('nameField',           student.name);
    setValueById('patronymicNameField', student.patronymicName);
    setValueById('loginField',          student.login);
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

function getOptionSN(snModel){
    let option = document.createElement('option');
    option.innerHTML = snModel.shortName;
    option.value     = snModel.id;
    return option;
}

function getOptionN(nModel){
    let option = document.createElement('option');
    option.innerHTML = nModel.name;
    option.value     = nModel.id;
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

async function loadFaculties(){
    let faculties = await FacultiesService.getAll();
    fillSelect('facultyField', faculties, getOptionSN);
}

async function loadDepartments(facultyId){
    let departments = await DepartmentsService.getList(facultyId);
    fillSelect('departmentField', departments, getOptionSN);
}

async function loadGroups(facultyId, departmentId){
    let groupsResp = await GroupsService.getList(facultyId,departmentId,'', 0);
    let groups = groupsResp.groups;
    fillSelect('groupField', groups, getOptionN);
}

async function reloadDepartments(facultyId){
    clearSelect('departmentField');
    await loadDepartments(facultyId);
}

async function reloadGroups(facultyId, departmentId){
    clearSelect('groupField');
    await loadGroups(facultyId, departmentId);
}

async function loadAndFillData(facultyId, departmentId){
    await loadFaculties();
    await loadDepartments(facultyId);
    await loadGroups(facultyId, departmentId);
    switch(authType){
        case 'group':
            document.getElementById('groupField').disabled = true;
        case 'department':
            document.getElementById('departmentField').disabled = true;
        case 'faculty':
            document.getElementById('facultyField').disabled = true;
        case 'admin':
            break;
    }
}

async function selectDepartmentOnChange(event){
    let departmentId = event.originalTarget.value;
    await reloadGroups(0, departmentId);
}

async function selectFacultyOnChange(event){
    let facultyId = event.originalTarget.value;
    await reloadDepartments(facultyId);
    await reloadGroups(facultyId, 0);
}

async function init(){
    document.getElementById('facultyField').onchange    = selectFacultyOnChange;
    document.getElementById('departmentField').onchange = selectDepartmentOnChange;
    authType       = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    errorBar = document.getElementsByTagName('error-bar')[0];
    id = sessionStorage.getItem('studentId');
    if(id == null) {
        showError(WAS_NOT_CHOSEN, errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/students/list'), 1200);
        return;
    }
    let response;
    if(authType == "admin")
        response = await StudentsService.getConcreteAsAdministrator(id);
    else response = await StudentsService.getConcrete(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    await loadAndFillData(response.group.department.faculty.id, response.group.department.id);
    fillFields(response);
    let saveButton = document.getElementById('saveButton');
    saveButton.onclick = save;
    let deleteButton = document.getElementById('deleteButton');
    deleteButton.onclick = deleteEntry;
}