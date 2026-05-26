import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Bar from "../components/ui/Bar";
import Button from "../components/ui/Button";
import { Chip, DiffBadge } from "../components/ui/Chip";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";

const EMPTY = { answer: "", selected_choice: null };

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
        <div className="bento">
          <div className="span-12"><TileSkeleton height={110} /></div>
          <div className="span-3"><TileSkeleton height={420} /></div>
          <div className="span-9"><TileSkeleton height={220} /></div>
        </div>
      </AppShell>
    );
  }

  if (!room) {
    return (
      <AppShell>
        <Tile>
          <EmptyState
            icon="◈"
            title="Otaq tapılmadı"
            description="Bu otaq mövcud deyil."
            action={<Button as={Link} to="/rooms" variant="accent">← Otaqlara qayıt</Button>}
          />
        </Tile>
      </AppShell>
    );
  }

  const pct      = room.progress_percent || 0;
  const isDone   = pct >= 100;
  const curTask  = task || room.tasks?.find(t => t.slug === selectedSlug);

  return (
    <AppShell>
      {/* ── Header ── */}
      <div className="page-head">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg, var(--bg-elev) 0%, rgba(255,36,66,0.10) 100%)",
            border: "1px solid var(--line-2)",
            display: "grid", placeItems: "center", fontSize: 26,
          }}>
            {room.icon || "◈"}
          </span>
          <div>
            <div className="page-eyebrow">Labs · Rooms</div>
            <h1 className="page-title">{room.title}</h1>
            {(room.description || room.summary) && (
              <div className="page-sub">{room.description || room.summary}</div>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              <DiffBadge level={room.level} />
              {room.course?.title && <Chip size="sm">{room.course.title}</Chip>}
              <Chip size="sm">{room.tasks?.length || 0} task</Chip>
              <Chip size="sm" tone="accent">★ {(room.points || 0).toLocaleString()} XP</Chip>
              {isDone && <Chip size="sm" tone="mint">✓ Tamamlandı</Chip>}
            </div>
          </div>
        </div>
        <Button variant="ghost" as={Link} to="/rooms" size="sm">← Geri</Button>
      </div>

      {/* ── Progress ── */}
      <Tile style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 11,
            }}>
              <span style={{ color: "var(--ink-3)" }}>
                {room.completed_tasks || 0} / {room.tasks?.length || 0} task tamamlandı
              </span>
              <span style={{
                color: isDone ? "var(--ok)" : "var(--accent)",
                fontWeight: 800, fontSize: 13,
              }}>
                {pct}%
              </span>
            </div>
            <Bar value={pct} tone={isDone ? "mint" : "accent"} />
          </div>
          {isDone && (
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "rgba(110,255,214,0.12)", border: "1px solid rgba(110,255,214,0.30)",
              display: "grid", placeItems: "center", fontSize: 16, color: "var(--ok)",
            }}>✓</div>
          )}
        </div>
      </Tile>

      {/* ── Sidebar + detail ── */}
      <div className="bento" style={{ alignItems: "start" }}>

        {/* Task list */}
        <Tile span={3} style={{
          position: "sticky", top: 76,
          maxHeight: "calc(100vh - 110px)", overflowY: "auto",
        }}>
          <TileHead eyebrow="Tasks" title={`${room.tasks?.length || 0} tapşırıq`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(room.tasks || []).map((item, i) => {
              const active = selectedSlug === item.slug;
              const done   = Boolean(item.completed);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.slug)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 11px", borderRadius: 10, textAlign: "left",
                    border: `1px solid ${active ? "var(--accent-ring)" : "transparent"}`,
                    background: active ? "var(--accent-soft)" : "transparent",
                    cursor: "pointer", transition: "all var(--dur-1)",
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                    background: done ? "rgba(110,255,214,0.12)"
                      : active ? "rgba(255,36,66,0.12)" : "var(--bg-elev)",
                    color: done ? "var(--ok)" : active ? "var(--accent)" : "var(--ink-4)",
                    border: `1px solid ${done ? "rgba(110,255,214,0.25)"
                      : active ? "var(--accent-ring)" : "var(--line)"}`,
                  }}>
                    {done ? "✓" : i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: active ? "var(--accent)" : done ? "var(--ink-3)" : "var(--ink-1)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                      {item.question_count} sual · {item.points} XP
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Tile>

        {/* Task content */}
        <div className="span-9" style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {taskLoading ? (
            <>
              <TileSkeleton height={140} />
              <TileSkeleton height={200} />
            </>
          ) : !curTask ? (
            <Tile>
              <EmptyState icon="◎" title="Task seçin" description="Soldan bir tapşırıq seçin." />
            </Tile>
          ) : (
            <>
              {/* Task header */}
              <Tile style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.04) 100%)" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <Chip size="sm" tone={curTask.completed ? "mint" : "accent"}>
                    {curTask.completed ? "✓ Tamamlandı" : "→ Davam edir"}
                  </Chip>
                  <Chip size="sm">★ {curTask.points || 0} XP</Chip>
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--ink-1)", marginBottom: 10, lineHeight: 1.3 }}>
                  {curTask.title}
                </h2>
                {curTask.content && (
                  <div
                    className="rich-content"
                    style={{ borderLeft: "3px solid var(--accent-ring)", paddingLeft: 14 }}
                    dangerouslySetInnerHTML={{ __html: curTask.content }}
                  />
                )}
              </Tile>

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
                  <Tile
                    key={q.id}
                    style={{
                      border: fb
                        ? `1px solid ${fb._error ? "rgba(255,122,138,0.28)" : fb.is_correct ? "rgba(110,255,214,0.30)" : "rgba(255,36,66,0.28)"}`
                        : undefined,
                    }}
                  >
                    {/* Meta */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)",
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap",
                        }}>
                          <span>Sual {idx + 1}</span>
                          <span>·</span>
                          <span style={{ textTransform: "capitalize" }}>{q.kind}</span>
                          <span>·</span>
                          <span style={{ color: "var(--accent)" }}>{q.points} XP</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.65 }}>
                          {q.prompt}
                        </div>
                      </div>
                      {q.has_hint && !hint && (
                        <Button variant="ghost" size="sm" onClick={() => revealHint(q)}>
                          💡 İpucu
                        </Button>
                      )}
                    </div>

                    {/* Hint */}
                    {hint && (
                      <div style={{
                        padding: "10px 14px", borderRadius: 10,
                        background: "rgba(255,193,7,0.06)",
                        border: "1px solid rgba(255,193,7,0.20)",
                        fontSize: 12, color: "var(--warn)", lineHeight: 1.6,
                      }}>
                        💡 {hint}
                      </div>
                    )}

                    {/* Input: closed */}
                    {q.kind === "closed" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {(q.choices || []).map(choice => {
                          const sel = resp.selected_choice === choice.id;
                          return (
                            <label
                              key={choice.id}
                              style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "11px 14px", borderRadius: 10, cursor: "pointer",
                                border: `1px solid ${sel ? "var(--accent-ring)" : "var(--line)"}`,
                                background: sel ? "var(--accent-soft)" : "var(--bg-card-2)",
                                fontSize: 13, color: sel ? "var(--ink-1)" : "var(--ink-2)",
                                transition: "all var(--dur-1)", userSelect: "none",
                              }}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={sel}
                                onChange={() => patch(q.id, { selected_choice: choice.id })}
                                style={{ display: "none" }}
                              />
                              <span style={{
                                width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                                border: `2px solid ${sel ? "var(--accent)" : "var(--line-2)"}`,
                                background: sel ? "var(--accent)" : "transparent",
                                display: "grid", placeItems: "center",
                                transition: "all var(--dur-1)",
                              }}>
                                {sel && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
                              </span>
                              {choice.text}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      /* Input: open / terminal */
                      <textarea
                        rows={q.kind === "terminal" ? 8 : 4}
                        value={resp.answer}
                        onChange={e => patch(q.id, { answer: e.target.value })}
                        placeholder={q.kind === "terminal" ? "Kod və ya komandaları buraya yaz..." : "Cavabını buraya yaz..."}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "12px 14px", borderRadius: 10, resize: "vertical",
                          background: "var(--bg-elev)", border: "1px solid var(--line)",
                          color: "var(--ink-1)", outline: "none", lineHeight: 1.65,
                          fontSize: q.kind === "terminal" ? 12 : 13,
                          fontFamily: q.kind === "terminal" ? "var(--font-mono)" : "inherit",
                          transition: "border-color var(--dur-1)",
                        }}
                        onFocus={e => { e.target.style.borderColor = "var(--accent-ring)"; }}
                        onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
                      />
                    )}

                    {/* Feedback */}
                    {fb && (
                      <div style={{
                        padding: "10px 14px", borderRadius: 10,
                        background: fb._error
                          ? "rgba(255,122,138,0.07)"
                          : fb.is_correct ? "rgba(110,255,214,0.07)" : "rgba(255,36,66,0.07)",
                        border: `1px solid ${fb._error
                          ? "rgba(255,122,138,0.25)"
                          : fb.is_correct ? "rgba(110,255,214,0.25)" : "rgba(255,36,66,0.25)"}`,
                        display: "flex", alignItems: "center", gap: 10,
                        fontSize: 12,
                        color: fb._error ? "var(--c-4)" : fb.is_correct ? "var(--ok)" : "var(--accent)",
                      }}>
                        <span style={{ fontSize: 15 }}>{fb._error ? "⚠" : fb.is_correct ? "✓" : "✗"}</span>
                        <span style={{ flex: 1 }}>
                          {fb._error
                            ? "Xəta baş verdi. Yenidən cəhd et."
                            : fb.is_correct ? "Düzgün cavab!" : "Yanlış cavab. Yenidən cəhd et."}
                        </span>
                        {fb.points_earned > 0 && (
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--ok)" }}>
                            +{fb.points_earned} XP
                          </span>
                        )}
                      </div>
                    )}

                    {/* Submit */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => submit(q)}
                        disabled={busy || !ok}
                      >
                        {busy ? "Göndərilir..." : "Cavabı göndər →"}
                      </Button>
                    </div>
                  </Tile>
                );
              })}

              {task && (!task.questions || task.questions.length === 0) && (
                <Tile>
                  <EmptyState icon="◌" title="Bu task-da sual yoxdur" description="" />
                </Tile>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
