import { http } from '../-http/http.js';
import { AuthData } from '../-models/auth-data.model.js';
import {AuthorizedService} from './-base-services/authorized.service.js';
import { GroupRedactionRequest } from './-models/groups/group-redaction-request.model.js';

export class GroupsService extends AuthorizedService{
    static CONTROLLER_NAME = 'groups';
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

    static async getFirstByDepartment(departmentId){
        let METHOD_NAME = 'by_department';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {departmentId: departmentId};
        return await http.get(url, headers, params, false);
    }

    static async getList(facultyId, departmentId, searchVal, pageNum, pageSize=20){
        let METHOD_NAME = 'list';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {facultyId: facultyId, departmentId: departmentId, searchVal: searchVal, 
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

    static async addEntry(group){
        let METHOD_NAME = "add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new GroupRedactionRequest(this.getAuthorizationData, group);
        return await http.post(url,headers,params,body,false);
    }

    static async redactEntry(group){
        let METHOD_NAME = "";
        let url = `${this.CONTROLLER_URL}/${group.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new GroupRedactionRequest(this.getAuthorizationData, group);
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

    static async redactAsAdministrator(group){
        let METHOD_NAME = "admin";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${group.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = group;
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

    static async addAsAdministrator(group){
        let METHOD_NAME = "admin/add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = group;
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