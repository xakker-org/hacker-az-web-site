import api from "./api";

export const endpoints = {
  me: () => api.get("/auth/me/"),
  myProfile: () => api.get("/auth/profile/"),
  updateProfile: (payload) => api.patch("/auth/profile/", payload),
  publicProfile: (username) => api.get(`/auth/profile/${encodeURIComponent(username)}/`),
  myActivity: (limit = 50) => api.get(`/auth/activity/?limit=${limit}`),
  leaderboard: (limit = 50) => api.get(`/auth/leaderboard/?limit=${limit}`),

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

  // Profile extended endpoints
  profileStats: () => api.get("/auth/profile/stats/"),
  activityGraph: (year = null) => api.get(`/auth/profile/activity-graph/${year ? `?year=${year}` : ""}`),
  recentStudyActivity: (limit = 20) => api.get(`/auth/profile/recent-activity/?limit=${limit}`),

  // Courses and lessons
  courses: () => api.get("/courses/"),
  courseDetail: (slug) => api.get(`/courses/${slug}/`),
  lessonDetail: (courseSlug, lessonId) => api.get(`/courses/${courseSlug}/lessons/${lessonId}/`),
  completeLesson: (courseSlug, lessonId) => api.post(`/courses/${courseSlug}/lessons/${lessonId}/complete/`),
  submitLessonQuestion: (courseSlug, lessonId, questionId, payload) =>
    api.post(`/courses/${courseSlug}/lessons/${lessonId}/questions/${questionId}/submit/`, payload),

  // ── Missions ──────────────────────────────────────────────
  missions: () => api.get("/courses/missions/"),
  missionDetail: (slug) => api.get(`/courses/missions/${slug}/`),
  missionStart: (slug) => api.post(`/courses/missions/${slug}/start/`),
  missionPassDetail: (slug, passId) => api.get(`/courses/missions/${slug}/passes/${passId}/`),
  missionPassComplete: (slug, passId) => api.post(`/courses/missions/${slug}/passes/${passId}/complete/`),
  missionExamDetail: (slug) => api.get(`/courses/missions/${slug}/exam/`),
  missionExamStart: (slug) => api.post(`/courses/missions/${slug}/exam/start/`),
  missionExamSubmit: (slug, attemptId, payload) =>
    api.post(`/courses/missions/${slug}/exam/${attemptId}/submit/`, payload),
  myMissionProgress: () => api.get("/courses/missions/my-progress/"),
};
