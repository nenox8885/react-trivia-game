import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function ShowCurrentQuestion({currentQuestion, checkAnswer}){
  if (!currentQuestion) {
    return (
      <div className='container'>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className='container'>
      <CurrentQuestion currentQuestion={currentQuestion} checkAnswer={checkAnswer} />
    </div>
  )
}

function CurrentQuestion({currentQuestion, checkAnswer})
{
  let {question, options, class_name} = currentQuestion;

  return (
    <div className={class_name? 'card '+ class_name : 'card'}>
      <div className="card-body">
      <h5 className="card-title">{question}</h5>
      <div className="list-group list-group-flush">
        {options.map((option, index) => <Option key={index} option={option} checkAnswer={checkAnswer}/>)}
      </div>
      </div>
    </div>
  )
}

function Option({option, checkAnswer})
{
  return <a href="#" onClick={() => checkAnswer(option)} className="list-group-item list-group-item-action">{option}</a>
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

async function getQuestions(setQuestions, setCurrentQuestions) {
  await axios.get('https://opentdb.com/api.php?amount=5')
    .then(({data}) => data.results)
    .then( questions => {
      setQuestions(questions);
      currentQuestionHandler(questions[questions.length - 1], questions.length - 1, setCurrentQuestions);
    })
  ;
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function currentQuestionHandler(question, index ,setCurrentQuestions) {
  const formatedQuestion = {
    question: decodeHtml(question.question),
    index: index,
    class_name: null,
    answered: false
  }

  let options = question.incorrect_answers
  options.push(question.correct_answer);
  shuffle(options)

  formatedQuestion['options'] = options;

  setCurrentQuestions(formatedQuestion);
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestions] = useState(null);
  const [isPrinted, setIsPrinted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  useEffect(() => {
    if (!isPrinted) {
      setIsPrinted(1);
      getQuestions(setQuestions, setCurrentQuestions)  
    }

  });

  const checkAnswer = option => {
    if (currentQuestion.answered) {
      return;
    }
    let newQuestion = {};
    if (questions[currentQuestion.index].correct_answer === option) {
      newQuestion = { ...currentQuestion , class_name: 'bg-success', answered: true};
      setCorrectAnswers([...correctAnswers, currentQuestion.index])
    } else {
      newQuestion = { ...currentQuestion , class_name: 'bg-danger', answered: true};
    }

    setTimeout(() => {
      if (!questions[currentQuestion.index - 1]) {
        setIsPrinted(0);
        setCorrectAnswers([]);
        return;
      }

      currentQuestionHandler(
        questions[currentQuestion.index - 1], 
        currentQuestion.index - 1, 
        setCurrentQuestions
      );
    }, 2000);

    setCurrentQuestions(newQuestion);
  }

  return (
    <div>
      <div className="container">
        <h5>Correct Answers: {correctAnswers.length} <span className="float-right">Remaining Questions: {currentQuestion ? currentQuestion.index + 1 : 0}</span></h5>
      </div>
      <ShowCurrentQuestion currentQuestion={currentQuestion} checkAnswer={checkAnswer} />
    </div>
  );
}

export default App;
