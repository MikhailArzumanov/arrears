import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { addColumn } from "../../-functions/addColumn.js";
import { clearSelect } from "../../-functions/clearSelect.js";
import { clearTable } from "../../-functions/clearTable.js";
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
import { Group } from "../../-models/group.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { GroupsService } from "../../-services/groups.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const ADDITION_BUTTON_ANNOTATION = 'Добавить группу';
const ADDITION_COLUMN_WIDTH      = 6;
const AUTH_TYPE_ERROR ='Ошибка типа авторизации';

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

async function addGroup(){
    let departmentId = await getDepartmentId();
    if(departmentId == null) return;
    let group = new Group(null,'','','%%%', departmentId);
    let response;
    if(type == "admin")
        response = await GroupsService.addAsAdministrator(group);
    else response = await GroupsService.addEntry(group);
    if(response == null) showError(ErrorsService.getLastError(), errorBar);
    else{
        let tr = getTableRow(response.id, response.name, 
            response.department.shortName, response.department.faculty.shortName);
        table.removeChild(additionRow);
        table.appendChild(tr);
        table.appendChild(additionRow);
    }
}

function redactGroup(id){
    sessionStorage.setItem('groupId', id);
    redirect('/groups/redaction');
}

function redactGroupHandler(event){
    let element = event.currentTarget;
    let id = element.getAttribute('groupId');
    redactGroup(id);
}

async function deleteGroup(event){
    let element = event.currentTarget;
    let id = element.getAttribute('groupId');
    let name = element.getAttribute('groupName');
    let answer = confirm(`Вы уверены, что хотите удалить ${name}?`);
    if(!answer) return;
    let response;
    if(type == "admin")
        response = await GroupsService.deleteAsAdministartor(id);
    else response = await GroupsService.deleteEntry(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
}

function addGroupButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, groupName=null){
    let attributes = [];
    attributes.push({key:'groupId', val:id});
    if(groupName) attributes.push({key:'groupName', val:groupName});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}

function getTableRow(id, name, departmentName, facultyName){
    let row = document.createElement('tr');
    addColumn(row,id            , 'idCol'            );
    addColumn(row,name          , 'nameCol'          );
    addColumn(row,facultyName   , 'facultyCol'       );
    addColumn(row,departmentName, 'departmentCol'    );
    
    addGroupButtonColumn(row,'redactCol','Редактировать',redactGroupHandler,id);
    addGroupButtonColumn(row,'deleteCol','Удалить',deleteGroup,id,name);

    row.setAttribute('class', 'dataRow');
    return row;
}

async function loadGroups(){
    let facultyId    = getValueById("facultyField");
    let departmentId = getValueById("departmentField");
    let searchVal    = getValueById("searchField");
    let response = await GroupsService.getList(facultyId, departmentId, searchVal, pageNum);
    return response;
}

function getRowByModel(group){
    let id             = group.id;
    let name           = group.name;
    let departmentName = group.department.shortName;
    let facultyName    = group.department.faculty.shortName;
    return getTableRow(id, name, departmentName, facultyName);
}

async function fillTable(){    
    let response = await loadGroups();
    let groups = response.groups;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    fillTableData(groups, getRowByModel, table, additionRow);
}

async function refillTable(){
    clearTable(table, 'dataRow');
    await fillTable();
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

    table = document.getElementById('groupsTable').getElementsByTagName('tbody')[0];
    additionRow = createAdditionRow(table, ADDITION_COLUMN_WIDTH, ADDITION_BUTTON_ANNOTATION, addGroup);

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
            showError(AUTH_TYPE_ERROR, errorBar);
            return;
    }
    await fillSelects(facultyId);
    facultyField.value    = facultyId;
    departmentField.value = departmentId;
    await fillTable();
}



