import { ErrorsService } from "../-services/-base-services/errors.service.js";
import {ParamValidator} from "./ParamValidator.js";

export class http{
    static getParamsStr(params){
        let res = '?'
        Object.keys(params).forEach(key => {
            let theKey = ParamValidator.validateParamsStr(key);
            let value  = ParamValidator.validateParamsStr(params[key]);
            res += theKey+'='+value+'&'
        });
        let l = res.length
        res = res.substring(0,l-1)
        return res
    }

    static getHeadersObj(headers){
        let headersObj = {};
        Object.keys(headers).forEach(key => {
            headersObj[key] = headers[key];
        });
        return headersObj;
    }

    static baseRequest(plainUrl, method, theHeaders = {}, params = {}, theBody = null){
        let url = plainUrl+this.getParamsStr(params);
        let options = {
            method: method,
            headers: theHeaders,
        };
        if(theBody != null) options.body = JSON.stringify(theBody);
        return fetch(url, options);
    }

    static fileRequest(plainUrl, method, params, theBody){
        let url = plainUrl+this.getParamsStr(params);
        let options = {
            method: method,
            body: theBody,
        };
        return fetch(url, options);
    }

    static async get(url, headers = {}, params = {}, plain = false){
        const response = await this.baseRequest(url, 'GET', headers, params)
        if(response.ok == true){
            const data = plain? await response.text() : await response.json();
            //console.log('GET:', data);
            return data
        }
        else {
            const errorMsg = await response.text();
            ErrorsService.pushError(errorMsg);
            console.log(`GET: FETCH ERROR, URL: ${url}`)
        }
        return null
    }

    static async post(url, headers = {}, params = {}, body = null, plain = false){
        const response = await this.baseRequest(url, 'POST', headers, params, body)
        if(response.ok == true){
            const data = plain? await response.text() : await response.json();
            //console.log('POST:', data);
            return data
        }
        else {
            const errorMsg = await response.text();
            ErrorsService.pushError(errorMsg);
            console.log(`POST: FETCH ERROR, URL: ${url}`)
        }
        return null
    }
    static async put(url, headers = {}, params = {}, body = null, plain = false){
        const response = await this.baseRequest(url, 'PUT', headers, params, body)
        if(response.ok == true){
            const data = plain? await response.text() : await response.json();
            //console.log('PUT:', data);
            return data
        }
        else{
            const errorMsg = await response.text();
            ErrorsService.pushError(errorMsg);
            console.log(`PUT: FETCH ERROR, URL: ${url}`)
        }
        return null
    }
    static async delete(url, headers = {}, params = {}, plain = false){
        const response = await this.baseRequest(url, 'DELETE', headers, params)
        if(response.ok == true){
            const data = plain? await response.text() : await response.json();
            //console.log('DELETE:', data);
            return data
        }
        else{
            const errorMsg = await response.text();
            ErrorsService.pushError(errorMsg);
            console.log(`DELETE: FETCH ERROR, URL: ${url}`)
        }
        return null
    }
    
    static async file(url, method = 'POST', params = {}, body = null, plain = false){
        const response = await this.fileRequest(url,method,params,body);
        if(response.ok == true){
            const data = plain? await response.text() : await response.json();
            //console.log('DELETE:', data);
            return data
        }
        else {
            const errorMsg = await response.text();
            ErrorsService.pushError(errorMsg);
            console.log(`FILE: FETCH ERROR, URL: ${url}`)
        }
        return null
    }
}