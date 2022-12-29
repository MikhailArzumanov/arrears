import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Arrear } from "../../-models/arrear.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { GroupsService } from "../../-services/groups.service.js";
import { ArrearsService } from "../../-services/arrears.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);

const confirmSheetTypes = ['faculty'];
const deleteSheetTypes  = ['student','group','faculty'];
const markArrearTypes   = ['magister','faculty'];
const closeArrearType   = ['faculty'];


const firstYear = 2018;
const lastYear  = 2022;
const semesters = ['осенний','весенний'];
const passTypes = ['зачет','диф. зачет', 'экзамен'];
const statuses  = [
    {text:"ожидание выдачи",   value:1},
    {text:"ожидание оценки",   value:2},
    {text:"оценка выставлена", value:3},
    {text:"закрыт",            value:4},
];

let pageNum = 1;
let table;
let authType;
let authorizedData;
let additionRow;
let errorBar;

// async function addEntry(){
//     if(getSheetTypes.includes(authType)) return;
//     let arrear = new Arrear(null,'%%%','%','зачет',firstYear.toString(),'осенний');
//     let response;
//     if(authType == "admin")
//         response = await ArrearsService.addAsAdministrator(arrear,[],[]);
//     else response = await ArrearsService.addEntry(arrear,[],[]);
//     if(response == null) showError(ErrorsService.getLastError(), errorBar);
//     else{
//         let tr = getTableRow(response.id, response.shortName, [], 
//                              response.year, response.semestr, response.passType);
//         table.removeChild(additionRow);
//         table.appendChild(tr);
//         table.appendChild(additionRow);
//     }
// }

//function redactArrearHandler(event){
//    let element = event.currentTarget;
//    let id = element.getAttribute('arrearId');
//    sessionStorage.setItem('arrearId', id);
//    redirect('/arrears/redaction');
//}

async function deleteArrear(event){
    let element = event.currentTarget;
    let id = element.getAttribute('arrearId');
    let annotation = element.getAttribute('annotation');
    let answer = confirm(`Вы уверены, что хотите удалить ${annotation}?`);
    if(!answer) return;
    let response;
    if(authType == "admin")
        response = await ArrearsService.deleteAsAdministartor(id);
    else response = await ArrearsService.deleteEntry(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
}

async function confirmArrear(event){
    let element = event.currentTarget;
    let id = element.getAttribute('arrearId');
    let annotation = element.getAttribute('annotation');
    let answer = confirm(`Вы уверены, что хотите подтвердить ${annotation}?`);
    if(!answer) return;
    let response;
    if(authType == "admin")
        response = await ArrearsService.confirmArrearAsAdministrator(id);
    else response = await ArrearsService.confirmArrear(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    let nextRow = tableRow.nextSibling;
    table.removeChild(tableRow);
    let row = getTableRowByModel(response);
    table.insertBefore(row, nextRow);
}

async function markArrear(event){
    let element = event.currentTarget;
    let id = element.getAttribute('arrearId');
    let annotation = element.getAttribute('annotation');
    let passType   = element.getAttribute('passType');
    let availableMarks = passType == 'зачет' ? '(зачет/незачет)' : '2-5';
    let answer = prompt(`Какую оценку вы хоите поставить в ${annotation}? (${availableMarks})`);
    if(!answer) return;
    let response;
    if(authType == "admin")
        response = await ArrearsService.markArrearAsAdministrator(id, answer);
    else response = await ArrearsService.markArrear(id, answer);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    let nextRow = tableRow.nextSibling;
    table.removeChild(tableRow);
    let row = getTableRowByModel(response);
    table.insertBefore(row, nextRow);
}

async function closeArrear(event){
    let element = event.currentTarget;
    let id = element.getAttribute('arrearId');
    let annotation = element.getAttribute('annotation');
    let answer = confirm(`Вы уверены, что хотите закрыть ${annotation}?`);
    if(!answer) return;
    let response;
    if(authType == "admin")
        response = await ArrearsService.closeArrearAsAdministrator(id);
    else response = await ArrearsService.closeArrear(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    let nextRow = tableRow.nextSibling;
    table.removeChild(tableRow);
    let row = getTableRowByModel(response);
    table.insertBefore(row, nextRow);
}

function addColumn(row, innerHtml, className){
    let col = document.createElement('td');
    col.innerHTML = innerHtml;
    col.setAttribute('class', className);
    row.appendChild(col);
}

function addButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, annotation, passType = null){
    let col = document.createElement('td');
    col.setAttribute('class', tdClass);
    let btn = document.createElement('button');
    btn.setAttribute('arrearId',           id);
    btn.setAttribute('annotation', annotation);
    if(passType) btn.setAttribute('passType', passType);
    btn.onclick   = buttonHandler;
    btn.innerHTML = buttonInnerHtml;
    col.appendChild(btn);
    row.appendChild(col);
}

function getTableRow(id, status,mark,student,magister,groupName,discipline,yearSemestr,passType){
    let row = document.createElement('tr');
    addColumn(row, id,          'idCol');
    addColumn(row, status,      'statusCol');
    addColumn(row, mark,        'markCol');
    addColumn(row, student,     'studentCol');
    addColumn(row, groupName,   'groupCol');
    addColumn(row, magister,    'magisterCol');
    addColumn(row, discipline,  'disciplineCol');
    addColumn(row, yearSemestr, 'yearSemestrCol');
    addColumn(row, passType,    'passTypeCol');
    
    let annotation = `лист студента '${student}' группы '${groupName}' по дисциплине '${discipline}'`;

    if(confirmSheetTypes.includes(authType))
        addButtonColumn(row, 'confirmCol', 'Подтвердить', confirmArrear, id, annotation);
    if(markArrearTypes.includes(authType))
        addButtonColumn(row, 'markBtnCol', 'Поставить оценку', markArrear, id, annotation, passType);
    if(closeArrearType.includes(authType))
        addButtonColumn(row, 'closeCol', 'Закрыть', closeArrear, id, annotation);
    if(deleteSheetTypes.includes(authType))
        addButtonColumn(row, 'deleteCol', 'Удалить', deleteArrear, id, annotation);

    row.setAttribute('class', 'dataRow');
    return row;
}

async function loadArrears(){
    let facultyId       = getValueById("facultyField");
    let departmentId    = getValueById("departmentField");
    let groupId         = getValueById("groupField");
    let studentSurname  = getValueById("studentSurnameField");
    let magisterSurname = getValueById("magisterSurnameField");
    let yearVal         = getValueById("yearField");
    let semestrVal      = getValueById("semestrField");
    let passTypeVal     = getValueById("passTypeField");
    let disciplineName  = getValueById("disciplineNameField");
    let statusVal       = getValueById("statusField");
    let response = await ArrearsService.getList(facultyId,departmentId,groupId,studentSurname,
                                                disciplineName,magisterSurname,statusVal,
                                                yearVal,semestrVal,passTypeVal,pageNum);
    return response;
}

function getFIO(model){
    return `${model.surname} ${model.name[0]}. ${model.patronymicName[0]}.`;
}

function getTableRowByModel(arrear){
    let id          = arrear.id;
    let status      = arrear.status;
    let mark        = arrear.mark ? arrear.mark : 'отсутствует';
    let student     = getFIO(arrear.student);
    let magister    = getFIO(arrear.magister);
    let groupName   = arrear.student.group.name;
    let discipline  = arrear.discipline.shortName;
    let yearSemestr = arrear.discipline.year+', '+arrear.discipline.semestr;
    let passType    = arrear.discipline.passType;
    let row = getTableRow(id, status,mark,student,magister,groupName,discipline,yearSemestr,passType);
    return row;
}

async function fillTable(){    
    let response = await loadArrears();
    let arrears = response.arrears;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    arrears.sort((a, b) => a.id-b.id);
    for(let arrear of arrears){
        let row = getTableRowByModel(arrear);
        row.setAttribute('class', 'dataRow');
        table.appendChild(row);
    }
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

let onSearch   = () => changePage(1-pageNum);
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

function getOption(text, value){
    let option = document.createElement('option');
    option.innerHTML = text;
    option.value     = value;
    return option;
}

function getOptionSame(value){
    return getOption(value,value);
}

function getOptionModel(model){
    return getOption(model.text, model.value);
}

function getSelectAndAddNullOption(id, nullAnnotation){
    let select = document.getElementById(id);
    select.appendChild(getNullOption(nullAnnotation));
    return select;
}

function fillStaticSelects(){
    let yearsSelect     = getSelectAndAddNullOption('yearField',     'Год...');
    let semestersSelect = getSelectAndAddNullOption('semestrField',  'Семестр...');
    let passTypesSelect = getSelectAndAddNullOption('passTypeField', 'Тип сдачи...');
    let statusesSelect  = getSelectAndAddNullOption('statusField',   'Статус...');
    let year = firstYear;
    while(year <= lastYear){
        yearsSelect.appendChild(getOptionSame(year));
        year++;
    }
    for(let semestr of semesters) 
        semestersSelect.appendChild(getOptionSame(semestr));
    for(let passType of passTypes)
        passTypesSelect.appendChild(getOptionSame(passType));
    for(let status of statuses)
        statusesSelect.appendChild(getOptionModel(status));
}

function addHeaderCol(row, className){
    let col = document.createElement('th');
    col.setAttribute('class', className);
    row.appendChild(col);
}

function initTableHeader(){
    let header = document.getElementById('tableHeader');
    if(confirmSheetTypes.includes(authType))
        addHeaderCol(header, 'confirmCol');
    if(deleteSheetTypes.includes(authType))
        addHeaderCol(header, 'markCol');
    if(markArrearTypes.includes(authType))
        addHeaderCol(header, 'closeCol');
    if(closeArrearType.includes(authType))
        addHeaderCol(header, 'deleteCol');
}

async function init(){
    fillStaticSelects();
    setOnClick('searchBtn',   onSearch);
    setOnClick('nextPageBtn', onNextPage);
    setOnClick('prevPageBtn', onPrevPage);
    document.getElementById('facultyField'   ).onchange = selectFacultyOnChange;
    document.getElementById('departmentField').onchange = selectDepartmentOnChange;
    authType = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    errorBar = document.getElementsByTagName('error-bar')[0];
    initTableHeader();
    table = document.getElementById('arrearsTable').getElementsByTagName('tbody')[0];
    let facultyId, departmentId, groupId;
    let facultyField    = document.getElementById("facultyField");
    let departmentField = document.getElementById("departmentField");
    let groupField      = document.getElementById("groupField");
    switch(authType){
        case 'student':
            facultyId    = authorizedData.group.department.faculty.id;
            departmentId = authorizedData.group.department.id;
            groupId      = authorizedData.group.id;
            facultyField.disabled    = true;
            departmentField.disabled = true;
            groupField.disabled      = true;
            break;
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
            break;
        case 'faculty':
            facultyId    = authorizedData.id;
            departmentId = 0;
            groupId      = 0;
            break;
        case 'magister':
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



