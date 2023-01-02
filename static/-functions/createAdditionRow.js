import { createButton } from "./createButton.js";

export function createAdditionRow(table, colspan, additionButtonAnnotation, onAdditionHandler){
    let additionRow = document.createElement('tr');
    additionRow.setAttribute('class', 'additionRow');
    let additionCol = document.createElement('td');
    additionCol.setAttribute('colspan',colspan);

    let classAttr = {key: 'class', val:'additionButton'};
    let additionButton = createButton(additionButtonAnnotation, onAdditionHandler,[classAttr]);

    additionCol.appendChild(additionButton);
    additionRow.appendChild(additionCol);
    table.appendChild(additionRow);
    return additionRow;
}