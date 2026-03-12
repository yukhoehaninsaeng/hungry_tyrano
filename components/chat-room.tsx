"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Message = {
  id: string;
  nickname: string;
  viewerId: string;
  content: string;
  createdAt: string;
  _count: {
    reads: number;
  };
};

type LayoutType = "compact" | "cozy";

function createViewerId() {
  return `viewer-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function ChatRoom({ roomSlug, isPrivate }: { roomSlug: string; isPrivate: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewerId, setViewerId] = useState("");
  const [nickname, setNickname] = useState("티라노친구");
  const [content, setContent] = useState("");
  const [layout, setLayout] = useState<LayoutType>("cozy");
  const [passcode, setPasscode] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const layoutStyles = useMemo(
    () =>
      layout === "compact"
        ? { fontSize: 13, itemGap: 8, itemPadding: "6px 0" }
        : { fontSize: 15, itemGap: 12, itemPadding: "10px 0" },
    [layout]
  );

  useEffect(() => {
    const key = `hungrytyrano:${roomSlug}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { viewerId: string; nickname: string; layout: LayoutType };
        setViewerId(parsed.viewerId);
        setNickname(parsed.nickname || "티라노친구");
        setLayout(parsed.layout || "cozy");
        return;
      } catch {
        // noop
      }
    }

    const newViewerId = createViewerId();
    setViewerId(newViewerId);
  }, [roomSlug]);

  useEffect(() => {
    if (!viewerId) return;
    localStorage.setItem(
      `hungrytyrano:${roomSlug}`,
      JSON.stringify({ viewerId, nickname, layout })
    );
  }, [viewerId, nickname, layout, roomSlug]);

  async function joinRoom() {
    if (!viewerId) return;

    const res = await fetch(`/api/rooms/${roomSlug}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewerId, nickname, passcode })
    });

    if (!res.ok) {
      const data = await res.json();
      setJoinError(data.message || "입장에 실패했습니다.");
      setJoined(false);
      return;
    }

    setJoinError(null);
    setJoined(true);
    await loadMessages();
    await markAsRead();
  }

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/messages?roomSlug=${roomSlug}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as Message[];
    setMessages(data);
  }, [roomSlug]);

  const markAsRead = useCallback(async () => {
    if (!viewerId || !joined) return;

    await fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomSlug, viewerId })
    });
  }, [roomSlug, viewerId, joined]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!content.trim() || !viewerId || !joined) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomSlug, viewerId, content })
    });

    if (res.ok) {
      setContent("");
      await loadMessages();
      await markAsRead();
    }
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    if (!viewerId || !joined) return;

    await fetch(`/api/rooms/${roomSlug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewerId, nickname, layout })
    });

    setSettingsOpen(false);
    await loadMessages();
  }

  useEffect(() => {
    if (!joined) return;
    loadMessages();
    const timer = setInterval(async () => {
      await loadMessages();
      await markAsRead();
    }, 3000);

    return () => clearInterval(timer);
  }, [joined, roomSlug, loadMessages, markAsRead]);

  if (!joined) {
    return (
      <div className="card" style={{ padding: 14, display: "grid", gap: 10 }}>
        <h3 style={{ margin: 0 }}>채팅방 입장</h3>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          maxLength={20}
        />
        {isPrivate ? (
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="비밀방 입장 코드"
            maxLength={20}
          />
        ) : null}
        <button onClick={joinRoom}>입장하기</button>
        {joinError ? <p style={{ color: "#ff9292", margin: 0 }}>{joinError}</p> : null}
        <style jsx>{`
          input,
          button {
            border-radius: 10px;
            border: 1px solid rgba(149, 255, 191, 0.2);
            background: rgba(0, 0, 0, 0.3);
            color: #f4f7f6;
            padding: 10px;
          }
          button {
            cursor: pointer;
            background: #8df7a8;
            color: #102116;
            font-weight: 700;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14, fontSize: layoutStyles.fontSize }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{nickname} 님 입장 중</strong>
        <button onClick={() => setSettingsOpen((prev) => !prev)}>설정</button>
      </div>

      {settingsOpen ? (
        <form className="card" onSubmit={saveSettings} style={{ padding: 12, display: "grid", gap: 8 }}>
          <label>
            닉네임
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
              maxLength={20}
              required
            />
          </label>
          <label>
            채팅 레이아웃
            <select value={layout} onChange={(e) => setLayout(e.target.value as LayoutType)}>
              <option value="cozy">cozy (넉넉한 간격)</option>
              <option value="compact">compact (촘촘한 간격)</option>
            </select>
          </label>
          <button type="submit">설정 저장</button>
        </form>
      ) : null}

      <div className="card" style={{ minHeight: 350, maxHeight: 460, overflowY: "auto", padding: 14 }}>
        {messages.length === 0 ? (
          <p>첫 메시지를 남겨서 사냥을 시작해보세요 🦖</p>
        ) : (
          messages.map((message) => {
            const isMine = message.viewerId === viewerId;
            return (
              <div key={message.id} style={{ marginBottom: layoutStyles.itemGap, padding: layoutStyles.itemPadding }}>
                <strong>{message.nickname}</strong>
                <small style={{ marginLeft: 8, opacity: 0.7 }}>
                  {new Date(message.createdAt).toLocaleTimeString("ko-KR")}
                </small>
                <p style={{ margin: "4px 0 0" }}>{message.content}</p>
                <small style={{ opacity: 0.75 }}>
                  {isMine ? `읽음 ${message._count.reads}명` : `읽은 사람 ${message._count.reads}명`}
                </small>
              </div>
            );
          })
        )}
      </div>

      <form className="card" onSubmit={sendMessage} style={{ padding: 12, display: "grid", gap: 8 }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지를 입력하세요"
          rows={3}
          maxLength={500}
          required
        />
        <button type="submit">전송</button>
      </form>
      <style jsx>{`
        input,
        textarea,
        button,
        select {
          border-radius: 10px;
          border: 1px solid rgba(149, 255, 191, 0.2);
          background: rgba(0, 0, 0, 0.3);
          color: #f4f7f6;
          padding: 10px;
        }
        button {
          cursor: pointer;
          background: #8df7a8;
          color: #102116;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
