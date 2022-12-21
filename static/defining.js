

let head = document.getElementsByTagName('head')[0];
function addStyles(stylesPath){
    let styleElement = document.createElement('link');
    styleElement.rel = 'stylesheet';
    styleElement.href = stylesPath;
    head.appendChild(styleElement);
}

//customElements.define('common-header', HeaderComponent);
//addStyles('/components/header/header.component.css');