import { http } from '../-http/http.js';
import { AuthData } from '../-models/auth-data.model.js';
import {AuthorizedService} from './-base-services/authorized.service.js';
import { StudentRedactionRequest } from './-models/students/student-redaction-request.model.js';

export class StudentsService extends AuthorizedService{
    static CONTROLLER_NAME = 'students';
    static CONTROLLER_URL  = this.SERVICE_URL+this.CONTROLLER_NAME;

    static async login(login, password){
        let METHOD_NAME = 'token'
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = {};
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = new AuthData(login, password);
        return await http.post(url,headers,params,body,false);
    }

    //static async getFirstByGroup(groupId){
    //    let METHOD_NAME = 'by_group';
    //    let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
    //    let headers = this.getTokenHeaders();
    //        headers['Content-Type'] = "application/json;charset=UTF-8";
    //    let params = {groupId: groupId};
    //    
    //    return await http.get(url, headers, params, false);
    //}

    static async getList(facultyId, departmentId, groupId,
                         searchSurname, searchName, searchPatronymicName,
                         pageNum, pageSize=20){
        let METHOD_NAME = 'list';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {facultyId: facultyId, departmentId: departmentId, groupId: groupId,
                      searchSurname:searchSurname, searchName: searchName, searchPatronymicName:searchPatronymicName,
                      pageNum: pageNum, pageSize: pageSize};
        return await http.get(url, headers, params, false);
    }

    static async getConcrete(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = this.getAuthorizationData;
        return await http.post(url,headers,params,body,false);
    }

    static async addEntry(student){
        let METHOD_NAME = "add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new StudentRedactionRequest(this.getAuthorizationData, student);
        return await http.post(url,headers,params,body,false);
    }

    static async redactEntry(student){
        let METHOD_NAME = "";
        let url = `${this.CONTROLLER_URL}/${student.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new StudentRedactionRequest(this.getAuthorizationData, student);
        return await http.put(url,headers,params,body,false);
    }

    static async deleteEntry(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body   = this.getAuthorizationData;
        return await http.delete(url,headers,params,body,false);
    }

    static async selfRedact(newAuthData, oldAuthData){
        let METHOD_NAME = '';
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let studentsData          = this.getAuthorizedData;
            studentsData.login    = newAuthData.login;
            studentsData.password = newAuthData.password;
        let url  = `${this.CONTROLLER_URL}/${studentsData.id}`;
        let body = new StudentRedactionRequest(oldAuthData,studentsData);
        return await http.put(url,headers,params,body,false);
    }

    static async redactAsAdministrator(student){
        let METHOD_NAME = "admin";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${student.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = student;
        return await http.put(url,headers,params,body,false);
    }
    
    static async getConcreteAsAdministrator(id){
        let METHOD_NAME = 'admin';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        
        return await http.get(url,headers,params,false);
    }

    static async addAsAdministrator(student){
        let METHOD_NAME = "admin/add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = student;
        return await http.post(url,headers,params,body,false);
    }

    static async deleteAsAdministartor(id){
        let METHOD_NAME = 'admin';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = null;
        return await http.delete(url,headers,params,body,false);
    }
}