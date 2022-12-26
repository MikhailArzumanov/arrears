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

window.onload = init;
setTimeout(fadeIn, 1200);

const WAS_NOT_CHOSEN = 'Дисциплина не была выбрана';

let id;
let errorBar;
let authType;
let authorizedData;

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
    console.log(response);
    showError('Запись была успешно отредактирована', errorBar);
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
    showError('Запись была успешно удалена', errorBar);
    setTimeout(()=>{
        sessionStorage.removeItem('departmentId');
        redirect('/disciplines/list');
    }, 1200)
}

function removeLine(event){
    let row = event.originalTarget.parentElement.parentElement;
    groupsTable.removeChild(row);
}

function removeGroup(event){
    removeLine(event);
    let groupId = event.originalTarget.getAttribute('id');
    let i = groupsIds.indexOf(groupId);
    groupsIds.splice(i, 1);
}

function removeMagister(event){
    removeLine(event);
    let magisterId = event.originalTarget.getAttribute('id');
    let i = magistersIds.indexOf(magisterId);
    magistersIds.splice(i, 1);
}

function addGroup(group){
    if(groupsIds.includes(group.id)){
        showError('Группа уже была добавлена.', errorBar);
        return;
    }

    groupsIds.push(group.id);

    let row = document.createElement('tr');
    let idCol     = document.createElement('td');
    let nameCol   = document.createElement('td');
    let removeCol = document.createElement('td');

    let removeButton = document.createElement('button');
    removeButton.innerHTML = 'x';
    removeButton.onclick   = removeGroup;
    removeButton.setAttribute('id', group.id);

    idCol.innerHTML   = group.id;
    nameCol.innerHTML = group.name;
    removeCol.appendChild(removeButton);

    row.appendChild(idCol);
    row.appendChild(nameCol);
    row.appendChild(removeCol);

    groupsTable.insertBefore(row, groupsFilterLine);
}

function addMagister(magister){
    if(magistersIds.includes(magister.id)){
        showError('Преподаватель уже был добавлен.', errorBar);
        return;
    }

    magistersIds.push(magister.id);

    let row = document.createElement('tr');
    let idCol     = document.createElement('td');
    let nameCol   = document.createElement('td');
    let removeCol = document.createElement('td');

    let removeButton = document.createElement('button');
    removeButton.innerHTML = 'x';
    removeButton.onclick   = removeMagister;
    removeButton.setAttribute('id', magister.id);

    idCol.innerHTML   = magister.id;
    nameCol.innerHTML = `${magister.surname} ${magister.name} ${magister.patronymicName}`;
    removeCol.appendChild(removeButton);

    row.appendChild(idCol);
    row.appendChild(nameCol);
    row.appendChild(removeCol);

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

function getOptionN(nModel){
    let option = document.createElement('option');
    option.innerHTML = nModel.name;
    option.value     = nModel.id;
    return option;
}

function getOptionFullName(fullNameModel){
    let option = document.createElement('option');
    option.innerHTML = `${fullNameModel.surname} ${fullNameModel.name} ${fullNameModel.patronymicName}`;
    option.value     = fullNameModel.id;
    return option;
}

function getOptionSame(value){
    let option = document.createElement('option');
    option.innerHTML = value;
    option.value     = value;
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

function fillSelect(selectId, dataArray, optionFn){
    let select = document.getElementById(selectId);
    for(let dataCol of dataArray){
        let option = optionFn(dataCol);
        select.appendChild(option);
    }
}

async function loadMagisters(searchVal){
    let magistersResp = await MagistersService.getList(0,0,searchVal,'','',0);
    let magisters = magistersResp.magisters;
    fillSelect('magistersSelectField', magisters, getOptionFullName);
}
async function reloadMagisters(){
    clearSelect('magistersSelectField');
    let searchVal = document.getElementById('magisterSurnameField').value;
    await loadMagisters(searchVal);
}

async function loadGroups(searchVal){
    let groupsResp = await GroupsService.getList(0,0,searchVal,0);
    let groups = groupsResp.groups;
    fillSelect('groupsSelectField', groups, getOptionN);
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
    let yearsSelect     = document.getElementById('yearField');
    let semestersSelect = document.getElementById('semestrField');
    let passTypesSelect = document.getElementById('passTypeField');
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

async function addGroupHandler(){
    let groupId = getValueById('groupsSelectField');
    if(groupId == 0){showError('Выберите группу для добавления.', errorBar); return;}
    let response;
    if(authType == 'admin') 
        response = await GroupsService.getConcreteAsAdministrator(groupId);
    else response = await GroupsService.getConcreteTruncated(groupId);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    addGroup(response);
}

async function addMagisterHandler(){
    let magisterId = getValueById('magistersSelectField');
    if(magisterId == 0){showError('Выберите преподавателя для добавления.', errorBar); return;}
    let response;
    if(authType == 'admin') 
        response = await MagistersService.getConcreteAsAdministrator(magisterId);
    else response = await MagistersService.getConcreteTruncated(magisterId);
    if(response == null){showError(ErrorsService.getLastError(), errorBar); return;}
    addMagister(response);
}

function setOnClickById(id, fn){
    let element = document.getElementById(id);
    element.onclick = fn;
}

async function init(){
    setOnClickById('saveButton',          save);
    setOnClickById('deleteButton', deleteEntry);
    setOnClickById('groupsFilterButton',       reloadGroups);
    setOnClickById('addGroupButton',        addGroupHandler);
    setOnClickById('magistersFilterButton', reloadMagisters);
    setOnClickById('addMagisterButton',  addMagisterHandler);
    fillStaticSelects();
    authType       = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
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