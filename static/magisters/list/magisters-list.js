import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Magister } from "../../-models/magister.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { MagistersService } from "../../-services/magisters.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);


let pageNum = 1;
let table;
let type;
let authorizedData;
let additionRow;
let errorBar;


async function getDepartmentId(){
    let depFieldVal = getValueById('departmentField');
    if(depFieldVal != 0) return depFieldVal;
    
    switch(type){
        case 'admin':
        case 'faculty':
            let facultyFieldVal = getValueById('facultyField');
            let facultyId = facultyFieldVal != 0 ? facultyFieldVal : 1
            let response = await DepartmentsService.getFirstByFaculty(facultyId);
            if(response == null) {showError(ErrorsService.getLastError(), errorBar); return null;}
            return response.id
        case 'department': return authorizedData.id;
    }
}

async function addEntry(){
    console.log('addition attempt');
    let departmentId = await getDepartmentId();
    if(departmentId == null) return;
    let magister = new Magister(null,'','','%%%', '%%%', '%%%', departmentId);
    let response;
    if(type == "admin")
        response = await MagistersService.addAsAdministrator(magister);
    else response = await MagistersService.addEntry(magister);
    if(response == null) showError(ErrorsService.getLastError(), errorBar);
    else{
        let tr = getTableRow(response.id, response.surname, response.name, response.patronymicName, 
            response.department.shortName, response.department.faculty.shortName);
        table.removeChild(additionRow);
        table.appendChild(tr);
        table.appendChild(additionRow);
    }
}

function redactMagister(id){
    sessionStorage.setItem('magisterId', id);
    redirect('/magisters/redaction');
}

function redactMagisterHandler(event){
    let element = event.currentTarget;
    let id = element.getAttribute('magisterId');
    redactMagister(id);
}

async function deleteMagister(event){
    let element = event.currentTarget;
    let id = element.getAttribute('magisterId');
    let fullName = element.getAttribute('magisterFullName');
    let answer = confirm(`Вы уверены, что хотите удалить запись '${fullName}'?`);
    if(!answer) return;
    let response;
    if(type == "admin")
        response = await MagistersService.deleteAsAdministartor(id);
    else response = await MagistersService.deleteEntry(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
    console.log(element);
}

function getTableRow(id, surname, name, patronymicName, departmentName, facultyName){
    let row = document.createElement('tr');
    let idCol             = document.createElement('td');
    let surnameCol        = document.createElement('td');
    let nameCol           = document.createElement('td');
    let patronymicNameCol = document.createElement('td');
    let facultyCol        = document.createElement('td');
    let departmentCol     = document.createElement('td');
    let redactCol         = document.createElement('td');
    let deleteCol         = document.createElement('td');
    
    let cols = [idCol, surnameCol, nameCol, patronymicNameCol, facultyCol, departmentCol, redactCol, deleteCol];

    let redactButton = document.createElement('button');
    redactButton.innerHTML = 'Редактировать';
    redactButton.setAttribute('magisterId', id);
    redactButton.onclick = redactMagisterHandler;
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Удалить';
    deleteButton.setAttribute('magisterId', id);
    deleteButton.setAttribute('magisterFullName', `${surname} ${name} ${patronymicName}`);
    deleteButton.onclick = deleteMagister;
    
    idCol.innerHTML             = id;
    surnameCol.innerHTML        = surname;
    nameCol.innerHTML           = name;
    patronymicNameCol.innerHTML = patronymicName;
    facultyCol.innerHTML        = facultyName;
    departmentCol.innerHTML     = departmentName;
    redactCol.appendChild(redactButton);
    deleteCol.appendChild(deleteButton);

    idCol.setAttribute('class',        'idCol');
    nameCol.setAttribute('class',      'nameCol');
    facultyCol.setAttribute('class',   'facultyCol');
    departmentCol.setAttribute('class','departmentCol');
    redactCol.setAttribute('class',    'redactCol');
    deleteCol.setAttribute('class',    'deleteCol');

    for(let col of cols) row.appendChild(col);

    return row;
}


function createAdditionRow(){
    additionRow = document.createElement('tr');
    additionRow.setAttribute('class', 'additionRow');
    let additionCol = document.createElement('td');
    additionCol.setAttribute('colspan','8');
    let additionButton = document.createElement('button');
    additionButton.onclick = addEntry;
    additionButton.innerHTML = 'Добавить группу';
    additionButton.setAttribute('class', 'additionButton');
    additionCol.appendChild(additionButton);
    additionRow.appendChild(additionCol);
    table.appendChild(additionRow);
}

async function loadMagisters(){
    let facultyId         = getValueById("facultyField");
    let departmentId      = getValueById("departmentField");
    let surnameVal        = getValueById("surnameField");
    let nameVal           = getValueById("nameField");
    let patronymicNameVal = getValueById("patronymicNameField")
    let response = await MagistersService.getList(facultyId, departmentId, surnameVal, nameVal, patronymicNameVal, pageNum);
    return response;
}

async function fillTable(){    
    let response = await loadMagisters();
    let magisters = response.magisters;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    magisters.sort((a, b) => a.id-b.id);
    for(let magister of magisters){
        let id             = magister.id;
        let surname        = magister.surname;
        let name           = magister.name;
        let patronymicName = magister.patronymicName;
        let departmentName = magister.department.shortName;
        let facultyName    = magister.department.faculty.shortName;
        let row = getTableRow(id, surname, name, patronymicName, departmentName, facultyName);
        row.setAttribute('class', 'dataRow');
        table.appendChild(row);
    }
    createAdditionRow();
}

function clearTable(){
    let rows = document.getElementsByClassName('dataRow');
    while(rows.length > 0){
        table.removeChild(rows[0]);
    }
    let additionRow = document.getElementsByClassName('additionRow')[0];
    table.removeChild(additionRow);
}

async function refillTable(){
    clearTable();
    await fillTable();
}


function getOptionSN(faculty){
    let option = document.createElement('option');
    option.innerHTML = faculty.shortName;
    option.value     = faculty.id;
    return option;
}

function getNullOption(annotation){
    let option = document.createElement('option');
    option.innerHTML = annotation;
    option.value     = 0;
    return option;
}

function clearSelect(selectId){
    document.getElementById(selectId).innerHTML = '';
}

function fillSelect(selectId, dataArray, optionFn, nullAnnotation){
    let select = document.getElementById(selectId);
    select.appendChild(getNullOption(nullAnnotation));
    for(let dataCol of dataArray){
        let option = optionFn(dataCol);
        select.appendChild(option);
    }
}

async function fillSelects(facultyId){
    let faculties = await FacultiesService.getAll();
    let departments = await DepartmentsService.getList(facultyId);
    fillSelect("facultyField", faculties, getOptionSN, "Институт...");
    fillSelect("departmentField", departments, getOptionSN, "Кафедра...");
}

function setDisable(id, value){
    document.getElementById(id).disabled = value;
}

function changePage(step){
    pageNum += step;
    document.getElementById('pageNumLabel').innerHTML = pageNum.toString();
    setDisable('prevPageBtn', pageNum <= 1);
    refillTable();
}

let onSearch = () => changePage(1-pageNum);
let onNextPage = () => changePage(1);
let onPrevPage = () => changePage(-1);

function setOnClick(btnId, handler){
    document.getElementById(btnId).onclick = handler;
}

async function selectFacultyOnChange(event){
    let facultyId = event.originalTarget.value;
    let departments = await DepartmentsService.getList(facultyId);
    clearSelect("departmentField");
    fillSelect("departmentField", departments, getOptionSN, "Кафедра...");
}

async function init(){
    setOnClick('searchBtn', onSearch);
    setOnClick('nextPageBtn', onNextPage);
    setOnClick('prevPageBtn', onPrevPage);
    document.getElementById('facultyField').onchange = selectFacultyOnChange
    type = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    errorBar = document.getElementsByTagName('error-bar')[0];
    table = document.getElementById('magistersTable').getElementsByTagName('tbody')[0];
    let facultyId, departmentId;
    let facultyField    = document.getElementById("facultyField");
    let departmentField = document.getElementById("departmentField");
    switch(type){
        case 'department':
            facultyId    = authorizedData.faculty.id;
            departmentId = authorizedData.id;
            facultyField.disabled    = true;
            departmentField.disabled = true;
            break;
        case 'faculty':
            facultyId    = authorizedData.id;
            departmentId = 0;
            facultyField.disabled = true;
            break;
        case 'admin':
            facultyId    = 0;
            departmentId = 0;
            break;
        default:
            showError('Ошибка типа авторизации', errorBar);
            return;
    }
    await fillSelects(facultyId);
    facultyField.value    = facultyId;
    departmentField.value = departmentId;
    await fillTable();
}


