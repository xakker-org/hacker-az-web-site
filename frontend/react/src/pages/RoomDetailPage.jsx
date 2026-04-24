import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const emptyResponse = { answer: "", selected_choice: null };

export default function RoomDetailPage() {
  const { slug } = useParams();
  const [room, setRoom] = useState(null);
  const [selectedTaskSlug, setSelectedTaskSlug] = useState("");
  const [task, setTask] = useState(null);
  const [responses, setResponses] = useState({});
  const [hintText, setHintText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadRoom = async () => {
      try {
        const { data } = await endpoints.room(slug);
        if (!mounted) return;
        setRoom(data);
        const firstTask = data?.tasks?.[0];
        if (firstTask?.slug) {
          setSelectedTaskSlug(firstTask.slug);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadRoom();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!selectedTaskSlug) return;
    let mounted = true;
    const loadTask = async () => {
      setTaskLoading(true);
      setMessage("");
      setHintText("");
      try {
        const { data } = await endpoints.task(slug, selectedTaskSlug);
        if (!mounted) return;
        setTask(data);
        const initialResponses = {};
        (data.questions || []).forEach((question) => {
          initialResponses[question.id] = responseForQuestion(question, responses[question.id]);
        });
        setResponses((current) => ({ ...current, ...initialResponses }));
      } finally {
        if (mounted) setTaskLoading(false);
      }
    };
    loadTask();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, selectedTaskSlug]);

  const responseForQuestion = (question, current = emptyResponse) => ({
    answer: current?.answer || question.user_state?.submitted_answer || "",
    selected_choice: current?.selected_choice ?? null,
  });

  const questionCount = useMemo(() => room?.tasks?.length || 0, [room]);

  const updateResponse = (questionId, patch) => {
    setResponses((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] || emptyResponse),
        ...patch,
      },
    }));
  };

  const submitQuestion = async (question) => {
    const response = responses[question.id] || emptyResponse;
    const payload =
      question.kind === "closed"
        ? { question_id: question.id, selected_choice: response.selected_choice }
        : { question_id: question.id, answer: response.answer };
    const { data } = await endpoints.submitAnswer(slug, selectedTaskSlug, payload);
    setMessage(data.is_correct === true ? "Correct answer saved." : "Answer saved for review.");
  };

  const fetchHint = async (question) => {
    const { data } = await endpoints.revealHint(slug, selectedTaskSlug, question.id);
    setHintText(data.hint || "");
  };

  if (loading) {
    return <AppShell title="Rooms"><div className="loading-block">Loading room...</div></AppShell>;
  }

  if (!room) {
    return <AppShell title="Rooms"><div className="empty-state panel">Room not found.</div></AppShell>;
  }

  const activeTask = task || room.tasks?.find((item) => item.slug === selectedTaskSlug) || null;

  return (
    <AppShell title={room.title}>
      <div className="room-hero">
        <div className="room-hero-top">
          <div className="room-hero-left">
            <div className="room-hero-badge">{room.icon || "◈"}</div>
            <div>
              <span className="chip chip-accent">{room.level}</span>
              <h1>{room.title}</h1>
              <p className="room-hero-summary">{room.description || room.summary}</p>
              <div className="room-hero-meta">
                <span className="chip chip-blue">{room.course?.title}</span>
                <span className="chip">{questionCount} tasks</span>
                <span className="chip">{room.points} XP</span>
              </div>
            </div>
          </div>
          <div className="room-hero-right">
            <Link to="/rooms" className="btn btn-secondary btn-sm">Back to rooms</Link>
            <div className="panel">
              <div className="progress">
                <div className="progress-track">
                  <div className="progress-fill blue" style={{ width: `${room.progress_percent || 0}%` }} />
                </div>
                <div className="progress-meta">
                  <span>{room.completed_tasks || 0} completed</span>
                  <span>{room.progress_percent || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="room-shell">
        <aside className="task-sidebar">
          <div className="task-sidebar-head"><h4>Tasks</h4></div>
          {(room.tasks || []).map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`task-sidebar-item ${selectedTaskSlug === item.slug ? "active" : ""} ${item.completed ? "completed" : ""}`}
              onClick={() => setSelectedTaskSlug(item.slug)}
            >
              <span className="task-sidebar-index">{index + 1}</span>
              <span className="task-sidebar-main">
                <span className="task-sidebar-title">{item.title}</span>
                <span className="task-sidebar-sub">{item.question_count} questions • {item.points} XP</span>
              </span>
            </button>
          ))}
        </aside>

        <main className="task-detail">
          {taskLoading ? (
            <div className="loading-block">Loading task...</div>
          ) : (
            <>
              <div className="task-detail-head">
                <div>
                  <div className="task-detail-meta">
                    <span className="chip chip-accent">{activeTask?.completed ? "Completed" : "In progress"}</span>
                    <span className="chip">{activeTask?.points || 0} XP</span>
                  </div>
                  <h2>{activeTask?.title}</h2>
                  <p className="task-content">{activeTask?.content}</p>
                </div>
              </div>

              {hintText && <div className="q-hint-box">Hint: {hintText}</div>}

              {(task?.questions || []).map((question, index) => {
                const response = responses[question.id] || emptyResponse;
                return (
                  <div key={question.id} className="q-block">
                    <div className="q-head">
                      <div>
                        <div className="q-prompt">{index + 1}. {question.prompt}</div>
                        <div className="q-sub">{question.kind} • {question.points} points</div>
                      </div>
                      {question.has_hint && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fetchHint(question)}>
                          Hint
                        </button>
                      )}
                    </div>

                    {question.kind === "closed" ? (
                      <div className="q-choices">
                        {question.choices.map((choice) => (
                          <label
                            key={choice.id}
                            className={`q-choice ${response.selected_choice === choice.id ? "selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={response.selected_choice === choice.id}
                              onChange={() => updateResponse(question.id, { selected_choice: choice.id })}
                            />
                            <span>{choice.text}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="q-input"
                        rows="6"
                        value={response.answer}
                        onChange={(event) => updateResponse(question.id, { answer: event.target.value })}
                        placeholder={question.kind === "terminal" ? "Write code or steps here..." : "Write your answer..."}
                      />
                    )}

                    <div className="q-actions">
                      <div className="q-feedback">Save answers individually for backend review.</div>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => submitQuestion(question)}>
                        Save answer
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </main>
      </div>
    </AppShell>
  );
}