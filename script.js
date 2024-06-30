const apiUrl = 'https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple';
const quizContainer = document.getElementById('quiz');
const nextButton = document.getElementById('next');
const quizFeedback = document.getElementById('quiz-feedback');
const summaryContainer = document.getElementById('quiz-summary');
let currentQuestionIndex = 0;
let quizData = [];
let quizSummary = [];

//fetching quiz questions from api
function fetchQuestions() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            quizData = data.results.map(result => ({
                question: result.question,
                correctAnswer: result.correct_answer,
                options: [...result.incorrect_answers, result.correct_answer].sort(() => Math.random() - 0.5), // Combine and shuffle options
                userAnswer: null
            }));
            showQuestion();
        })
        .catch(error => console.error('Error fetching questions:', error));
}

//displaying current question
function showQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    if (!currentQuestion) {
        console.error('Error: Question is undefined or null.');
        return;
    }

    //genereting options
    const optionsHtml = currentQuestion.options.map((option, index) => {
        return `
            <div class="choice">
                <input type="radio" id="choice${index}" name="answer" value="${option}">
                <label for="choice${index}">${option}</label>
            </div>
        `;
    }).join('');

    quizContainer.innerHTML = `
        <div class="question">${currentQuestion.question}</div>
        <form id="choices">${optionsHtml}</form>
    `;
}

//log answer and check if it it is correct
function logAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        alert('Please select an answer before proceeding.');
        return false;
    }

    const selectedAnswer = selectedOption.value;
    const currentQuestion = quizData[currentQuestionIndex];

    currentQuestion.userAnswer = selectedAnswer;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    quizSummary.push({
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        quizFeedback.innerHTML = `<p class="correct">Correct Answer!</p>`;
    } else {
        quizFeedback.innerHTML = `<p class="incorrect">Wrong Answer. Correct Answer: ${currentQuestion.correctAnswer}</p>`;
    }
    return true;
}

//handle next question
function nextQuestion() {
    if (!logAnswer()) {
        return;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        showQuestion();
        quizFeedback.innerHTML = '';
    } else {
        displayQuizSummary();
    }
}

//display summary
function displayQuizSummary() {
    summaryContainer.innerHTML = '<h2>Quiz Summary</h2>';

    quizSummary.forEach((entry, index) => {
        const feedback = entry.isCorrect ? '<span class="correct">Correct</span>' : '<span class="incorrect">Incorrect</span>';
        summaryContainer.innerHTML += `
            <div class="summary-item">
                <p><strong>Question ${index + 1}:</strong> ${entry.question}</p>
                <p><strong>Your Answer:</strong> ${entry.userAnswer} (${feedback})</p>
                ${entry.isCorrect ? '' : `<p><strong>Correct Answer:</strong> ${entry.correctAnswer}</p>`}
            </div>
        `;
    });

    quizContainer.style.display = 'none';
    nextButton.style.display = 'none';
    quizFeedback.innerHTML = '';
}

nextButton.addEventListener('click', nextQuestion);

fetchQuestions();
