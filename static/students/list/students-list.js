import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Student } from "../../-models/student.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { GroupsService } from "../../-services/groups.service.js";
import { StudentsService } from "../../-services/students.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);


const ADDITION_BUTTON_ANNOTATION = 'Добавить студента';

let pageNum = 1;
let table;
let type;
let authorizedData;
let additionRow;
let errorBar;


async function getGroupId(){
    let groupFieldVal = getValueById('groupField');
    if(groupFieldVal != 0) return groupFieldVal;
    let departmentId = authorizedData?.department?.id;
    let response;
    switch(type){
        case 'admin':
        case 'faculty':
            let departmentFieldVal = getValueById('departmentField');
            if(departmentFieldVal == 0){
                let facultyFieldVal = getValueById('facultyField');
                let facultyId = facultyFieldVal != 0 ? facultyFieldVal : 1
                response = await DepartmentsService.getFirstByFaculty(facultyId);
                if(response == null) {showError(ErrorsService.getLastError(), errorBar); return null;}
                departmentId = response.id;
            }
            else departmentId = departmentFieldVal;
        case 'department':
            response = await GroupsService.getFirstByDepartment(departmentId);
            if(response == null) {showError(ErrorsService.getLastError(), errorBar); return null;}
            return response.id;
        case 'group':
            return authorizedData.id;
    }
    showError('Ошибка типа авторизации', errorBar);
    return null;
}

async function addEntry(){
    let groupId = await getGroupId();
    if(groupId == null) return;
    let student = new Student(null,'','','%%%', '%%%', '%%%', groupId);
    let response;
    if(type == "admin")
        response = await StudentsService.addAsAdministrator(student);
    else response = await StudentsService.addEntry(student);
    if(response == null) showError(ErrorsService.getLastError(), errorBar);
    else{
        let tr = getTableRow(response.id, response.surname, response.name, response.patronymicName, 
            response.group.name, response.group.department.shortName, response.group.department.faculty.shortName);
        table.removeChild(additionRow);
        table.appendChild(tr);
        table.appendChild(additionRow);
    }
}

function redactStudent(id){
    sessionStorage.setItem('studentId', id);
    redirect('/students/redaction');
}

function redactStudentHandler(event){
    let element = event.currentTarget;
    let id = element.getAttribute('studentId');
    redactStudent(id);
}

async function deleteStudent(event){
    let element = event.currentTarget;
    let id = element.getAttribute('studentId');
    let fullName = element.getAttribute('studentFullName');
    let answer = confirm(`Вы уверены, что хотите удалить запись '${fullName}'?`);
    if(!answer) return;
    let response;
    if(type == "admin")
        response = await StudentsService.deleteAsAdministartor(id);
    else response = await StudentsService.deleteEntry(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
}

function getTableRow(id, surname, name, patronymicName, groupName, departmentName, facultyName){
    let row = document.createElement('tr');
    let idCol             = document.createElement('td');
    let surnameCol        = document.createElement('td');
    let nameCol           = document.createElement('td');
    let patronymicNameCol = document.createElement('td');
    let facultyCol        = document.createElement('td');
    let departmentCol     = document.createElement('td');
    let groupCol          = document.createElement('td');
    let redactCol         = document.createElement('td');
    let deleteCol         = document.createElement('td');
    
    let cols = [idCol, surnameCol, nameCol, patronymicNameCol, facultyCol, departmentCol, groupCol, redactCol, deleteCol];

    let redactButton = document.createElement('button');
    redactButton.innerHTML = 'Редактировать';
    redactButton.setAttribute('studentId', id);
    redactButton.onclick = redactStudentHandler;
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Удалить';
    deleteButton.setAttribute('studentId', id);
    deleteButton.setAttribute('studentFullName', `${surname} ${name} ${patronymicName}`);
    deleteButton.onclick = deleteStudent;
    
    idCol.innerHTML             = id;
    surnameCol.innerHTML        = surname;
    nameCol.innerHTML           = name;
    patronymicNameCol.innerHTML = patronymicName;
    facultyCol.innerHTML        = facultyName;
    departmentCol.innerHTML     = departmentName;
    groupCol.innerHTML          = groupName;
    redactCol.appendChild(redactButton);
    deleteCol.appendChild(deleteButton);

    idCol.setAttribute('class',        'idCol');
    nameCol.setAttribute('class',      'nameCol');
    facultyCol.setAttribute('class',   'facultyCol');
    departmentCol.setAttribute('class','departmentCol');
    groupCol.setAttribute('class',     'groupCol')
    redactCol.setAttribute('class',    'redactCol');
    deleteCol.setAttribute('class',    'deleteCol');

    for(let col of cols) row.appendChild(col);

    row.setAttribute('class', 'dataRow');
    return row;
}


function createAdditionRow(){
    additionRow = document.createElement('tr');
    additionRow.setAttribute('class', 'additionRow');
    let additionCol = document.createElement('td');
    additionCol.setAttribute('colspan','9');
    let additionButton = document.createElement('button');
    additionButton.onclick = addEntry;
    additionButton.innerHTML = ADDITION_BUTTON_ANNOTATION;
    additionButton.setAttribute('class', 'additionButton');
    additionCol.appendChild(additionButton);
    additionRow.appendChild(additionCol);
    table.appendChild(additionRow);
}

async function loadStudents(){
    let facultyId         = getValueById("facultyField");
    let departmentId      = getValueById("departmentField");
    let groupId           = getValueById("groupField");
    let surnameVal        = getValueById("surnameField");
    let nameVal           = getValueById("nameField");
    let patronymicNameVal = getValueById("patronymicNameField")
    let response = await StudentsService.getList(facultyId, departmentId, groupId, surnameVal, nameVal, patronymicNameVal, pageNum);
    return response;
}

async function fillTable(){    
    let response = await loadStudents();
    let students = response.students;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    students.sort((a, b) => a.id-b.id);
    for(let student of students){
        let id             = student.id;
        let surname        = student.surname;
        let name           = student.name;
        let patronymicName = student.patronymicName;
        let groupName      = student.group.name;
        let departmentName = student.group.department.shortName;
        let facultyName    = student.group.department.faculty.shortName;
        let row = getTableRow(id, surname, name, patronymicName, groupName, departmentName, facultyName);
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

async function fillFaculties(){
    let faculties = await FacultiesService.getAll();
    fillSelect("facultyField", faculties, getOptionSN, "Институт...");
}

async function fillDepartments(facultyId){
    let departments = await DepartmentsService.getList(facultyId);
    fillSelect("departmentField", departments, getOptionSN, "Кафедра...");
}

async function fillGroups(facultyId, departmentId){
    let response = await GroupsService.getList(facultyId, departmentId, '', 0);
    let groups = response.groups;
    fillSelect("groupField", groups, getOptionN, "Группа...");
}

async function fillSelects(facultyId, departmentId){
    await fillFaculties();
    await fillDepartments(facultyId);
    await fillGroups(facultyId, departmentId);
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
    clearSelect("departmentField");
    fillDepartments(facultyId);
    clearSelect("groupField");
    fillGroups(facultyId,0);
}

async function selectDepartmentOnChange(event){
    let departmentId = event.originalTarget.value;
    clearSelect("groupField");
    fillGroups(0,departmentId);
}

async function init(){
    setOnClick('searchBtn',   onSearch);
    setOnClick('nextPageBtn', onNextPage);
    setOnClick('prevPageBtn', onPrevPage);
    document.getElementById('facultyField'   ).onchange = selectFacultyOnChange;
    document.getElementById('departmentField').onchange = selectDepartmentOnChange;
    type = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    errorBar = document.getElementsByTagName('error-bar')[0];
    table = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
    let facultyId, departmentId, groupId;
    let facultyField    = document.getElementById("facultyField");
    let departmentField = document.getElementById("departmentField");
    let groupField      = document.getElementById("groupField");
    switch(type){
        case 'group':
            facultyId    = authorizedData.department.faculty.id;
            departmentId = authorizedData.department.id;
            groupId      = authorizedData.id;
            facultyField.disabled    = true;
            departmentField.disabled = true;
            groupField.disabled      = true;
            break;
        case 'department':
            facultyId    = authorizedData.faculty.id;
            departmentId = authorizedData.id;
            groupId      = 0;
            facultyField.disabled    = true;
            departmentField.disabled = true;
            break;
        case 'faculty':
            facultyId    = authorizedData.id;
            departmentId = 0;
            groupId      = 0;
            facultyField.disabled = true;
            break;
        case 'admin':
            facultyId    = 0;
            departmentId = 0;
            groupId      = 0;
            break;
        default:
            showError('Ошибка типа авторизации', errorBar);
            return;
    }
    await fillSelects(facultyId, departmentId);
    facultyField.value    = facultyId;
    departmentField.value = departmentId;
    groupField.value      = groupId;
    await fillTable();
}



