export const LIST_LINK_TEXT      = "Список";
export const REDACTION_LINK_TEXT = "Редактировать";

export class Link{
    href    ;
    text    ;
    accessTo;
    constructor(href, text, accessTo){
        this.href = href; this.text = text;
        this.accessTo = accessTo;
    }
}