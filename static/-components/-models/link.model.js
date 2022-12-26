export const LIST_LINK_TEXT      = "Список";
export const REDACTION_LINK_TEXT = "Редактировать";
export const CREATION_LINK_TEXT  = 'Форфмирование';

export class Link{
    href    ;
    text    ;
    accessTo;
    constructor(href, text, accessTo){
        this.href = href; this.text = text;
        this.accessTo = accessTo;
    }
}