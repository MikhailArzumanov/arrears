export function addButtonColumn(row, tdClass, buttonInnerHtml, buttonHandler, attributes){
    let col = document.createElement('td');
    col.setAttribute('class', tdClass);
    let btn = document.createElement('button');
    for(let attr of attributes)
        btn.setAttribute(attr.key, attr.val);
    btn.onclick   = buttonHandler;
    btn.innerHTML = buttonInnerHtml;
    col.appendChild(btn);
    row.appendChild(col);
}