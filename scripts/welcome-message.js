window.onload = async function(){
    let welcomeMessage;

    welcomeMessage = document.getElementById('welcome-message');

    console.log('Welcome message script loaded');

    myMessages = ['WELCOME!', 'USE CHROME FOR BEST EXPERIENCE', 'GETTING THINGS READY, PLEASE BE PATIENT...', ''];

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