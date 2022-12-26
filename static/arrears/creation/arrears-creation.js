import { DisciplinesService } from "../../-services/disciplines.service.js";
import { StudentsService } from "../../-services/students.service.js";
import { fadeIn } from "../../-functions/fade.js";
import { showError } from "../../-functions/showError.js";
import { getValueById } from "../../-functions/valById.js";
import { Arrear } from "../../-models/arrear.model.js";
import { AuthorizedService } from "../../-services/-base-services/authorized.service.js";
import { ErrorsService } from "../../-services/-base-services/errors.service.js";
import { ArrearsService } from "../../-services/arrears.service.js";
import { redirect } from "../../-functions/redirect.js";

window.onload = init;
fadeIn();

const DISCIPLINE_WAS_NOT_CHOOSEN = 'Дисциплина не была выбрана.';

let errorBar;

let authType;
let authorizedData;

let disciplineId;
let discipline;

let facultyId    = 0;
let departmentId = 0;
let groupId      = 0;

function getFio(model){
    return `${model.surname} ${model.name[0]}. ${model.patronymicName[0]}.`;
}

function createOption(text, value){
    let option = document.createElement('option');
    option.innerHTML = text;
    option.value     = value;
    return option;
}

function createOptionFIO(model){
    let fio = getFio(model);
    let id  = model.id;
    return createOption(fio, id);
}

function setOneChoosenElementAndDisable(selectId, text, value){
    let select = document.getElementById(selectId);
    let option = createOption(text, value);
    select.appendChild(option);
    select.disabled = true;
}

function fillSelect(selectId, dataArray, optionFn){
    let select = document.getElementById(selectId);
    for(let element of dataArray)
        select.appendChild(optionFn(element));
    
}

async function fillMagisters(){
    let magisters = discipline.magisters;
    fillSelect('magisterField', magisters, createOptionFIO);
}

function clearSelect(selectId){
    document.getElementById(selectId).innerHTML = '';
}

async function fillStudents(){
    let surnameVal = getValueById('studentFilterField');
    let response = await StudentsService.getList(facultyId,departmentId,groupId,surnameVal,'','',0);
    let students = response.students;
    fillSelect('studentField', students, createOptionFIO);
}

async function filterStudents(){
    clearSelect('studentField');
    await fillStudents();
}

function setOnClick(controlId, handlerFn){
    document.getElementById(controlId).onclick = handlerFn;
}

async function saveEntry(){
    let magisterId = getValueById('magisterField');
    if(magisterId == 0){showError('Выберите преподавателя.',errorBar);return;}
    let studentId  = getValueById('studentField');
    if(magisterId == 0){showError('Выберите студента.',errorBar);return;}
    let arrear = new Arrear(0,0,0,0,magisterId,disciplineId,studentId)
    let response;
    if(authType == "admin")
        response = await ArrearsService.addAsAdministrator(arrear);
    else response = await ArrearsService.addEntry(arrear);
    if(response == null) showError(ErrorsService.getLastError(),errorBar)
    else {
        showError('Лист был успешно добавлен.', errorBar);
        sessionStorage.removeItem('disciplineId');
        setTimeout(()=>redirect('/arrears/list'),400);
    }
}

function setDisabled(id){
    document.getElementById(id).disabled = true;
}

let controlsIds = [
    'studentFilterField',
    'studentFilterBtn',
    'studentField',
    'magisterField',
    'saveButton',
]

function disableControls(){
    for(let controlId of controlsIds)
        setDisabled(controlId);
}

async function init(){
    errorBar = document.getElementsByTagName('error-bar')[0];
    setOnClick('studentFilterBtn', filterStudents);
    setOnClick('saveButton', saveEntry);
    authType       = AuthorizedService.getAuthorizedType;
    authorizedData = AuthorizedService.getAuthorizedData;
    disciplineId = sessionStorage.getItem('disciplineId');
    if(!disciplineId){
        showError(DISCIPLINE_WAS_NOT_CHOOSEN,errorBar); 
        disableControls(); 
        return;
    }
    if(authType == 'admin')
        discipline = await DisciplinesService.getConcreteAsAdministrator(disciplineId);
    else discipline = await DisciplinesService.getConcrete(disciplineId);
    let disciplineName = discipline.shortName;
    setOneChoosenElementAndDisable('disciplineField', disciplineName, disciplineId);
    fillMagisters();
    switch(authType){
        case 'student':
            let fio = getFio(authorizedData);
            setOneChoosenElementAndDisable('studentField', fio, authorizedData.id);
            document.getElementById('studentFilterField').disabled = true;
            document.getElementById('studentFilterBtn').disabled = true;
            break;
        case 'group':
            facultyId    = authorizedData.department.faculty.id;
            departmentId = authorizedData.department.id;
            groupId      = authorizedData.id;
            break;
        case 'department':
            facultyId    = authorizedData.faculty.id;
            departmentId = authorizedData.id;
            break;
        case 'faculty':
            facultyId    = authorizedData.id;
            break;
    }
    await fillStudents();
}