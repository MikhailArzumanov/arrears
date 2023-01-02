export function addColumn(row, innerHtml, className){
    let col = document.createElement('td');
    col.innerHTML = innerHtml;
    col.setAttribute('class', className);
    row.appendChild(col);
}