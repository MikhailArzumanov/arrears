import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { addColumn } from "../../-functions/addColumn.js";
import { createAdditionRow } from "../../-functions/createAdditionRow.js";
import { fadeIn } from "../../-functions/fade.js";
import { fillTableData } from "../../-functions/fillTableData.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { Faculty } from "../../-models/faculty.model.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);


const ADDITION_BUTTON_ANNOTATION = 'Добавить институт';
const  ADDITION_COLUMN_WIDTH     = 4;

let table;
let additionRow;
let errorBar;

async function deleteFaculty(event){
    let element = event.currentTarget;
    let id = element.getAttribute('facultyId');
    let name = element.getAttribute('facultyName');
    let answer = confirm(`Вы уверены, что хотите удалить ${name}?`);
    if(!answer) return;
    let response = await FacultiesService.deleteFaculty(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
}

function redactFaculty(id){
    sessionStorage.setItem('facultyId', id);
    redirect('/faculties/redaction');
}

function redactFacultyHandler(event){
    let element = event.currentTarget;
    let id = element.getAttribute('facultyId');
    redactFaculty(id);
}

async function addFaculty(){
    let faculty = new Faculty(null,'','','%%%','%');
    
    let response = await FacultiesService.addFaculty(faculty);
    if(response == null) {showError(ErrorsService.getLastError(), errorBar);return}

    let tr = getTableRow(response.id, response.shortName);
    table.appendChild(tr, additionRow);
}

function addFacultyButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, facultyName=null){
    let attributes = [];
    attributes.push({key:'facultyId', val:id});
    if(facultyName) attributes.push({key:'facultyName', val:facultyName});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}

function getTableRow(id, name){
    let row = document.createElement('tr');
    addColumn(row,id            , 'idCol'            );
    addColumn(row,name          , 'nameCol'          );
    
    addFacultyButtonColumn(row,'redactCol','Редактировать',redactFacultyHandler,id);
    addFacultyButtonColumn(row,'deleteCol','Удалить',deleteFaculty,id,name);

    row.setAttribute('class', 'dataRow');
    return row;
}

function getRowByModel(faculty){
    let id   = faculty.id;
    let name = faculty.shortName;
    return getTableRow(id, name);
}

async function fillTable(){
    let faculties = await FacultiesService.getAll();
    fillTableData(faculties, getRowByModel, table, additionRow);
}


async function init(){
    errorBar = document.getElementsByTagName('error-bar')[0];
    table = document.getElementById('facultiesTable');

    await fillTable();

    additionRow = createAdditionRow(table, ADDITION_COLUMN_WIDTH, ADDITION_BUTTON_ANNOTATION, addFaculty);
}



