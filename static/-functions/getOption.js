export function getOption(text, value){
    let option = document.createElement('option');
    option.innerHTML = text;
    option.value     = value;
    return option;
}

export function getOptionSame(value){
    return getOption(value,value);
}

export function getOptionModel(model){
    return getOption(model.text, model.value);
}

export function getOptionN(nModel){
    return getOption(nModel.name, nModel.id);
}

export function getOptionSN(snModel){
    return getOption(snModel.shortName, snModel.id);
}

export function getNullOption(annotation){
    return getOption(annotation, 0);
}