import { getNullOption } from "./getOption.js";

export function fillSelect(selectId, dataArray, optionFn, nullAnnotation){
    let select = document.getElementById(selectId);
    select.appendChild(getNullOption(nullAnnotation));
    for(let dataCol of dataArray){
        let option = optionFn(dataCol);
        select.appendChild(option);
    }
}

export function fillRequiredSelect(selectId, dataArray, optionFn){
    let select = document.getElementById(selectId);
    for(let element of dataArray)
        select.appendChild(optionFn(element));
    
}