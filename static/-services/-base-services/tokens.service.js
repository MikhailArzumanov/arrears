import { AUTHORIZATION_DATA_KEY, AUTH_DATA_TYPE_KEY, TOKEN_KEY } from "./authorized.service.js";


export class TokensService{
    static setAuthData(authResponse){
        let token    = authResponse.token;
        let authData = authResponse.authData;
        let type     = authResponse.type;
        let dataObj  = authResponse[type];

        sessionStorage.setItem(TOKEN_KEY, token);
        
        this.setDataToStorage(AUTHORIZATION_DATA_KEY, authData);
        this.setDataToStorage(AUTH_DATA_TYPE_KEY,     type);
        this.setDataToStorage(type,                   dataObj);
    }

    static setDataToStorage(key, obj){
        let jsonObj = JSON.stringify(obj);
        sessionStorage.removeItem(key);
        sessionStorage.setItem(key, jsonObj);
    }

}