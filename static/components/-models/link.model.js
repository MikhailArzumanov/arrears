export class Link{
    href    ;
    text    ;
    accessTo;
    constructor(href, text, accessTo){
        this.href = href; this.text = text;
        this.accessTo = accessTo;
    }
}