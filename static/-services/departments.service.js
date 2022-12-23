import { http } from '../-http/http.js';
import { AuthData } from '../-models/auth-data.model.js';
import {AuthorizedService} from './-base-services/authorized.service.js';
import { DepartmentRedactionRequest } from './-models/departments/department-redaction-request.model.js';

export class DepartmentsService extends AuthorizedService{
    static CONTROLLER_NAME = 'departments';
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

    static async getAll(facultyId){
        let METHOD_NAME = 'all';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {facultyId: facultyId};
        return await http.get(url,headers,params, false);
    }

    static async getConcrete(id){
        let METHOD_NAME = 'get';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = this.getAuthorizationData;
        return await http.post(url,headers,params,body,false);
    }

    static async getFirstByFaculty(){
        let METHOD_NAME = 'by_faculty';   
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {facultyId: this.getAuthorizedData.id};
        return await http.get(url,headers,params,false);
    }

    static async addDepartment(department){
        let METHOD_NAME = "add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = new DepartmentRedactionRequest(this.getAuthorizationData, department);
        return await http.post(url,headers,params,body,false);
    }
    
    

    static async selfRedact(newAuthData, oldAuthData){
        let METHOD_NAME = '';
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType}
        let departmentData          = this.getAuthorizedData;
            departmentData.login    = newAuthData.login;
            departmentData.password = newAuthData.password;
        let url  = `${this.CONTROLLER_URL}/${departmentData.id}`;
        let body = new DepartmentRedactionRequest(oldAuthData,departmentData);
        return await http.put(url,headers,params,body,false);
    }

    static async redactDepartment(department){
        let METHOD_NAME = "";
        let url = `${this.CONTROLLER_URL}/${department.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new DepartmentRedactionRequest(this.getAuthorizationData, department);
        return await http.put(url,headers,params,body,false);
    }

    static async deleteDepartment(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body   = this.getAuthorizationData;
        return await http.delete(url,headers,params,body,false);
    }
    

    static async getConcreteAsAdministrator(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        return await http.get(url,headers,params,false);
    }

    static async redactAsAdministrator(department){
        let METHOD_NAME = "admin";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${department.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = department;
        return await http.put(url,headers,params,body,false);
    }

    static async addDepartmentAsAdministrator(department){
        let METHOD_NAME = "admin/add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = department;
        return await http.post(url,headers,params,body,false);
    }

    static async deleteDepartmentAsAdministartor(id){
        let METHOD_NAME = 'admin';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = null;
        return await http.delete(url,headers,params,body,false);
    }
}