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

window.onload = function(){
    var mobileRes = document.getElementById('mobile-res');
    var desktopRes = document.getElementById('desktop-res');
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    var isMobile = regex.test(navigator.userAgent);

    if(isMobile){
        desktopRes.remove();

    } else{
        mobileRes.remove();
    }
};

// window.addEventListener('scroll', function(){
//     var stackCards = document.getElementsByClassName('stack-card');

//     for(let i = 0; i < stackCards.length; i++){
//         var cardTop = stackCards[i].getBoundingClientRect().top;
//         if(cardTop < window.innerHeight){
//             stackCards[i].style.animation = `cardAnim 1s ease forwards .3s`;

//         } else{
//         }        
//     };
// });

// const stackElements = document.getElementsByClassName('stack-element');
// document.addEventListener('pointermove', function(e){
//     const {clientX, clientY} = e;

//     for(let i = 0; i < stackElements.length; i++){

//         let elementY = stackElements[i].getBoundingClientRect().top + stackElements[i].clientHeight / 2;
//         let elementX = stackElements[i].getBoundingClientRect().left + stackElements[i].clientWidth / 2;
//         console.log("element:",elementX, elementY);
//         console.log("Client",clientX, clientY);
//         stackElements[i].animate({
//             transform: `rotateY(${(elementX - clientX) * .05}deg) rotateX(${(elementY - clientY) * .09}deg)`,
//         }, {duration: 1000, fill: 'forwards'})
//     }
    
// });