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

