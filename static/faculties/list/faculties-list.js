import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { Faculty } from "../../-models/faculty.model.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);


const ADDITION_BUTTON_ANNOTATION = 'Добавить институт';

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

function getTableRow(id, name){
    let row = document.createElement('tr');
    let idCol     = document.createElement('td');
    let nameCol   = document.createElement('td');
    let redactCol = document.createElement('td');
    let deleteCol = document.createElement('td');
    
    let cols = [idCol, nameCol, redactCol, deleteCol];

    let redactButton = document.createElement('button');
    redactButton.innerHTML = 'Редактировать';
    redactButton.setAttribute('facultyId', id);
    redactButton.onclick = redactFacultyHandler;
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Удалить';
    deleteButton.setAttribute('facultyId', id);
    deleteButton.setAttribute('facultyName', name);
    deleteButton.onclick = deleteFaculty;
    
    idCol.innerHTML = id;
    nameCol.innerHTML = name;
    redactCol.appendChild(redactButton);
    deleteCol.appendChild(deleteButton);

    idCol.setAttribute('class', 'idCol');
    nameCol.setAttribute('class', 'nameCol');
    redactCol.setAttribute('class', 'redactCol');
    deleteCol.setAttribute('class', 'deleteCol');

    for(let col of cols) row.appendChild(col);

    return row;
}

async function addFaculty(){
    let faculty = new Faculty(null,'','','%%%','%');
    let response = await FacultiesService.addFaculty(faculty);
    if(response == null) showError(ErrorsService.getLastError(), errorBar);
    else{
        let tr = getTableRow(response.id, response.shortName);
        table.removeChild(additionRow);
        table.appendChild(tr);
        table.appendChild(additionRow);
    }
}

async function init(){
    errorBar = document.getElementsByTagName('error-bar')[0];
    table = document.getElementById('facultiesTable');
    let faculties = await FacultiesService.getAll();
    faculties.sort((a, b) => a.id-b.id);
    for(let faculty of faculties){
        let id   = faculty.id;
        let name = faculty.shortName;
        let row = getTableRow(id, name);
        table.appendChild(row);
    }
    additionRow = document.createElement('tr');
    let additionCol = document.createElement('td');
    additionCol.setAttribute('colspan','4');
    let additionButton = document.createElement('button');
    additionButton.onclick = addFaculty;
    additionButton.innerHTML = ADDITION_BUTTON_ANNOTATION;
    additionButton.setAttribute('class', 'additionButton');
    additionCol.appendChild(additionButton);
    additionRow.appendChild(additionCol);
    table.appendChild(additionRow);
}



