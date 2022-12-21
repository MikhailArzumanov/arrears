import { LinkComponent } from "./components/link/link.component.js";
import { LinksPanelComponent } from "./components/links-panel/links-panel.component.js";


let head = document.getElementsByTagName('head')[0];
function addStyles(stylesPath){
    let styleElement = document.createElement('link');
    styleElement.rel = 'stylesheet';
    styleElement.href = stylesPath;
    head.appendChild(styleElement);
}

customElements.define('links-panel', LinksPanelComponent);
addStyles('/components/links-panel/links-panel.component.css');
customElements.define('panel-link', LinkComponent);
addStyles('/components/link/link.component.css');