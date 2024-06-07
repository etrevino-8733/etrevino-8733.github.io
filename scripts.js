console.log("loaded");
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");
    const btn = document.getElementsByClassName("collapsible-nav");
    for (let i = 0; i < btn.length; i++) {
        btn[i].addEventListener("click", function () {
            console.log("click");
            this.getElementsByClassName("collapsible-nav-content")[0].classList.toggle("active");
        });
    }
});



function isMobile() {

  }

let welcomeMessage;
window.onload = async function(){
    welcomeMessage = document.getElementById('welcome-message');

    myMessages = ['WELCOME!', 'USE CHROME FOR BEST EXPERIENCE', 'GETTING THINGS READY, PLEASE BE PATIENT...'];

    for(let i = 0; i < myMessages.length; i++){
        setTimeout(function(){
            welcomeMessage.style.opacity = 1;
            welcomeMessage.innerHTML = myMessages[i];
        }, i * 5000);

        if(i < myMessages.length - 1){
            setTimeout(function(){
                welcomeMessage.style.opacity = 0;
            }
            , i * 5000 + 3000);
        }

    }
}