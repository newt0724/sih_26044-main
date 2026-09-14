import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const candidateApi = {
  getProfile: () => api.get('/candidates/me'),
  updateProfile: (data) => api.put('/candidates/me', data),
  evaluate: () => api.post('/candidates/evaluate'),
  verifyGithub: (url) => api.post(`/candidates/github-verify?github_url=${encodeURIComponent(url)}`),
  getRecommendations: () => api.get('/candidates/recommendations'),
  uploadCertificateProof: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/candidates/certificate-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const resumeApi = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const jobApi = {
  listJobs: () => api.get('/jobs'),
  createJob: (data) => api.post('/jobs', data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getJob: (id) => api.get(`/jobs/${id}`),
  matchJob: (id) => api.post(`/jobs/${id}/match`),
  applyJob: (id) => api.post(`/jobs/${id}/apply`),
  getRecruiterApplications: () => api.get('/jobs/recruiter/applications'),
  getMyApplications: () => api.get('/jobs/my-applications'),
  updateApplicationDecision: (appId, approve, reason) => api.post(`/jobs/applications/${appId}/decision?approve=${approve}&reason=${encodeURIComponent(reason)}`),
};

export const assessmentApi = {
  getQuestions: () => api.get('/assessments'),
  submitAnswers: (answers) => api.post('/assessments/submit', { answers }),
};

export const teacherApi = {
  getStudents: () => api.get('/teacher/students'),
  analyzeSyllabusGap: (domainCategory, file) => {
    const formData = new FormData();
    formData.append('domain_category', domainCategory);
    formData.append('file', file);
    return api.post('/teacher/syllabus-gap', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const tpoApi = {
  getPending: () => api.get('/tpo/pending-verifications'),
  verifyStudent: (profileId, approve) => api.post(`/tpo/verify-student?student_profile_id=${profileId}&approve=${approve}`),
  getAnalytics: () => api.get('/tpo/analytics'),
  getSkillHeatmap: () => api.get('/tpo/skill-heatmap'),
  exportCandidates: (minScore = 60.0) => api.get(`/tpo/export-candidates?min_score=${minScore}`),
  verifyCollege: (data) => api.post('/tpo/verify-college', data),
  uploadRoster: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/tpo/upload-roster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
};

export const govtApi = {
  getAnalytics: () => api.get('/govt/analytics'),
  verifyCollege: (data) => api.post('/govt/verify-college', data),
  sendSuggestion: (data) => api.post('/govt/send-syllabus-suggestion', data),
};

export default api;
