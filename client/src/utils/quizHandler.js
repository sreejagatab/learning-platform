/**
 * Quiz Handler - Client-side script to handle embedded quizzes
 * This script is loaded in the ContentPreview component to make quizzes interactive
 */

// Initialize quizzes when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeQuizzes);

// Also initialize when called directly (for dynamically loaded content)
function initializeQuizzes() {
  const quizElements = document.querySelectorAll('.embedded-quiz');
  
  quizElements.forEach(quizElement => {
    // Skip already initialized quizzes
    if (quizElement.dataset.initialized === 'true') return;
    
    try {
      // Parse the quiz data from the data attribute
      const quizData = JSON.parse(quizElement.dataset.quiz);
      
      // Set up the quiz
      setupQuiz(quizElement, quizData);
      
      // Mark as initialized
      quizElement.dataset.initialized = 'true';
    } catch (error) {
      console.error('Error initializing quiz:', error);
      quizElement.innerHTML = '<p>Error loading quiz. Please refresh the page.</p>';
    }
  });
}

// Set up a single quiz
function setupQuiz(quizElement, quizData) {
  const startButton = quizElement.querySelector('.quiz-start-button');
  
  if (!startButton) return;
  
  startButton.addEventListener('click', () => {
    renderQuizQuestions(quizElement, quizData);
  });
}

// Render the quiz questions
function renderQuizQuestions(quizElement, quizData) {
  // Clear existing content
  quizElement.innerHTML = '';
  
  // Add title
  const titleElement = document.createElement('h3');
  titleElement.textContent = quizData.title;
  quizElement.appendChild(titleElement);
  
  // Create a container for the questions
  const questionsContainer = document.createElement('div');
  questionsContainer.className = 'quiz-questions-container';
  
  // Add each question
  quizData.questions.forEach((question, questionIndex) => {
    const questionElement = document.createElement('div');
    questionElement.className = 'quiz-question';
    questionElement.dataset.index = questionIndex;
    
    // Question text
    const questionText = document.createElement('div');
    questionText.className = 'quiz-question-text';
    questionText.innerHTML = `<strong>Question ${questionIndex + 1}:</strong> ${question.text}`;
    questionElement.appendChild(questionText);
    
    // Options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options';
    
    question.options.forEach((option, optionIndex) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'quiz-option';
      optionElement.dataset.index = optionIndex;
      optionElement.textContent = option;
      
      // Add click handler for selecting options
      optionElement.addEventListener('click', () => {
        // For multiple-choice, deselect all other options
        if (question.type === 'multiple-choice') {
          optionsContainer.querySelectorAll('.quiz-option').forEach(el => {
            el.classList.remove('selected');
          });
        }
        
        // Toggle selection
        optionElement.classList.toggle('selected');
      });
      
      optionsContainer.appendChild(optionElement);
    });
    
    questionElement.appendChild(optionsContainer);
    questionsContainer.appendChild(questionElement);
  });
  
  quizElement.appendChild(questionsContainer);
  
  // Add submit button
  const submitButton = document.createElement('button');
  submitButton.className = 'quiz-start-button';
  submitButton.textContent = 'Submit Answers';
  submitButton.addEventListener('click', () => {
    checkAnswers(quizElement, quizData);
  });
  
  quizElement.appendChild(submitButton);
}

// Check the user's answers
function checkAnswers(quizElement, quizData) {
  const questionElements = quizElement.querySelectorAll('.quiz-question');
  let correctCount = 0;
  
  questionElements.forEach((questionElement, questionIndex) => {
    const question = quizData.questions[questionIndex];
    const selectedOptions = Array.from(
      questionElement.querySelectorAll('.quiz-option.selected')
    ).map(option => parseInt(option.dataset.index));
    
    // Check if the answer is correct
    let isCorrect = false;
    
    if (question.type === 'multiple-choice') {
      isCorrect = selectedOptions.length === 1 && selectedOptions[0] === question.correctAnswers[0];
    } else {
      // For multiple-select, all correct options must be selected and no incorrect ones
      isCorrect = 
        selectedOptions.length === question.correctAnswers.length && 
        selectedOptions.every(index => question.correctAnswers.includes(index));
    }
    
    if (isCorrect) {
      correctCount++;
    }
    
    // Mark options as correct or incorrect
    const optionElements = questionElement.querySelectorAll('.quiz-option');
    
    optionElements.forEach((optionElement, optionIndex) => {
      const isSelected = optionElement.classList.contains('selected');
      const isCorrectOption = question.correctAnswers.includes(optionIndex);
      
      if (isSelected) {
        if (isCorrectOption) {
          optionElement.classList.add('correct');
        } else {
          optionElement.classList.add('incorrect');
        }
      } else if (isCorrectOption) {
        // Highlight correct answers that weren't selected
        optionElement.classList.add('correct');
      }
      
      // Disable further selection
      optionElement.style.pointerEvents = 'none';
    });
    
    // Add explanation if available
    if (question.explanation) {
      const explanationElement = document.createElement('div');
      explanationElement.className = 'quiz-explanation';
      explanationElement.textContent = question.explanation;
      questionElement.appendChild(explanationElement);
    }
  });
  
  // Show results
  const resultsElement = document.createElement('div');
  resultsElement.className = 'quiz-results';
  
  const percentage = Math.round((correctCount / quizData.questions.length) * 100);
  let message = '';
  
  if (percentage >= 90) {
    message = 'Excellent! You\'ve mastered this topic!';
  } else if (percentage >= 70) {
    message = 'Good job! You have a solid understanding.';
  } else if (percentage >= 50) {
    message = 'Not bad, but there\'s room for improvement.';
  } else {
    message = 'You might want to review this topic again.';
  }
  
  resultsElement.innerHTML = `
    <h4>Your Score: ${correctCount}/${quizData.questions.length} (${percentage}%)</h4>
    <p>${message}</p>
  `;
  
  quizElement.appendChild(resultsElement);
  
  // Replace submit button with retry button
  const submitButton = quizElement.querySelector('.quiz-start-button');
  if (submitButton) {
    const retryButton = document.createElement('button');
    retryButton.className = 'quiz-start-button';
    retryButton.textContent = 'Try Again';
    retryButton.addEventListener('click', () => {
      renderQuizQuestions(quizElement, quizData);
    });
    
    submitButton.parentNode.replaceChild(retryButton, submitButton);
  }
  
  // Track quiz completion if analytics is available
  try {
    if (window.trackQuizCompletion) {
      window.trackQuizCompletion(quizData.title, percentage, correctCount, quizData.questions.length);
    }
  } catch (error) {
    console.error('Error tracking quiz completion:', error);
  }
}

// Export for use in other modules
export { initializeQuizzes };

// Make available globally for dynamic content
window.initializeQuizzes = initializeQuizzes;
