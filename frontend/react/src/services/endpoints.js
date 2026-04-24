import api from "./api";

export const endpoints = {
  me: () => api.get("/auth/me/"),
  myProfile: () => api.get("/auth/profile/"),
  updateProfile: (payload) => api.patch("/auth/profile/", payload),
  publicProfile: (username) => api.get(`/auth/profile/${encodeURIComponent(username)}/`),
  myActivity: (limit = 50) => api.get(`/auth/activity/?limit=${limit}`),
  leaderboard: (limit = 50) => api.get(`/auth/leaderboard/?limit=${limit}`),
  badges: () => api.get("/auth/badges/"),
  myBadges: () => api.get("/auth/badges/mine/"),

  cabinet: () => api.get("/courses/cabinet/"),
  categories: () => api.get("/courses/categories/"),

  rooms: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get(`/courses/rooms/${suffix}`);
  },
  roomTags: () => api.get("/courses/rooms/tags/"),
  room: (slug) => api.get(`/courses/rooms/${slug}/`),
  enrollRoom: (slug) => api.post(`/courses/rooms/${slug}/enroll/`),
  task: (roomSlug, taskSlug) => api.get(`/courses/rooms/${roomSlug}/tasks/${taskSlug}/`),
  submitAnswer: (roomSlug, taskSlug, payload) =>
    api.post(`/courses/rooms/${roomSlug}/tasks/${taskSlug}/answer/`, payload),
  revealHint: (roomSlug, taskSlug, questionId) =>
    api.post(`/courses/rooms/${roomSlug}/tasks/${taskSlug}/hint/${questionId}/`),

  plans: () => api.get("/courses/plans/"),
  plan: (slug) => api.get(`/courses/plans/${slug}/`),

  questions: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get(`/courses/questions/${suffix}`);
  },
  questionDetail: (id) => api.get(`/courses/questions/${id}/`),
  submitQuestionAnswer: (id, payload) => api.post(`/courses/questions/${id}/submit-answer/`, payload),
  questionProgress: () => api.get("/courses/user/questions-progress/"),

  exams: () => api.get("/courses/exams/"),
  exam: (slug) => api.get(`/courses/exams/${slug}/`),
  startExamAttempt: (slug) => api.post(`/courses/exams/${slug}/attempts/`),
  submitExam: (slug, payload) => api.post(`/courses/exams/${slug}/submit/`, payload),
};
