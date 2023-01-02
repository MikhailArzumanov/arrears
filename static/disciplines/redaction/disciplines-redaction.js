import { fadeIn } from "../../-functions/fade.js";
import { redirect } from "../../-functions/redirect.js";
import { showError } from "../../-functions/showError.js";
import { getValueById, setValueById } from "../../-functions/valById.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { FacultiesService } from "../../-services/faculties.service.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { DepartmentsService } from "../../-services/departments.service.js";
import { Discipline } from "../../-models/discipline.model.js";
import { DisciplinesService } from "../../-services/disciplines.service.js";
import { GroupsService } from "../../-services/groups.service.js";
import { MagistersService } from "../../-services/magisters.service.js";
import { fillRequiredSelect } from "../../-functions/fillSelect.js";
import { setOnClick } from "../../-functions/setHandler.js";
import { getOptionN, getOptionSame } from "../../-functions/getOption.js";
import { addColumn } from "../../-functions/addColumn.js";
import { addButtonColumn } from "../../-functions/addButtonColumn.js";
import { clearSelect } from "../../-functions/clearSelect.js";
import { redirectIfIsntAuthorized } from "../../-functions/redirection.js";

window.onload = init;
setTimeout(fadeIn, 1200);
redirectIfIsntAuthorized();

const WAS_NOT_CHOSEN = 'Дисциплина не была выбрана';
const REDACTION_SUCCESS = 'Запись была успешно отредактирована';
const DELETION_SUCCESS = 'Запись была успешно удалена';
const GROUP_WAS_ALREADY_ADDED = 'Группа уже была добавлена.';
const MAGISTER_WAS_ALREADY_ADDED = 'Преподаватель уже был добавлен.';
const CHOOSE_GROUP = 'Выберите группу для добавления.';
const CHOOSE_MAGISTER = 'Выберите преподавателя для добавления.';

let id;
let errorBar;
let authType;
//let authorizedData;

let groupsTable;
let groupsFilterLine;

let magistersTable;
let magistersFilterLine

let discipline;

const firstYear = 2018;
const lastYear  = 2022;
const semesters = ['осенний','весенний'];
const passTypes = ['зачет','диф. зачет', 'экзамен']

let controlsNames = [
    'idField',           
    'nameField',         
    'shortNameField',
    'passTypeField',
    'semestrField',
    'yearField',
    'groupsNameField',       
    'groupsFilterBtn',   
    'groupsSelectField',
    'magistersSurnameField',       
    'magistersFilterBtn',   
    'magistersSelectField',
    'saveButton',
    'deleteButton',
];

let magistersIds = [];
let groupsIds    = [];

async function save(){
    let name      = getValueById('nameField');
    let shortName = getValueById('shortNameField');
    let passType  = getValueById('passTypeField');
    let year      = getValueById('yearField');
    let semestr   = getValueById('semestrField');
    let discipline = new Discipline(id,name,shortName,passType,year,semestr,[],[]);
    let response;
    if(authType == "admin")
        response = await DisciplinesService.redactAsAdministrator(discipline,groupsIds,magistersIds);
    else response = await DisciplinesService.redactEntry(discipline,groupsIds,magistersIds);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError(REDACTION_SUCCESS, errorBar);
}

async function deleteEntry(){
    let name = getValueById('nameField');
    let answer = confirm(`Вы уверены, что хотите удалить дисциплину '${name}'?`);
    if(!answer) return;
    let response;
    if(authType == "admin") 
        response = await DisciplinesService.deleteAsAdministartor(id);
    else response = await DisciplinesService.deleteEntry(id);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    showError(DELETION_SUCCESS, errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('departmentId');
        redirect('/disciplines/list');
    }, 1200)
}

function removeElement(event, array){
    let row = event.originalTarget.parentElement.parentElement;
    row.parentElement.removeChild(row);
    let id = Number(event.originalTarget.getAttribute('id'));
    let i = array.indexOf(id);
    array.splice(i, 1);
}

function removeGroup(event){
    removeElement(event, groupsIds);
}

function removeMagister(event){
    removeElement(event, magistersIds);
}

function addListsButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, id){
    let attributes = [];
    attributes.push({key:'id', val:id});
    addButtonColumn(row,tdClass,buttonInnerHtml,buttonHandler,attributes);
}

function pushOrNotify(array, val, annotation){
    if(array.includes(val)){
        showError(annotation, errorBar);
        return true;
    }
    array.push(val);
}

function addGroup(group){
    let alreadyIn = pushOrNotify(groupsIds, group.id, GROUP_WAS_ALREADY_ADDED);
    if(alreadyIn) return;

    let row = document.createElement('tr');
    addColumn(row, group.id,   'groupIdCol');
    addColumn(row, group.name, 'groupNameCol');
    addListsButtonColumn(row, 'removeGroupColumn', 'x', removeGroup, group.id);

    groupsTable.insertBefore(row, groupsFilterLine);
}

function addMagister(magister){
    let alreadyIn = pushOrNotify(magistersIds, magister.id, MAGISTER_WAS_ALREADY_ADDED);
    if(alreadyIn) return;

    let magisterFullName = `${magister.surname} ${magister.name} ${magister.patronymicName}`;

    let row = document.createElement('tr');
    addColumn(row, magister.id,      'magisterIdCol');
    addColumn(row, magisterFullName, 'magisterNameCol');
    addListsButtonColumn(row, 'removeMagisterColumn', 'x', removeMagister, magister.id);

    magistersTable.insertBefore(row, magistersFilterLine);
}

function fillFields(discipline){
    setValueById('idField',               discipline.id);
    setValueById('shortNameField', discipline.shortName);
    setValueById('nameField',           discipline.name);
    setValueById('passTypeField',   discipline.passType);
    setValueById('yearField',           discipline.year);
    setValueById('semestrField',     discipline.semestr);
    for(let group of discipline.groups)
        addGroup(group);
    for(let magister of discipline.magisters)
        addMagister(magister);
}

function clearFieldsAndDisableControls(){
    for(let controlName of controlsNames){
        let control = document.getElementById(controlName);
        control.value    = '';
        control.disabled = true;
    }
}

function getOptionFullName(fullNameModel){
    let option = document.createElement('option');
    option.innerHTML = `${fullNameModel.surname} ${fullNameModel.name} ${fullNameModel.patronymicName}`;
    option.value     = fullNameModel.id;
    return option;
}

async function loadMagisters(searchVal){
    let magistersResp = await MagistersService.getList(0,0,searchVal,'','',0);
    let magisters = magistersResp.magisters;
    fillRequiredSelect('magistersSelectField', magisters, getOptionFullName);
}
async function reloadMagisters(){
    clearSelect('magistersSelectField');
    let searchVal = document.getElementById('magisterSurnameField').value;
    await loadMagisters(searchVal);
}

async function loadGroups(searchVal){
    let groupsResp = await GroupsService.getList(0,0,searchVal,0);
    let groups = groupsResp.groups;
    fillRequiredSelect('groupsSelectField', groups, getOptionN);
}

async function reloadGroups(){
    clearSelect('groupsSelectField');
    let searchVal = document.getElementById('groupNameField').value;
    await loadGroups(searchVal);
}

async function loadAndFillData(){
    await loadGroups('');
    await loadMagisters('');
}

function fillStaticSelects(){
    let years = [];
    for(let year = firstYear; year <= lastYear; year++){
        years.push(year);
    }
    fillRequiredSelect('yearField',     years,     getOptionSame);
    fillRequiredSelect('semestrField' , semesters, getOptionSame);
    fillRequiredSelect('passTypeField', passTypes, getOptionSame);
}

async function addGroupHandler(){
    let groupId = getValueById('groupsSelectField');
    if(groupId == 0){showError(CHOOSE_GROUP, errorBar); return;}
    let response;
    if(authType == 'admin') 
        response = await GroupsService.getConcreteAsAdministrator(groupId);
    else response = await GroupsService.getConcreteTruncated(groupId);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    addGroup(response);
}

async function addMagisterHandler(){
    let magisterId = getValueById('magistersSelectField');
    if(magisterId == 0){showError(CHOOSE_MAGISTER, errorBar); return;}
    let response;
    if(authType == 'admin') 
        response = await MagistersService.getConcreteAsAdministrator(magisterId);
    else response = await MagistersService.getConcreteTruncated(magisterId);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    addMagister(response);
}


async function init(){
    setOnClick('saveButton',          save);
    setOnClick('deleteButton', deleteEntry);

    setOnClick('groupsFilterButton',    reloadGroups);
    setOnClick('addGroupButton',        addGroupHandler);
    setOnClick('magistersFilterButton', reloadMagisters);
    setOnClick('addMagisterButton',     addMagisterHandler);

    fillStaticSelects();
    
    authType       = AuthorizedService.getAuthorizedType;
    //authorizedData = AuthorizedService.getAuthorizedData;
    
    groupsTable      = document.getElementById('groupsList').getElementsByTagName('tbody')[0];
    groupsFilterLine = document.getElementById('groupsFilterLine');

    magistersTable      = document.getElementById('magistersList').getElementsByTagName('tbody')[0];
    magistersFilterLine = document.getElementById('magistersFilterLine');

    errorBar = document.getElementsByTagName('error-bar')[0];
    id = sessionStorage.getItem('disciplineId');
    if(id == null) {
        showError(WAS_NOT_CHOSEN, errorBar);
        clearFieldsAndDisableControls();
        //setTimeout(() => redirect('/disciplines/list'), 1200);
        return;
    }
    let response;
    if(authType == "admin")
        response = await DisciplinesService.getConcreteAsAdministrator(id);
    else response = await DisciplinesService.getConcrete(id);
    if(response == null) showError(ErrorsService.getLastError(), errorBar)
    else{
        discipline = response;
        await loadAndFillData();
        fillFields(discipline);
    }
}