const readline = require('readline');
const prompt = require('prompt');
const signInPrompt = require('./signInPrompt')

const readPrompt = readline.createInterface({
    input: process.stdin,
    output: process.output
});
var signInInstance = new signInPrompt();
var getInput = function() {
    console.log("Sign In(I), Sign Up(U), Go to tasks(T), or quit(Q)");
    readPrompt.question("Input choice: ", (answer) => {
    
        if(answer=='I'){
            console.log('Sign in\n');
            readPrompt.on('pause', ()=>{
                signInInstance.signInPrompt();
            });
        }
        else if(answer=='U'){
            console.log('Sign up\n');
        }
        else if(answer=='T'){
            console.log('Go to tasks\n');
        }
        else if(answer=='Q'){
            console.log('Bye\n');
            readPrompt.close();
        }
        else
            console.log('Not an option\n');
        getInput();
    });
}

getInput();