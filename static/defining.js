import { ErrorBarComponent } from "./-components/error-bar/error-bar.component.js";
import { LinkComponent } from "./-components/link/link.component.js";
import { LinksPanelComponent } from "./-components/links-panel/links-panel.component.js";
import { DepartmentsPanelComponent } from "./departments/-components/departments-panel/departments-panel.component.js";
import { FacultiesPanelComponent } from "./faculties/-components/faculties-panel/faculties-panel.component.js";
import { GroupsPanelComponent } from "./groups/-components/groups-panel/groups-panel.component.js";
import { MagistersPanelComponent } from "./magisters/-components/magisters-panel/magisters-panel.component.js";
import { StudentsPanelComponent } from "./students/-components/students-panel/students-panel.component.js";


let head = document.getElementsByTagName('head')[0];
function addStyles(stylesPath){
    let styleElement = document.createElement('link');
    styleElement.rel = 'stylesheet';
    styleElement.href = stylesPath;
    head.appendChild(styleElement);
}

addStyles('/-shared/styles.css');

customElements.define('error-bar', ErrorBarComponent);
addStyles('/-components/error-bar/error-bar.component.css');
customElements.define('links-panel', LinksPanelComponent);
addStyles('/-components/links-panel/links-panel.component.css');
customElements.define('faculties-panel', FacultiesPanelComponent);
addStyles('/faculties/-components/faculties-panel/faculties-panel.component.css');
customElements.define('departments-panel', DepartmentsPanelComponent);
addStyles('/departments/-components/departments-panel/departments-panel.component.css');
customElements.define('groups-panel', GroupsPanelComponent);
addStyles('/groups/-components/groups-panel/groups-panel.component.css');
customElements.define('magisters-panel', MagistersPanelComponent);
addStyles('/magisters/-components/magisters-panel/magisters-panel.component.css');
customElements.define('students-panel', StudentsPanelComponent);
addStyles('/students/-components/students-panel/students-panel.component.css');

customElements.define('panel-link', LinkComponent);
addStyles('/-components/link/link.component.css');