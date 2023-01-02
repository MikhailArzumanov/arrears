import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { addColumn } from "../../-functions/addColumn.js";
import { clearSelect } from "../../-functions/clearSelect.js";
import { clearTable } from "../../-functions/clearTable.js";
import { createAdditionRow } from "../../-functions/createAdditionRow.js";
import { fadeIn } from "../../-functions/fade.js";
import { fillDepartments, fillFaculties, fillGroups } from "../../-functions/fillSelects.js";
import { fillTableData } from "../../-functions/fillTableData.js";
import { redirect } from "../../-functions/redirect.js";
import { redirectIfIsntAuthorized } from "../../-functions/redirection.js";
import { setDisable } from "../../-functions/setDisabled.js";
import { setOnChange, setOnClick } from "../../-functions/setHandler.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Student } from "../../-models/student.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { GroupsService } from "../../-services/groups.service.js";
import { StudentsService } from "../../-services/students.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const ADDITION_BUTTON_ANNOTATION = 'Добавить студента';
const ADDITION_COLUMN_WIDTH = 9;

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

function addStudentButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, studentFullName=null){
    let attributes = [];
    attributes.push({key:'studentId', val:id});
    if(studentFullName) attributes.push({key:'studentFullName', val:studentFullName});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}

function getTableRow(id, surname, name, patronymicName, groupName, departmentName, facultyName){
    let row = document.createElement('tr');
    addColumn(row, id,             'idCol'            );
    addColumn(row, surname,        'surnameCol'       );
    addColumn(row, name,           'nameCol'          );
    addColumn(row, patronymicName, 'patronymicNameCol');
    addColumn(row, facultyName,    'facultyCol'       );
    addColumn(row, departmentName, 'departmentCol'    );
    addColumn(row, groupName,      'groupCol'         );
    
    let studentFullName = `${surname} ${name} ${patronymicName}`;

    addStudentButtonColumn(row, 'redactCol', 'Редактировать', redactStudentHandler, id);
    addStudentButtonColumn(row, 'deleteCol', 'Удалить', deleteStudent, id, studentFullName);

    row.setAttribute('class', 'dataRow');
    return row;
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

function getRowByModel(student){
    let id             = student.id;
    let surname        = student.surname;
    let name           = student.name;
    let patronymicName = student.patronymicName;
    let groupName      = student.group.name;
    let departmentName = student.group.department.shortName;
    let facultyName    = student.group.department.faculty.shortName;
    return getTableRow(id, surname, name, patronymicName, groupName, departmentName, facultyName);
}

async function fillTable(){    
    let response = await loadStudents();
    let students = response.students;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    fillTableData(students, getRowByModel, table, additionRow);
}

async function refillTable(){
    clearTable(table, 'dataRow');
    await fillTable();
}

async function fillSelects(facultyId, departmentId){
    await fillFaculties("facultyField", "Институт...");
    await fillDepartments(facultyId, "departmentField", "Кафедра...");
    await fillGroups(facultyId, departmentId, "groupField", "Группа...");
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
    fillDepartments(facultyId, "departmentField", "Кафедра...");
    clearSelect("groupField");
    fillGroups(facultyId,0, "groupField", "Группа...");
}

async function selectDepartmentOnChange(event){
    let departmentId = event.originalTarget.value;
    clearSelect("groupField");
    fillGroups(0,departmentId, "groupField", "Группа...");
}

async function init(){
    setOnClick('searchBtn',   onSearch);
    setOnClick('nextPageBtn', onNextPage);
    setOnClick('prevPageBtn', onPrevPage);
    setOnChange('facultyField', selectFacultyOnChange);
    setOnChange('departmentField', selectDepartmentOnChange);

    type = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;

    errorBar = document.getElementsByTagName('error-bar')[0];

    table = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
    additionRow = createAdditionRow(table, ADDITION_COLUMN_WIDTH, ADDITION_BUTTON_ANNOTATION, addEntry);

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



