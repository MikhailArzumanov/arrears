import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Discipline } from "../../-models/discipline.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { DisciplinesService } from "../../-services/disciplines.service.js";
import { addColumn } from "../../-functions/addColumn.js";
import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { fillSelect } from "../../-functions/fillSelect.js";
import { getOptionSame } from "../../-functions/getOption.js";
import { clearTable } from "../../-functions/clearTable.js";
import { setOnChange, setOnClick } from "../../-functions/setHandler.js";
import { createAdditionRow } from "../../-functions/createAdditionRow.js";
import { clearSelect } from "../../-functions/clearSelect.js";
import { fillDepartments, fillFaculties, fillGroups } from "../../-functions/fillSelects.js";
import { fillTableData } from "../../-functions/fillTableData.js";
import { redirectIfIsntAuthorized } from "../../-functions/redirection.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const ADDITION_BUTTON_ANNOTATION = 'Добавить дисциплину';
const ADDITION_COLUMN_WIDTH      = 9;
const AUTH_TYPE_ERROR = 'Ошибка типа авторизации';

const getSheetTypes = ['group', 'student'];
const firstYear = 2018;
const lastYear  = 2022;
const semesters = ['осенний','весенний'];
const passTypes = ['зачет','диф. зачет', 'экзамен']

let pageNum = 1;
let table;
let authType;
let authorizedData;
let additionRow = null;
let errorBar;

async function addEntry(){
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
    redirect('/arrears/creation');
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
}

function getGroupsCol(groupsNames){
    let groupsStr = groupsNames.reduce((prev, cur, i)=>{
        return (i%5 != 4 ? prev+cur+', ' : prev+cur+'<br>')
    },'');
    let lastSymbol = groupsStr[groupsStr.length-1];
    return groupsStr.slice(0, lastSymbol == ' ' ? -2 : -4);
}


function addDisciplineButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id, disciplineName=null){
    let attributes = [];
    attributes.push({key:'disciplineId', val:id});
    if(disciplineName) attributes.push({key:'disciplineName', val:disciplineName});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}

function getTableRow(id, name, groupsNames, year, semestr, type){
    let groupsCol = getGroupsCol(groupsNames);
    let row = document.createElement('tr');

    addColumn(row, id,       'idCol'     );
    addColumn(row, name,     'nameCol'   );
    addColumn(row, groupsCol,'groupCol'  );
    addColumn(row, year,     'yearCol'   );
    addColumn(row, semestr,  'semestrCol');
    addColumn(row, type,     'typeCol'   );

    addDisciplineButtonColumn(row, 'sheetCol', 'Сформировать лист', getSheetHandler, id);
    
    if(!getSheetTypes.includes(authType)){
        addDisciplineButtonColumn(row, 'redactCol', 'Редактировать', redactDisciplineHandler, id);
        addDisciplineButtonColumn(row, 'deleteCol', 'Удалить', deleteDiscipline, id, name);
    }

    row.setAttribute('class', 'dataRow');
    return row;
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

function getRowByModel(discipline){
    let id          = discipline.id;
    let name        = discipline.shortName;
    let groupsNames = discipline.groups.map((group)=>group.name);
    let year        = discipline.year;
    let semestr     = discipline.semestr;
    let type        = discipline.passType;
    return getTableRow(id, name, groupsNames, year, semestr, type);
}

async function fillTable(){    
    let response = await loadDisciplines();
    let disciplines = response.disciplines;
    setDisable('nextPageBtn', pageNum >= response.pagesAmount);
    fillTableData(disciplines, getRowByModel, table, additionRow);
}

async function refillTable(){
    clearTable(table,'dataRow');
    await fillTable();
}


async function fillSelects(facultyId, departmentId){
    await fillFaculties("facultyField", "Институт...");
    await fillDepartments(facultyId, "departmentField", "Кафедра...");
    await fillGroups(facultyId, departmentId, "groupField", "Группа...");
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

function fillStaticSelects(){
    let years = [];
    for(let year = firstYear; year <= lastYear; year++)
        years.push(year);
    fillSelect('yearField',     years,     getOptionSame, 'Год...');
    fillSelect('semestrField',  semesters, getOptionSame, 'Семестр...');
    fillSelect('passTypeField', passTypes, getOptionSame, 'Тип сдачи...');
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
    setOnChange('facultyField'   , selectFacultyOnChange);
    setOnChange('departmentField', selectDepartmentOnChange);

    authType = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;

    errorBar = document.getElementsByTagName('error-bar')[0];

    initTableHeader();

    table = document.getElementById('disciplinesTable').getElementsByTagName('tbody')[0];
    if(!getSheetTypes.includes(authType))
        additionRow = createAdditionRow(table, ADDITION_COLUMN_WIDTH, ADDITION_BUTTON_ANNOTATION, addEntry);

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
            showError(AUTH_TYPE_ERROR, errorBar);
            return;
    }

    await fillSelects(facultyId, departmentId);
    facultyField.value    = facultyId;
    departmentField.value = departmentId;
    groupField.value      = groupId;

    await fillTable();
}



