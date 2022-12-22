import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { Department } from "../../-models/department.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);



let table;
let type;
let authorizedData;
let additionRow;
let errorBar;

async function deleteDepartment(event){
    let element = event.currentTarget;
    let id = element.getAttribute('departmentId');
    let name = element.getAttribute('departmentName');
    let answer = confirm(`Вы уверены, что хотите удалить ${name}?`);
    if(!answer) return;
    let response = await DepartmentsService.deleteDepartment(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
    console.log(element);
}

function redactDepartment(id){
    sessionStorage.setItem('departmentId', id);
    redirect('/departments/redaction');
}

function redactDepartmentHandler(event){
    let element = event.currentTarget;
    let id = element.getAttribute('departmentId');
    redactDepartment(id);
}

function getTableRow(id, name, facultyName){
    let row = document.createElement('tr');
    let idCol      = document.createElement('td');
    let nameCol    = document.createElement('td');
    let facultyCol = document.createElement('td');
    let redactCol  = document.createElement('td');
    let deleteCol  = document.createElement('td');
    
    let cols = [idCol, nameCol, facultyCol, redactCol, deleteCol];

    let redactButton = document.createElement('button');
    redactButton.innerHTML = 'Редактировать';
    redactButton.setAttribute('departmentId', id);
    redactButton.onclick = redactDepartmentHandler;
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Удалить';
    deleteButton.setAttribute('departmentId', id);
    deleteButton.setAttribute('departmentName', name);
    deleteButton.onclick = deleteDepartment;
    
    idCol.innerHTML = id;
    nameCol.innerHTML = name;
    facultyCol.innerHTML = facultyName;
    redactCol.appendChild(redactButton);
    deleteCol.appendChild(deleteButton);

    idCol.setAttribute('class',      'idCol');
    nameCol.setAttribute('class',    'nameCol');
    facultyCol.setAttribute('class', 'facultyCol');
    redactCol.setAttribute('class',  'redactCol');
    deleteCol.setAttribute('class',  'deleteCol');

    for(let col of cols) row.appendChild(col);

    return row;
}

function getFacultyId(){
    switch(type){
        case 'admin': return 1;
        case 'faculty': return authorizedData.id;
    }
}

async function addDepartment(){
    console.log('addition attempt');
    let facultyId = getFacultyId();
    let department = new Department(null,'','','%%%','%', facultyId);
    let response;
    switch(type){
        case 'faculty':
            response = await DepartmentsService.addDepartment(department);
            break;
        case 'admin':
            response = await DepartmentsService.addDepartmentAsAdministrator(department);
    }
    if(response == null) showError(ErrorsService.getLastError(), errorBar);
    else{
        let tr = getTableRow(response.id, response.shortName, response.faculty.shortName);
        table.removeChild(additionRow);
        table.appendChild(tr);
        table.appendChild(additionRow);
    }
}

function createAdditionRow(){
    additionRow = document.createElement('tr');
    let additionCol = document.createElement('td');
    additionCol.setAttribute('colspan','5');
    let additionButton = document.createElement('button');
    additionButton.onclick = addDepartment;
    additionButton.innerHTML = 'Добавить кафедру';
    additionButton.setAttribute('class', 'additionButton');
    additionCol.appendChild(additionButton);
    additionRow.appendChild(additionCol);
    table.appendChild(additionRow);
}

async function init(){
    type = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    errorBar = document.getElementsByTagName('error-bar')[0];
    table = document.getElementById('departmentsTable');
    let facultyId;
    switch(type){
        case 'faculty':
            facultyId = authorizedData.id;
            break;
        case 'admin':
            facultyId = 0;
            break;
        default:
            showError('Ошибка типа авторизации', errorBar);
            return;
    }
    let departments = await DepartmentsService.getAll(facultyId);
    departments.sort((a, b) => a.id-b.id);
    for(let department of departments){
        let id          = department.id;
        let name        = department.shortName;
        let facultyName = department.faculty.shortName;
        let row = getTableRow(id, name, facultyName);
        table.appendChild(row);
    }
    createAdditionRow();
}



