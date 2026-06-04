import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

const EMPTY = { answer: "", selected_choice: null };

function ChevronIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0 }}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function CheckIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.5} strokeLinecap="round">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}
function ArrowIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function RoomDetailPage() {
  const { slug } = useParams();

  const [room, setRoom]               = useState(null);
  const [selectedSlug, setSelected]   = useState("");
  const [task, setTask]               = useState(null);
  const [responses, setResponses]     = useState({});
  const [hints, setHints]             = useState({});
  const [feedback, setFeedback]       = useState({});
  const [loading, setLoading]         = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [submitting, setSubmitting]   = useState({});

  useEffect(() => {
    let ok = true;
    endpoints.room(slug)
      .then(({ data }) => {
        if (!ok) return;
        setRoom(data);
        const first = data?.tasks?.[0];
        if (first?.slug) setSelected(first.slug);
      })
      .catch(() => {})
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [slug]);

  useEffect(() => {
    if (!selectedSlug) return;
    let ok = true;
    setTaskLoading(true);
    setFeedback({});
    setHints({});
    endpoints.task(slug, selectedSlug)
      .then(({ data }) => {
        if (!ok) return;
        setTask(data);
        setResponses(prev => {
          const init = {};
          (data.questions || []).forEach(q => {
            init[q.id] = {
              answer: q.user_state?.submitted_answer || "",
              selected_choice: q.user_state?.selected_choice ?? null,
            };
          });
          return { ...prev, ...init };
        });
      })
      .finally(() => { if (ok) setTaskLoading(false); });
    return () => { ok = false; };
  }, [slug, selectedSlug]);

  const patch = (qId, p) =>
    setResponses(prev => ({ ...prev, [qId]: { ...(prev[qId] || EMPTY), ...p } }));

  const submit = async (question) => {
    setSubmitting(p => ({ ...p, [question.id]: true }));
    try {
      const r = responses[question.id] || EMPTY;
      const payload = question.kind === "closed"
        ? { question_id: question.id, selected_choice: r.selected_choice }
        : { question_id: question.id, answer: r.answer };
      const { data } = await endpoints.submitAnswer(slug, selectedSlug, payload);
      setFeedback(p => ({ ...p, [question.id]: data }));
    } catch {
      setFeedback(p => ({ ...p, [question.id]: { _error: true } }));
    } finally {
      setSubmitting(p => ({ ...p, [question.id]: false }));
    }
  };

  const revealHint = async (question) => {
    try {
      const { data } = await endpoints.revealHint(slug, selectedSlug, question.id);
      setHints(p => ({ ...p, [question.id]: data.hint || "" }));
    } catch {}
  };

  if (loading) {
    return (
      <AppShell>
        <TileSkeleton height={40} />
        <div style={{ marginTop: 16 }}><TileSkeleton height={200} /></div>
        <div className="xk-lab-detail" style={{ marginTop: 16 }}>
          <TileSkeleton height={400} />
          <TileSkeleton height={280} />
        </div>
      </AppShell>
    );
  }

  if (!room) {
    return (
      <AppShell>
        <div className="xk-back-row"><Link to="/rooms" className="xk-back"><ChevronIcon /> Geri</Link></div>
        <div className="xk-empty-screen">
          <div className="xk-empty-ico">🧪</div>
          <h3>Otaq tapılmadı</h3>
          <p>Bu otaq mövcud deyil.</p>
        </div>
      </AppShell>
    );
  }

  const pct     = room.progress_percent || 0;
  const isDone  = pct >= 100;
  const curTask = task || room.tasks?.find(t => t.slug === selectedSlug);
  const totalDone = room.completed_tasks || 0;

  return (
    <AppShell>
      {/* Back */}
      <div className="xk-back-row xk-reveal">
        <Link to="/rooms" className="xk-back"><ChevronIcon /> Geri</Link>
        <div className="xk-crumbs">
          <span>Laboratoriyalar</span>
          <span className="xk-crumb-sep">/</span>
          <span className="cur">{room.course?.category?.name || room.category?.name || "Lab"}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="xk-detail-hero xk-reveal" style={{ "--mc": "var(--accent)", animationDelay: "60ms" }}>
        <div className="xk-hero-bar" />
        <div className="xk-hero-main">
          <div className="xk-hero-top">
            <span className="xk-feat-track">{room.env || room.course?.category?.name || "Lab"}</span>
            <span className="xk-badge" style={{
              background: isDone ? "rgba(25,195,125,.14)" : "rgba(255,255,255,.05)",
              color: isDone ? "#19c37d" : "var(--text-2)",
              border: `1px solid ${isDone ? "rgba(25,195,125,.3)" : "var(--border)"}`,
            }}>
              {isDone ? "Tamamlandı" : room.level === "intermediate" ? "Orta" : room.level === "advanced" ? "Çətin" : "Başlanğıc"}
            </span>
          </div>
          <h1 className="xk-hero-title">{room.title}</h1>
          {(room.description || room.summary) && (
            <p className="xk-hero-desc">{room.description || room.summary}</p>
          )}
          <div className="xk-hero-meta">
            <span>{room.tasks?.length || 0} tapşırıq</span>
            <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
              ★ {(room.points || 0).toLocaleString()} XP
            </span>
            {room.estimated_minutes > 0 && <span>~{room.estimated_minutes} dəq</span>}
          </div>
          {pct > 0 && (
            <div className="xk-hero-actions">
              <div className="xk-hero-prog">
                <div className="xk-track" style={{ height: 5 }}>
                  <div className="xk-fill" style={{ width: `${pct}%` }} />
                </div>
                <span>{totalDone}/{room.tasks?.length || 0} tamamlandı</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lab detail: console + objectives */}
      <div className="xk-lab-detail">

        {/* Left: task list + task content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Task nav */}
          {(room.tasks || []).length > 0 && (
            <div className="xk-card xk-reveal" style={{ animationDelay: "140ms" }}>
              <div className="xk-card-eyebrow" style={{ marginBottom: 10 }}>
                Tapşırıqlar — {totalDone}/{room.tasks?.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {(room.tasks || []).map((item, i) => {
                  const active = selectedSlug === item.slug;
                  const done   = Boolean(item.completed);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item.slug)}
                      className={`xk-lesson-row${done ? " done" : active ? " next" : ""}`}
                      style={{ background: "none" }}
                    >
                      <span className="xk-lesson-status">
                        {done ? <CheckIcon /> : active ? <ArrowIcon size={13} /> : <span className="xk-lesson-num">{i + 1}</span>}
                      </span>
                      <div className="xk-lesson-meta">
                        <span className="xk-lesson-title">{item.title}</span>
                        <span className="xk-lesson-type">
                          {item.question_count} sual · {item.points} XP
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task content */}
          {taskLoading ? (
            <TileSkeleton height={200} />
          ) : !curTask ? (
            <div className="xk-card">
              <div className="xk-empty-screen" style={{ padding: "32px 0" }}>
                <p>Soldan bir tapşırıq seç.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Task header */}
              <div className="xk-card xk-reveal" style={{ animationDelay: "180ms" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span className={`xk-badge ${curTask.completed ? "tone-ok" : "tone-accent"}`}>
                    {curTask.completed ? "✓ Tamamlandı" : "→ Davam edir"}
                  </span>
                  <span className="xk-badge tone-muted">★ {curTask.points || 0} XP</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--text)", marginBottom: 10, lineHeight: 1.3 }}>
                  {curTask.title}
                </h2>
                {curTask.content && (
                  <div
                    className="rich-content"
                    style={{ borderLeft: "3px solid rgba(var(--accent-rgb),.3)", paddingLeft: 14, color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.65 }}
                    dangerouslySetInnerHTML={{ __html: curTask.content }}
                  />
                )}
              </div>

              {/* Questions */}
              {(task?.questions || []).map((q, idx) => {
                const resp = responses[q.id] || EMPTY;
                const fb   = feedback[q.id];
                const hint = hints[q.id];
                const busy = submitting[q.id];
                const ok   = q.kind === "closed"
                  ? resp.selected_choice !== null
                  : resp.answer.trim().length > 0;

                return (
                  <div key={q.id} className="xk-card xk-reveal" style={{ animationDelay: `${200 + idx * 50}ms` }}>
                    {/* Meta */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                          Sual {idx + 1} · {q.kind} · {q.points} XP
                        </div>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.55 }}>
                          {q.prompt}
                        </div>
                      </div>
                      {q.has_hint && !hint && (
                        <button className="xk-btn ghost sm" onClick={() => revealHint(q)}>💡 İpucu</button>
                      )}
                    </div>

                    {/* Hint */}
                    {hint && (
                      <div className="xk-tip" style={{ marginBottom: 12 }}>
                        💡 <span>{hint}</span>
                      </div>
                    )}

                    {/* Input */}
                    {q.kind === "closed" ? (
                      <div className="xk-quiz-opts">
                        {(q.choices || []).map((choice, ci) => {
                          const sel = resp.selected_choice === choice.id;
                          return (
                            <button key={choice.id} type="button"
                              className={`xk-quiz-opt${sel ? " sel" : ""}`}
                              onClick={() => patch(q.id, { selected_choice: choice.id })}>
                              <span className="xk-q-key">{String.fromCharCode(65 + ci)}</span>
                              <span>{choice.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        rows={q.kind === "terminal" ? 6 : 4}
                        value={resp.answer}
                        onChange={e => patch(q.id, { answer: e.target.value })}
                        placeholder={q.kind === "terminal" ? "Kod/əmrləri bura yaz..." : "Cavabını bura yaz..."}
                        className="input"
                        style={{
                          height: "auto", minHeight: q.kind === "terminal" ? 100 : 70,
                          padding: "12px 14px", resize: "vertical",
                          fontFamily: q.kind === "terminal" ? "var(--font-mono)" : "inherit",
                          fontSize: q.kind === "terminal" ? 12 : 13,
                        }}
                      />
                    )}

                    {/* Feedback */}
                    {fb && (
                      <div className={`xk-explain${fb._error ? " no" : fb.is_correct ? " ok" : " no"}`} style={{ marginTop: 10 }}>
                        <b>{fb._error ? "⚠ Xəta" : fb.is_correct ? "✓ Düzgün!" : "✗ Yanlış — yenidən cəhd et."}</b>
                        {fb.points_earned > 0 && (
                          <span style={{ float: "right", fontFamily: "var(--font-mono)", color: "#19c37d" }}>
                            +{fb.points_earned} XP
                          </span>
                        )}
                      </div>
                    )}

                    {/* Submit */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                      <button className="xk-btn primary sm" onClick={() => submit(q)} disabled={busy || !ok}>
                        {busy ? "Göndərilir..." : "Cavabı göndər →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Right: objectives + lab info */}
        <div className="xk-detail-aside">
          <div className="xk-card xk-aside-card xk-reveal" style={{ animationDelay: "200ms" }}>
            <div className="xk-card-eyebrow">Məqsədlər</div>
            <ul className="xk-obj-list">
              {(room.tasks || []).map((item, i) => {
                const done = Boolean(item.completed);
                return (
                  <li key={item.id} className={done ? "done" : ""}>
                    <span className="xk-obj-check">
                      {done ? <CheckIcon /> : <span className="xk-lesson-num">{i + 1}</span>}
                    </span>
                    {item.title}
                  </li>
                );
              })}
            </ul>
            {isDone && (
              <div className="xk-explain ok" style={{ marginTop: 14 }}>
                <b>Lab tamamlandı!</b> +{room.points || 0} XP qazandın.
              </div>
            )}
          </div>

          {/* Lab info */}
          <div className="xk-card xk-aside-card xk-reveal" style={{ animationDelay: "260ms" }}>
            <div className="xk-card-eyebrow">Lab Məlumatı</div>
            {[
              { l: "Mühit", v: room.env || "—" },
              { l: "Çətinlik", v: { beginner:"Başlanğıc", intermediate:"Orta", advanced:"Çətin" }[room.level] || room.level || "—" },
              { l: "Tapşırıqlar", v: room.tasks?.length || 0 },
              { l: "XP Mükafatı", v: `${(room.points || 0).toLocaleString()} XP` },
              room.estimated_minutes > 0 && { l: "Müddət", v: `~${room.estimated_minutes} dəq` },
            ].filter(Boolean).map(({ l, v }) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{l}</span>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
