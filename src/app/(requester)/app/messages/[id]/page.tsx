import { notFound } from "next/navigation";
import { getThread } from "@/lib/requester/mock";
import { sendMessage } from "@/lib/requester/actions";
import { AppHeader } from "../../../_components/AppHeader";
import { IconPhone, IconCam, IconArrow } from "../../../_components/icons";

export default async function ThreadScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) notFound();

  return (
    <>
      <AppHeader
        title={thread.providerName}
        backHref={`/app/jobs/${thread.jobId}/track`}
        right={<span style={{ color: "var(--ink)", display: "flex" }}><IconPhone /></span>}
      />

      {/* job-context chip — comms scoped to the job; no raw phone/email */}
      <div style={{ margin: "0 18px 10px", display: "flex", alignItems: "center", gap: 8, background: "var(--neutral)", borderRadius: "var(--r-chip)", padding: "9px 12px" }}>
        <span style={{ width: 6, height: 6, borderRadius: "var(--r-pill)", background: "var(--terracotta)", flex: "0 0 auto" }} />
        <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>{thread.jobContext}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>Contact stays private</span>
      </div>

      <main style={{ flex: 1, overflowY: "auto", padding: "6px 18px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {thread.messages.map((m) => {
          const me = m.from === "me";
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start", gap: 4 }}>
              {m.photo && (
                <div style={{ width: 150, height: 104, borderRadius: 14, background: "var(--neutral)", border: "1px solid var(--hairline)", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconCam size={26} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 13px",
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.45,
                  fontFamily: "var(--font-ui)",
                  background: me ? "var(--terracotta)" : "var(--paper)",
                  color: me ? "var(--cream)" : "var(--ink)",
                  border: me ? "none" : "1px solid var(--hairline)",
                  borderBottomRightRadius: me ? 5 : 16,
                  borderBottomLeftRadius: me ? 16 : 5,
                }}
              >
                {m.text}
              </div>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)", padding: "0 4px", fontFamily: "var(--font-ui)" }}>{m.time}</span>
            </div>
          );
        })}
      </main>

      {/* composer — real: posts a message scoped to this request */}
      <form action={sendMessage} style={{ padding: "10px 18px 16px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 10, background: "var(--canvas)" }}>
        <input type="hidden" name="requestId" value={thread.id} />
        <span style={{ width: 40, height: 40, borderRadius: "var(--r-pill)", background: "var(--neutral)", color: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <IconCam size={20} />
        </span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-pill)", padding: "0 6px 0 14px", height: 44 }}>
          <input
            name="body"
            placeholder="Message…"
            autoComplete="off"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-ui)" }}
          />
          <button type="submit" aria-label="Send" style={{ width: 32, height: 32, borderRadius: "var(--r-pill)", background: "var(--terracotta)", color: "var(--cream)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconArrow size={16} sw={2.2} />
          </button>
        </div>
      </form>
    </>
  );
}
