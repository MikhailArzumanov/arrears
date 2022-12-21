import { AuthorizedService } from "../_services/_base_services/authorized.service.js";

const ADDRESS = "http://localhost"

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