import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { addColumn } from "../../-functions/addColumn.js";
import { createAdditionRow } from "../../-functions/createAdditionRow.js";
import { fadeIn } from "../../-functions/fade.js";
import { fillTableData } from "../../-functions/fillTableData.js";
import { redirect } from "../../-functions/redirect.js";
import { redirectIfIsntAuthorized } from "../../-functions/redirection.js";
import { showError } from "../../-functions/showError.js";
import { Department } from "../../-models/department.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const ADDITION_BUTTON_ANNOTATION = 'Добавить кафедру';
const ADDITION_COLUMN_WIDTH      = 5;

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
    let response;
    if(type == "admin")
        response = await DepartmentsService.deleteDepartmentAsAdministartor(id);
    else response = await DepartmentsService.deleteDepartment(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
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

function getFacultyId(){
    switch(type){
        case 'admin': return 1;
        case 'faculty': return authorizedData.id;
    }
}

async function addDepartment(){
    let facultyId = getFacultyId();
    let department = new Department(null,'','','%%%','%', facultyId);
    let response;
    if(type == "admin")
        response = await DepartmentsService.addDepartmentAsAdministrator(department);
    else response = await DepartmentsService.addDepartment(department);
    if(response == null) {showError(ErrorsService.getLastError(), errorBar); return}
    let tr = getTableRow(response.id, response.shortName, response.faculty.shortName);
    table.insertBefore(tr, additionRow);
}

function addDepartmentButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, departmentName=null){
    let attributes = [];
    attributes.push({key:'departmentId', val:id});
    if(departmentName) attributes.push({key:'departmentName', val:departmentName});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}


function getTableRow(id, name, facultyName){
    let row = document.createElement('tr');
    addColumn(row,id            , 'idCol'     );
    addColumn(row,name          , 'nameCol'   );
    addColumn(row,facultyName   , 'facultyCol');
    
    addDepartmentButtonColumn(row,'redactCol','Редактировать',redactDepartmentHandler,id);
    addDepartmentButtonColumn(row,'deleteCol','Удалить',deleteDepartment,id,name);

    row.setAttribute('class', 'dataRow');
    return row;
}

function getRowByModel(department){
    let id          = department.id;
    let name        = department.shortName;
    let facultyName = department.faculty.shortName;
    return getTableRow(id, name, facultyName);
}

async function fillTable(facultyId){
    let departments = await DepartmentsService.getList(facultyId);
    fillTableData(departments, getRowByModel, table, additionRow);
}

async function init(){
    type = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;

    errorBar = document.getElementsByTagName('error-bar')[0];

    table = document.getElementById('departmentsTable');
    additionRow = createAdditionRow(table, ADDITION_COLUMN_WIDTH, ADDITION_BUTTON_ANNOTATION, addDepartment);

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
    await fillTable(facultyId);
}