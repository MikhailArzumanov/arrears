import { http } from '../-http/http.js';
import { AuthData } from '../-models/auth-data.model.js';
import {AuthorizedService} from './-base-services/authorized.service.js';
import { DisciplineRedactionRequest } from './-models/disciplines/discipline-redaction-request.model.js';

export class DisciplinesService extends AuthorizedService{
    static CONTROLLER_NAME = 'disciplines';
    static CONTROLLER_URL  = this.SERVICE_URL+this.CONTROLLER_NAME;

    //static async getFirstByGroup(groupId){
    //    let METHOD_NAME = 'by_group';
    //    let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
    //    let headers = this.getTokenHeaders();
    //        headers['Content-Type'] = "application/json;charset=UTF-8";
    //    let params = {groupId: groupId};
    //    
    //    return await http.get(url, headers, params, false);
    //}

    static async getList(groupId,searchVal, year, semestr, passType,
                         pageNum, pageSize=20){
        let METHOD_NAME = 'list';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {groupId: groupId, searchVal: searchVal,
                      year:year,        semestr:semestr, type:passType,
                      pageNum: pageNum, pageSize: pageSize};
        return await http.get(url, headers, params, false);
    }

    static async getConcrete(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {} //{authType: this.getAuthorizedType};
        //let body = this.getAuthorizationData;
        return await http.get(url,headers,params,false);
    }

    static async addEntry(discipline, groupsIds, magistersIds){
        let METHOD_NAME = "add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = new DisciplineRedactionRequest(discipline,groupsIds,magistersIds);
        return await http.post(url,headers,params,body,false);
    }

    static async redactEntry(discipline, groupsIds, magistersIds){
        let METHOD_NAME = "";
        let url = `${this.CONTROLLER_URL}/${discipline.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = new DisciplineRedactionRequest(discipline,groupsIds,magistersIds);
        return await http.put(url,headers,params,body,false);
    }

    static async deleteEntry(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body   = null;
        return await http.delete(url,headers,params,body,false);
    }

    static async redactAsAdministrator(discipline, groupsIds, magistersIds){
        let METHOD_NAME = "admin";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${discipline.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = new DisciplineRedactionRequest(discipline,groupsIds,magistersIds);;
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

    static async addAsAdministrator(discipline, groupsIds, magistersIds){
        let METHOD_NAME = "admin/add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = new DisciplineRedactionRequest(discipline,groupsIds,magistersIds);
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