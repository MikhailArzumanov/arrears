import { fadeOut } from "./fade.js";


export function redirect(ref){
    fadeOut();
    window.location.href = ref;
}