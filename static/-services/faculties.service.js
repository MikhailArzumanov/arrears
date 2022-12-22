import { http } from '../-http/http.js';
import { AuthData } from '../-models/auth-data.model.js';
import {AuthorizedService} from './-base-services/authorized.service.js';
import { FacultyRedactionRequest } from './-models/faculties/faculty-redaction-request.model.js';

export class FacultiesService extends AuthorizedService{
    static CONTROLLER_NAME = 'faculties';
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

    static async selfRedact(newAuthData, oldAuthData){
        let METHOD_NAME = '';
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let facultyData = this.getAuthorizedData;
            facultyData.login    = newAuthData.login;
            facultyData.password = newAuthData.password;
            let url         = `${this.CONTROLLER_URL}/${facultyData.id}`;
        let body = new FacultyRedactionRequest(oldAuthData,facultyData);
        return await http.put(url,headers,params,body,false);
    }

    static async getAll(){
        let METHOD_NAME = 'all';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        return await http.get(url,headers,params, false);
    }

    static async getConcrete(id){
        let METHOD_NAME = '';
        let url = `${this.CONTROLLER_URL}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        return await http.get(url,headers,params,false);
    }

    static async redactAsAdministrator(faculty){
        let METHOD_NAME = "admin";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${faculty.id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = faculty;
        return await http.put(url,headers,params,body,false);
    }

    static async addFaculty(faculty){
        let METHOD_NAME = "admin/add";
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        let body = faculty;
        return await http.post(url,headers,params,body,false);
    }

    static async deleteFaculty(id){
        let METHOD_NAME = 'admin';
        let url = `${this.CONTROLLER_URL}/${METHOD_NAME}/${id}`;
        let headers = this.getTokenHeaders();
            headers['Content-Type'] = "application/json;charset=UTF-8";
        let params = {};
        return await http.delete(url,headers,params, false);
    }

}