export function setHandler(controlId, handler, key){
    document.getElementById(controlId)[key] = handler;
}

export function setOnClick(controlId, handler){
    setHandler(controlId, handler, 'onclick');
}

export function setOnChange(controlId, handler){
    setHandler(controlId, handler, 'onchange');
}