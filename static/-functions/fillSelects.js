import { DepartmentsService } from "../-services/departments.service.js";
import { FacultiesService } from "../-services/faculties.service.js";
import { GroupsService } from "../-services/groups.service.js";
import { fillSelect } from "./fillSelect.js";
import { getOptionN, getOptionSN } from "./getOption.js";

export async function fillFaculties(facultyFieldId, nullAnnotation){
    let faculties = await FacultiesService.getAll();
    fillSelect(facultyFieldId, faculties, getOptionSN, nullAnnotation);
}

export async function fillDepartments(facultyId, departmentFieldId, nullAnnotation){
    let departments = await DepartmentsService.getList(facultyId);
    fillSelect(departmentFieldId, departments, getOptionSN, nullAnnotation);
}

export async function fillGroups(facultyId, departmentId, groupFieldId, nullAnnotation){
    let response = await GroupsService.getList(facultyId, departmentId, '', 0);
    let groups = response.groups;
    fillSelect(groupFieldId, groups, getOptionN, nullAnnotation);
}