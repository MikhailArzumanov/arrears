import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Discipline } from "../../-models/discipline.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { GroupsService } from "../../-services/groups.service.js";
import { DisciplinesService } from "../../-services/disciplines.service.js";

window.onload = init;
setTimeout(fadeIn, 1200);


const ADDITION_BUTTON_ANNOTATION = 'Добавить дисциплину';

const getSheetTypes = ['group', 'student'];
const firstYear = 2018;
const lastYear  = 2022;
const semesters = ['осенний','весенний'];
const passTypes = ['зачет','диф. зачет', 'экзамен']

let pageNum = 1;
let table;
let authType;
let authorizedData;
let additionRow;
let errorBar;

async function addEntry(){
    console.log('addition attempt');
    if(getSheetTypes.includes(authType)) return;
    let discipline = new Discipline(null,'%%%','%','зачет',firstYear.toString(),'осенний');
    let response;
    if(authType == "admin")
        response = await DisciplinesService.addAsAdministrator(discipline,[],[]);
    else response = await DisciplinesService.addEntry(discipline,[],[]);
    if(response == null) showError(ErrorsService.getLastError(), errorBar);
    else{
        let tr = getTableRow(response.id, response.shortName, [], 
                             response.year, response.semestr, response.passType);
        table.removeChild(additionRow);
        table.appendChild(tr);
        table.appendChild(additionRow);
    }
}

function redactDisciplineHandler(event){
    let element = event.currentTarget;
    let id = element.getAttribute('disciplineId');
    sessionStorage.setItem('disciplineId', id);
    redirect('/disciplines/redaction');
}

function getSheetHandler(event){
    let element      = event.originalTarget;
    let disciplineId = element.getAttribute('disciplineId');
    sessionStorage.setItem('disciplineId', disciplineId);
    redirect('/arrearsSheets/creation');
}

async function deleteDiscipline(event){
    let element = event.currentTarget;
    let id       = element.getAttribute('disciplineId');
    let name = element.getAttribute('disciplineName');
    let answer = confirm(`Вы уверены, что хотите удалить дисциплину '${name}'?`);
    if(!answer) return;
    let response;
    if(authType == "admin")
        response = await DisciplinesService.deleteAsAdministartor(id);
    else response = await DisciplinesService.deleteEntry(id);
    if(response == null){ showError(ErrorsService.getLastError(), errorBar); return;}
    let tableRow = element.parentNode.parentNode;
    table.removeChild(tableRow);
    console.log(element);
}

function getGroupsCol(groupsNames){
    let groupsStr = groupsNames.reduce((prev, cur, i)=>{
        return (i%5 != 4 ? prev+cur+', ' : prev+cur+'<br>')
    },'');
    let lastSymbol = groupsStr[groupsStr.length-1];
    return groupsStr.slice(0, lastSymbol == ' ' ? -2 : -4);
}

function getTableRow(id, name, groupsNames, year, semestr, type){
    let row = document.createElement('tr');
    let idCol      = document.createElement('td');
    let nameCol    = document.createElement('td');
    let groupsCol  = document.createElement('td');
    let yearCol    = document.createElement('td');
    let semestrCol = document.createElement('td');
    let typeCol    = document.createElement('td');
    let sheetCol   = document.createElement('td');
    
    let cols = [idCol, nameCol, groupsCol, yearCol, semestrCol, typeCol, sheetCol];

    if(!getSheetTypes.includes(authType)){
        let redactCol    = document.createElement('td');
        let redactButton = document.createElement('button');
        redactButton.setAttribute('disciplineId', id);
        redactButton.innerHTML = 'Редактировать';
        redactButton.onclick = redactDisciplineHandler;
        redactCol.appendChild(redactButton);
        redactCol.setAttribute('class',  'redactCol');
        cols.push(redactCol);
        
        let deleteCol    = document.createElement('td');
        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Удалить';
        deleteButton.setAttribute('disciplineId', id);
        deleteButton.setAttribute('disciplineName', name);
        deleteButton.onclick = deleteDiscipline;
        deleteCol.appendChild(deleteButton);
        deleteCol.setAttribute('class', 'deleteCol');
        cols.push(deleteCol);
    }
    
    let sheetButton = document.createElement('button');
    sheetButton.innerHTML = 'Сформировать лист';
    sheetButton.setAttribute('disciplineId', id);
    sheetButton.onclick = getSheetHandler;
    
    
    idCol.innerHTML      = id;
    nameCol.innerHTML    = name;
    groupsCol.innerHTML  = getGroupsCol(groupsNames);
    yearCol.innerHTML    = year;
    semestrCol.innerHTML = semestr;
    typeCol.innerHTML    = type;
    sheetCol.appendChild(sheetButton);

    idCol.setAttribute('class',      'idCol');
    nameCol.setAttribute('class',    'nameCol');
    groupsCol.setAttribute('class',  'groupCol');
    yearCol.setAttribute('class',    'yearCol');
    semestrCol.setAttribute('class', 'semestrCol');
    typeCol.setAttribute('class',    'typeCol');
    sheetCol.setAttribute('class',   'sheetCol');

    for(let col of cols) row.appendChild(col);

    row.setAttribute('class', 'dataRow');
    return row;
}


function createAdditionRow(){
    if(getSheetTypes.includes(authType)) return;
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
}

async function loadDisciplines(){
    let groupId     = getValueById("groupField");
    let nameVal     = getValueById("nameField");
    let yearVal     = getValueById("yearField");
    let semestrVal  = getValueById("semestrField");
    let passTypeVal = getValueById("passTypeField");
    let response = await DisciplinesService.getList(groupId, nameVal, yearVal, semestrVal, passTypeVal, pageNum);
    return response;
}

async function fillTable(){    
    let response = await loadDisciplines();
    let disciplines = response.disciplines;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    disciplines.sort((a, b) => a.id-b.id);
    for(let discipline of disciplines){
        let id          = discipline.id;
        let name        = discipline.shortName;
        let groupsNames = discipline.groups.map((group)=>group.name);
        let year        = discipline.year;
        let semestr     = discipline.semestr;
        let type        = discipline.passType;
        let row = getTableRow(id, name, groupsNames, year, semestr, type);
        row.setAttribute('class', 'dataRow');
        table.appendChild(row);
    }
    if(getSheetTypes.includes(authType)) return;
    table.appendChild(additionRow);
}

function clearTable(){
    let rows = document.getElementsByClassName('dataRow');
    while(rows.length > 0){
        table.removeChild(rows[0]);
    }
    if(getSheetTypes.includes(authType)) return;
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

function getOptionSame(value){
    let option = document.createElement('option');
    option.innerHTML = value;
    option.value     = value;
    return option;
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
    let year = firstYear;
    while(year <= lastYear){
        yearsSelect.appendChild(getOptionSame(year));
        year++;
    }
    for(let semestr of semesters) 
        semestersSelect.appendChild(getOptionSame(semestr));
    for(let passType of passTypes)
        passTypesSelect.appendChild(getOptionSame(passType));
}

function initTableHeader(){
    if(!getSheetTypes.includes(authType)){
        let redactCol = document.createElement('th');
        let deleteCol = document.createElement('th');
        redactCol.setAttribute('class', 'redactCol');
        deleteCol.setAttribute('class', 'deleteCol');
        let header = document.getElementById('tableHeader');
        header.appendChild(redactCol);
        header.appendChild(deleteCol);
    }
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
    createAdditionRow();
    table = document.getElementById('disciplinesTable').getElementsByTagName('tbody')[0];
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



