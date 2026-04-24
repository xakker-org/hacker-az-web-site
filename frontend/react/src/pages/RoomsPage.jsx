import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [roomsResponse, tagsResponse] = await Promise.all([
          endpoints.rooms({ search, level, tag }),
          endpoints.roomTags(),
        ]);
        if (!mounted) return;
        setRooms(roomsResponse.data || []);
        setTags(tagsResponse.data || []);
      } catch {
        if (mounted) setError("Rooms loaded deyil. Bir daha cəhd et.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [search, level, tag]);

  const filteredCount = useMemo(() => rooms.length, [rooms]);

  return (
    <AppShell
      title="Rooms"
      searchPlaceholder="Room, task, course axtar..."
      onSearch={setSearch}
      extraTopbar={<span className="topbar-chip"><strong>{filteredCount}</strong> rooms</span>}
    >
      <div className="page-head">
        <div>
          <h1>Rooms</h1>
          <p>Backend-dən gələn room-lar, task-lar və progress ilə tam self-study axını.</p>
        </div>
        <div className="page-head-actions">
          <select className="filter-select" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select className="filter-select" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">All tags</option>
            {tags.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading-block">Loading rooms...</div>
      ) : (
        <div className="grid-rooms">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to={`/rooms/${room.slug}`}
              className="room-card"
              style={{ "--room-tint": room.cover_color || "rgba(255, 86, 114, 0.22)" }}
            >
              <div className="room-card-top">
                <div className="room-card-icon">{room.icon || "◈"}</div>
                <div className="room-card-chips">
                  <span className="chip chip-level">{room.level}</span>
                  {room.is_premium && <span className="chip chip-accent">Premium</span>}
                </div>
              </div>
              <h3>{room.title}</h3>
              <p>{room.summary}</p>
              <div className="progress">
                <div className="progress-track">
                  <div className="progress-fill blue" style={{ width: `${room.progress_percent || 0}%` }} />
                </div>
                <div className="progress-meta">
                  <span>{room.task_count || 0} tasks</span>
                  <span>{room.estimated_minutes || 0} min</span>
                </div>
              </div>
              <div className="room-card-meta">
                <div className="meta-left">
                  <span className="room-card-meta-item">{room.course?.title}</span>
                </div>
                <span className="lb-xp">{room.points || 0} XP</span>
              </div>
            </Link>
          ))}
          {rooms.length === 0 && <div className="empty-state panel">No rooms found.</div>}
        </div>
      )}
    </AppShell>
  );
}