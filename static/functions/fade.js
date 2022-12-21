export function fadeIn(){
    let body = 
        document.getElementsByTagName('body')[0];
    body.style.opacity = "1.0";
}


export function fadeOut(){
    let body = 
        document.getElementsByTagName('body')[0];
    body.style.opacity = "0.0";
}