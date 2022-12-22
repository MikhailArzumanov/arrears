export function getValueById(id){
    let block = document.getElementById(id);
    return block.value;
}

export function setValueById(id, value){
    let block = document.getElementById(id);
    block.value = value;
}