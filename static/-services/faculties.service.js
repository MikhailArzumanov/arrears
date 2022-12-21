import { http } from '../_http/http.js';
import { AuthData } from '../_models/auth-data.model.js';
import {AuthorizedService} from './_base_services/authorized.service.js';

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
}