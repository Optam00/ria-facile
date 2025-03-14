'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Question {
  Id: number;
  Question: string;
  BR: string;
  MR1: string;
  MR2: string;
  MR3: string;
  Explication: string;
  Theme: string;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('Tentative de connexion à Supabase...');
      const { data, error } = await supabase
        .from('questions')
        .select('*');

      if (error) {
        console.error('Erreur Supabase:', error);
        setError(`Erreur lors de la récupération des questions: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log('Aucune donnée trouvée');
        setError('Aucune question trouvée dans la base de données. Vérifiez que la table "questions" existe et contient des données.');
        setLoading(false);
        return;
      }

      console.log(`${data.length} questions trouvées`);
      
      // Mélanger et sélectionner 20 questions
      const shuffledQuestions = data
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      setQuestions(shuffledQuestions);
      setLoading(false);
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === questions[currentQuestion].BR) {
      setScore(score + 1);
    }

    // Passer à la question suivante après 3 secondes
    setTimeout(() => {
      if (currentQuestion < 19) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        setQuizCompleted(true);
      }
    }, 3000);
  };

  const shuffleAnswers = (question: Question) => {
    const answers = [question.MR1, question.MR2, question.MR3, question.BR];
    return answers.sort(() => Math.random() - 0.5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Chargement du quiz...</h1>
          <p className="text-sm opacity-75">Connexion à la base de données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl mb-4">Erreur</h1>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Aucune question disponible</h1>
          <button
            onClick={fetchQuestions}
            className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Quiz terminé !</h1>
          <p className="text-xl mb-4">Votre score : {score}/20</p>
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setQuizCompleted(false);
              setSelectedAnswer(null);
              setShowExplanation(false);
              fetchQuestions();
            }}
            className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Refaire le quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          RIA facile - Quiz sur le Règlement sur l'IA
        </h1>
        
        <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-xl">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-lg">
              Question {currentQuestion + 1}/20
            </span>
            <span className="text-lg">
              Score : {score}/{currentQuestion}
            </span>
          </div>
          
          {questions[currentQuestion] && (
            <>
              <h2 className="text-xl mb-6">
                {questions[currentQuestion].Question}
              </h2>

              <div className="space-y-4">
                {shuffleAnswers(questions[currentQuestion]).map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(answer)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg transition-colors ${
                      selectedAnswer === answer
                        ? answer === questions[currentQuestion].BR
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    }`}
                  >
                    {answer}
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
                  <h3 className="font-bold mb-2">Explication :</h3>
                  <p>{questions[currentQuestion].Explication}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="mailto:contact@riafacile.com"
            className="text-white hover:underline"
          >
            Contactez-nous si vous souhaitez en savoir plus sur le RIA
          </a>
        </div>
      </div>
    </main>
  );
} 