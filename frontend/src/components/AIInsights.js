import React, { useState } from 'react';
import apiService from '../services/api';

const AIInsights = ({ aiData }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await apiService.askAIQuestion(question);
      setAnswer(response);
    } catch (error) {
      setAnswer({
        question,
        answer: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const predefinedQuestions = [
    "What are the optimal conditions for balloon deployment?",
    "Which regions have the most stable weather patterns?",
    "How does altitude affect data collection quality?",
    "What patterns do you see in the flight data?"
  ];

  return (
    <div className="ai-insights">
      <h2>🤖 AI-Powered Insights</h2>

      {aiData && !aiData.error && (
        <div className="insights-container">
          <h3>Automated Analysis</h3>
          <div className="insights-list">
            {aiData.insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-number">{index + 1}</span>
                <p>{insight}</p>
              </div>
            ))}
          </div>
          {aiData.timestamp && (
            <p className="insights-timestamp">
              Generated: {new Date(aiData.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {aiData && aiData.error && (
        <div className="ai-error">
          <p>⚠️ AI insights unavailable: {aiData.error}</p>
          <p className="error-note">Make sure you've set up your Gemini API key in the backend .env file.</p>
        </div>
      )}

      <div className="ai-question-section">
        <h3>Ask AI About the Data</h3>
        
        <form onSubmit={handleAskQuestion} className="question-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the balloon or weather data..."
            className="question-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="ask-button"
            disabled={loading || !question.trim()}
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        <div className="predefined-questions">
          <p className="suggestions-label">Try these questions:</p>
          {predefinedQuestions.map((q, index) => (
            <button
              key={index}
              className="suggestion-button"
              onClick={() => setQuestion(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>

        {answer && (
          <div className="ai-answer">
            <div className="answer-question">
              <strong>Q:</strong> {answer.question}
            </div>
            <div className="answer-text">
              <strong>A:</strong> {answer.answer}
            </div>
            <p className="answer-timestamp">
              {new Date(answer.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;