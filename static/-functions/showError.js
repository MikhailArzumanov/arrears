export function showError(error, errorBar){
    let minWidth = 400;
    let width = error.length*10;
    if(width < minWidth) width = minWidth;
    errorBar.show(error, 4800, width);
}