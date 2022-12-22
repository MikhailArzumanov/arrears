import { AuthorizedService } from "../-services/-base-services/authorized.service.js";

export const ADDRESS = "http://localhost"

export function redirectIfIsntAuthorized(){
    if(!AuthorizedService.isAuthorized()){
        window.location.href = `${ADDRESS}/authorization`;
    }
}

export function redirectIfAuthorized(){
    if(AuthorizedService.isAuthorized()){
        window.location.href = ADDRESS;
    }
}