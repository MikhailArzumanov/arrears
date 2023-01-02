import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { addColumn } from "../../-functions/addColumn.js";
import { createAdditionRow } from "../../-functions/createAdditionRow.js";
import { fadeIn } from "../../-functions/fade.js";
import { fillDepartments, fillFaculties } from "../../-functions/fillSelects.js";
import { fillTableData } from "../../-functions/fillTableData.js";
import { redirect } from "../../-functions/redirect.js";
import { redirectIfIsntAuthorized } from "../../-functions/redirection.js";
import { setDisable } from "../../-functions/setDisabled.js";
import { setOnChange, setOnClick } from "../../-functions/setHandler.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Magister } from "../../-models/magister.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { MagistersService } from "../../-services/magisters.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const ADDITION_BUTTON_ANNOTATION = 'Добавить преподавателя';
const ADDITION_COLUMN_WIDTH      = 8;

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
        table.insertBefore(tr, additionRow);
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
}

function addMagisterButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, magisterFullName=null){
    let attributes = [];
    attributes.push({key:'magisterId', val:id});
    if(magisterFullName) attributes.push({key:'magisterFullName', val:magisterFullName});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}

function getTableRow(id, surname, name, patronymicName, departmentName, facultyName){
    let row = document.createElement('tr');
    addColumn(row,id            , 'idCol'            );
    addColumn(row,surname       , 'surnameCol'       );
    addColumn(row,name          , 'nameCol'          );
    addColumn(row,patronymicName, 'patronymicNameCol');
    addColumn(row,facultyName   , 'facultyCol'       );
    addColumn(row,departmentName, 'departmentCol'    );
    
    let magisterFullName = `${surname} ${name} ${patronymicName}`;
    addMagisterButtonColumn(row, 'redactCol', 'Редактировать', redactMagisterHandler, id);
    addMagisterButtonColumn(row, 'deleteCol', 'Удалить', deleteMagister, id, magisterFullName);

    row.setAttribute('class', 'dataRow');
    return row;
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

function getRowByModel(magister){
    let id             = magister.id;
    let surname        = magister.surname;
    let name           = magister.name;
    let patronymicName = magister.patronymicName;
    let departmentName = magister.department.shortName;
    let facultyName    = magister.department.faculty.shortName;
    return getTableRow(id, surname, name, patronymicName, departmentName, facultyName);
}



async function fillTable(){    
    let response = await loadMagisters();
    let magisters = response.magisters;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    fillTableData(magisters, getRowByModel, table, additionRow);
}

function clearTable(){
    let rows = document.getElementsByClassName('dataRow');
    while(rows.length > 0){
        table.removeChild(rows[0]);
    }
}

async function refillTable(){
    clearTable();
    await fillTable();
}

function clearSelect(selectId){
    document.getElementById(selectId).innerHTML = '';
}

async function fillSelects(facultyId){
    await fillFaculties("facultyField","Институт...");
    await fillDepartments(facultyId,"departmentField","Кафедра...");
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

async function selectFacultyOnChange(event){
    let facultyId = event.originalTarget.value;
    clearSelect("departmentField");
    await fillDepartments(facultyId,"departmentField","Кафедра...");
}

async function init(){
    setOnClick('searchBtn', onSearch);
    setOnClick('nextPageBtn', onNextPage);
    setOnClick('prevPageBtn', onPrevPage);
    
    setOnChange('facultyField', selectFacultyOnChange);
    
    type = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    
    errorBar = document.getElementsByTagName('error-bar')[0];
    
    table = document.getElementById('magistersTable').getElementsByTagName('tbody')[0];
    additionRow = createAdditionRow(table, ADDITION_COLUMN_WIDTH, ADDITION_BUTTON_ANNOTATION, addEntry);

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



