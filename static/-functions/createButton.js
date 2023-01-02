export function createButton(notation, onclickHandler, attributes=[]){
    let button = document.createElement('button');
    button.innerHTML = notation;
    for(let attr of attributes)
        button.setAttribute(attr.key, attr.val);
    button.onclick = onclickHandler;
    return button;
}