export function fillTableData(data, getRowFn, table, lastRow = null){
    data.sort((a, b) => a.id-b.id);
    for(let element of data){
        let row = getRowFn(element);
        table.insertBefore(row, lastRow);
    }
}