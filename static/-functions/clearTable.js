export function clearTable(table, dataRowClassName){
    let rows = document.getElementsByClassName(dataRowClassName);
    while(rows.length > 0){
        table.removeChild(rows[0]);
    }
}