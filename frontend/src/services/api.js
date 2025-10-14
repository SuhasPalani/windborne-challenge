import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async getAllData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/data`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getBalloonData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/balloons`);
      return response.data;
    } catch (error) {
      console.error('Balloon API Error:', error);
      throw error;
    }
  }

  async askAIQuestion(question) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/question`, {
        question
      });
      return response.data;
    } catch (error) {
      console.error('AI Question Error:', error);
      throw error;
    }
  }

  async clearCache() {
    try {
      const response = await axios.post(`${API_BASE_URL}/cache/clear`);
      return response.data;
    } catch (error) {
      console.error('Cache Clear Error:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
