import {BaseService} from "./base.service.js";

export const TOKEN_KEY              = 'token'
export const AUTH_DATA_TYPE_KEY     = 'authorizedType'
export const AUTHORIZATION_DATA_KEY = 'authorizationData'

export class AuthorizedService extends BaseService{
    static token;
    static authorizedType;
    static authorizationData;
    static authorizedDataObj;

    static getTokenHeaders(){
        let token = this.getToken
        let headers = {'Authorization': `Bearer ${token}`}
        return headers
    }

    static get getToken() {
        if (!this.token) {
            this.token = sessionStorage.getItem(TOKEN_KEY);
        }
        return this.token ? this.token : null;
    }

    static get getAuthorizedType(){
        if(!this.authorizedType){
            this.authorizedType = JSON.parse(sessionStorage.getItem(AUTH_DATA_TYPE_KEY));
        }
        return this.authorizedType;
    }

    static get getAuthorizationData(){
        if(!this.authorizationData){
            this.authorizationData = JSON.parse(sessionStorage.getItem(AUTHORIZATION_DATA_KEY));
        }
        return this.authorizationData;
    }

    static get getAuthorizedData(){
        if(!this.authorizedDataObj){
            let type = this.getAuthorizedType;
            this.authorizedDataObj = JSON.parse(sessionStorage.getItem(type));
        }
        return this.authorizedDataObj;
    }

    static clearAuthData(){
        if(!this.isAuthorized()) return;
        sessionStorage.removeItem(TOKEN_KEY)             ;
        sessionStorage.removeItem(AUTHORIZATION_DATA_KEY);
        sessionStorage.removeItem(AUTH_DATA_TYPE_KEY)    ;
        sessionStorage.removeItem(this.getAuthorizedType);
    }

    static isAuthorized(){
        let type = this.getAuthorizedType;
        return !!type;
    }

    static logout(){
        sessionStorage.removeItem(this.getAuthorizedType);
        sessionStorage.removeItem(AUTH_DATA_TYPE_KEY)    ;
        sessionStorage.removeItem(AUTHORIZATION_DATA_KEY);
        sessionStorage.removeItem(TOKEN_KEY)             ;
    }
}
