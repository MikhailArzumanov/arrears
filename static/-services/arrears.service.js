import { http } from '../-http/http.js';
import { AuthData } from '../-models/auth-data.model.js';
import {AuthorizedService} from './-base-services/authorized.service.js';
import { ArrearRedactionRequest } from './-models/arrears/arrear-redaction-request.model.js';

export class ArrearsService extends AuthorizedService{
    static CONTROLLER_NAME = 'arrearSheets';
    static CONTROLLER_URL  = this.SERVICE_URL+this.CONTROLLER_NAME;

    static async getList(facultyId, departmentId, groupId,
                         studentSurname, disciplineShortName, magisterSurname,
                         status, year, semestr, passType, 
                         pageNum, pageSize=20){
        let METHOD_NAME = 'list';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {facultyId: facultyId, departmentId: departmentId, groupId: groupId,
                      studentSurname:studentSurname, disciplineShortName: disciplineShortName, 
                      magisterSurname:magisterSurname, year:year, semestr:semestr, passType:passType,
                      status: status, pageNum: pageNum, pageSize: pageSize};
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

    static async addEntry(arrearSheet){
        let METHOD_NAME = "add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new ArrearRedactionRequest(this.getAuthorizationData, arrearSheet);
        return await http.post(url,headers,params,body,false);
    }

    static async redactEntry(arrearSheet){
        let METHOD_NAME = "";
        let url = `${this.CONTROLLER_URL}/${arrearSheet.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body = new ArrearRedactionRequest(this.getAuthorizationData, arrearSheet);
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

    static async confirmArrear(id){
        let METHOD_NAME = 'confirm';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body   = this.getAuthorizationData;
        return await http.put(url,headers,params,body,false);
    }

    static async markArrear(id, mark){
        let METHOD_NAME = 'mark';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType, mark: mark};
        let body   = this.getAuthorizationData;
        return await http.put(url,headers,params,body,false);
    }

    static async closeArrear(id){
        let METHOD_NAME = 'close';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body   = this.getAuthorizationData;
        return await http.put(url,headers,params,body,false);
    }



    static async confirmArrearAsAdministrator(id){
        let METHOD_NAME = 'admin/confirm';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body   = this.getAuthorizationData;
        return await http.put(url,headers,params,body,false);
    }

    static async markArrearAsAdministrator(id, mark){
        let METHOD_NAME = 'admin/mark';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType, mark: mark};
        let body   = this.getAuthorizationData;
        return await http.put(url,headers,params,body,false);
    }

    static async closeArrearAsAdministrator(id){
        let METHOD_NAME = 'admin/close';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {authType: this.getAuthorizedType};
        let body   = this.getAuthorizationData;
        return await http.put(url,headers,params,body,false);
    }

    static async redactAsAdministrator(arrearSheet){
        let METHOD_NAME = "admin";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${arrearSheet.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = arrearSheet;
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

    static async addAsAdministrator(arrearSheet){
        let METHOD_NAME = "admin/add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = arrearSheet;
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