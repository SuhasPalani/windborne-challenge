import React, { useState } from 'react';
import apiService from '../services/api';

const AIInsights = ({ aiData }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const predefinedQuestions = [
    'What are the optimal conditions for balloon deployment?',
    'Which regions have the best weather conditions?',
    'What patterns do you see in the altitude distribution?',
    'Are there any concerning weather conditions?',
    'What recommendations do you have for flight operations?'
  ];

  const handleAskQuestion = async (questionText) => {
    if (!questionText.trim()) return;

    setLoading(true);
    try {
      const response = await apiService.askAIQuestion(questionText);
      setAnswer(response);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer({
        question: questionText,
        answer: 'Sorry, there was an error processing your question.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAskQuestion(question);
  };

  return (
    <div className="ai-insights">
      <h2>🤖 AI Insights</h2>

      {aiData?.error ? (
        <div className="ai-error">
          <p>⚠️ AI insights unavailable: {aiData.error}</p>
          <p className="error-note">Check that your Gemini API key is configured correctly.</p>
        </div>
      ) : (
        <>
          {aiData?.insights && aiData.insights.length > 0 && (
            <div className="insights-container">
              <h3>Key Insights</h3>
              <div className="insights-list">
                {aiData.insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-number">{index + 1}</div>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
              {aiData.timestamp && (
                <p className="insights-timestamp">
                  Generated: {new Date(aiData.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="ai-question-section">
        <h3>Ask AI a Question</h3>
        
        <div className="predefined-questions">
          <p className="suggestions-label">Quick questions:</p>
          {predefinedQuestions.map((q, index) => (
            <button
              key={index}
              className="suggestion-button"
              onClick={() => handleAskQuestion(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Or ask your own question..."
            className="question-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="ask-button"
            disabled={loading || !question.trim()}
          >
            {loading ? '🤔 Thinking...' : '💬 Ask'}
          </button>
        </form>

        {answer && (
          <div className="ai-answer">
            <p className="answer-question">
              <strong>Q:</strong> {answer.question}
            </p>
            <p className="answer-text">{answer.answer}</p>
            <p className="answer-timestamp">
              {new Date(answer.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;