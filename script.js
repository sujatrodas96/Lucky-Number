const numbersContainer = document.getElementById('numbersContainer');
const submitBtn = document.getElementById('submitBtn');
const resultMessage = document.getElementById('resultMessage');
const timerMessage = document.getElementById('timerMessage');
const themeSwitch = document.getElementById('themeSwitch');

let selectedNumbers = [];
let amounts = Array(10).fill(0); // Initialize amounts for numbers 0-9 with 0

// Load saved theme from localStorage
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeSwitch.checked = true;
}

// Add theme toggle event
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
});



function generateNumbers() {
    // Clear existing content
    numbersContainer.innerHTML = '';
    
    for (let i = 0; i < 10; i++) {
        // Create main container for the number
        const numberContainer = document.createElement('div');
        numberContainer.classList.add('number-container');
        
        // Add the number display
        const numberSpan = document.createElement('span');
        numberSpan.textContent = i;
        
        // Create amount display
        const amountDisplay = document.createElement('div');
        amountDisplay.classList.add('amount-display');
        amountDisplay.textContent = '0';
        
        // Create increment/decrement controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls-container');
        
        // Add decrement button
        const decrementBtn = document.createElement('span');
        decrementBtn.textContent = '-';
        decrementBtn.classList.add('control-btn', 'decrement');
        decrementBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (amounts[i] > 0) {
                amounts[i] -= 10;
                amountDisplay.textContent = amounts[i];
                if (amounts[i] === 0) {
                    numberContainer.classList.remove('selected');
                    // Remove number from selectedNumbers array if amount reaches 0
                    selectedNumbers = selectedNumbers.filter(num => num !== i);
                }
            }
        });
        
        // Add increment button
        const incrementBtn = document.createElement('span');
        incrementBtn.textContent = '+';
        incrementBtn.classList.add('control-btn', 'increment');
        incrementBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            amounts[i] += 10;
            amountDisplay.textContent = amounts[i];
            if (amounts[i] > 0 && !numberContainer.classList.contains('selected')) {
                numberContainer.classList.add('selected');
                // Add number to selectedNumbers array if it's not already selected
                if (!selectedNumbers.includes(i)) {
                    selectedNumbers.push(i);
                }
            }
        });
        
        // Assemble controls
        controlsContainer.appendChild(decrementBtn);
        controlsContainer.appendChild(amountDisplay);
        controlsContainer.appendChild(incrementBtn);
        
        // Assemble number container
        numberContainer.appendChild(numberSpan);
        numberContainer.appendChild(controlsContainer);
        
        // Add click handler for selection
        numberContainer.addEventListener('click', () => toggleSelect(numberContainer, i));
        
        // Add to main container
        numbersContainer.appendChild(numberContainer);
    }
}

function toggleSelect(numberContainer, index) {
    // Toggle the 'selected' class and add/remove from selectedNumbers array
    if (numberContainer.classList.contains('selected')) {
        numberContainer.classList.remove('selected');
        selectedNumbers = selectedNumbers.filter(num => num !== index);
    } else {
        numberContainer.classList.add('selected');
        if (!selectedNumbers.includes(index)) {
            selectedNumbers.push(index);
        }
    }
}



const { jsPDF } = window.jspdf; // Access jsPDF constructor

// Submit the selected numbers and start the timer
submitBtn.addEventListener('click', () => {
    if (selectedNumbers.length === 0) {
        resultMessage.textContent = "Please select at least one number.";
        return;
    }

    // Disable the submit button after submission
    submitBtn.disabled = true;

    // Calculate total investment
    const totalInvestment = amounts.reduce((sum, amount, index) => 
        selectedNumbers.includes(index) ? sum + amount : sum, 0);
    resultMessage.textContent = `You invested a total of Rs ${totalInvestment}. Waiting for lucky number...`;
    timerMessage.textContent = "A lucky number will be drawn in 30 seconds...";

    // Start the countdown timer for 30 seconds
    let countdown = 30;
    const countdownInterval = setInterval(() => {
        countdown--;
        timerMessage.textContent = `Time remaining: ${countdown}s`;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            drawLuckyNumber(totalInvestment);  // Start the lucky number draw
        }
    }, 1000);

    // Generate PDF with investment details
    generatePDF(totalInvestment);
});

// Function to generate the PDF with only investment details
function generatePDF(totalInvestment) {
    const doc = new jsPDF();

    // Title
    doc.text('Investment Summary', 10, 10);

    // List of selected numbers and their investments
    let yOffset = 20;
    selectedNumbers.forEach(number => {
        doc.text(`Number ${number}: You invested Rs ${amounts[number]}`, 10, yOffset);
        yOffset += 10; // Adjust yOffset for next line
    });

    // Total investment
    doc.text(`Total Investment: Rs ${totalInvestment}`, 10, yOffset);
    yOffset += 10;

    // Thank You message
    doc.text("Thank you for participating!", 10, yOffset);

    // Save the PDF (this will prompt the user to download the PDF)
    doc.save('investment-summary.pdf');
}

// Generate a random lucky number and display the result
function drawLuckyNumber(totalInvestment) {
    const luckyNumber = Math.floor(Math.random() * 10); // Random number between 0 and 9
    console.log(`Lucky number is: ${luckyNumber}`); // Log for debugging

    // Clear the previous lucky number highlight
    const previousLuckyBox = document.querySelector('.number-container.lucky-number');
    if (previousLuckyBox) {
        previousLuckyBox.classList.remove('lucky-number');
    }

    // Highlight the lucky number box with deep green
    const luckyBox = document.querySelectorAll('.number-container')[luckyNumber];
    luckyBox.classList.add('lucky-number');

    // Calculate win/loss
    let totalWin = 0;
    if (selectedNumbers.includes(luckyNumber)) {
        totalWin = amounts[luckyNumber] * 9;
        resultMessage.textContent = `Congratulations! Your number ${luckyNumber} matched! You win Rs ${totalWin}!`;
    } else {
        resultMessage.textContent = `No match! You lost Rs ${totalInvestment}. The lucky number was ${luckyNumber}.`;
        resultMessage.style.color = 'red'; // Set the text color to red        
    }

    timerMessage.textContent = `Total investment: Rs ${totalInvestment}.`;
}


// Prevent page reload or navigation
window.addEventListener('beforeunload', (event) => {
    // Prompt the user with a confirmation message when they attempt to reload or navigate away
    if (submitBtn.disabled) {
        event.preventDefault();
        event.returnValue = ''; // For some browsers
    }
});

// Initialize the game
generateNumbers();
