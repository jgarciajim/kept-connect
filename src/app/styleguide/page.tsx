// TEMPORARY styleguide — proves the shared UI primitive library renders in light
// (requester/marketing) AND dark (provider) via the <Surface> token remap.
// Delete once the primitives are in real use across the surfaces.
import "@/components/ui/styles/ui.css";
import type { ReactNode } from "react";
import {
  Surface,
  Button,
  Card,
  Panel,
  Tag,
  Avatar,
  StatusRing,
  CategoryIcon,
  CATEGORIES,
  VerifiedCheck,
  Field,
  KeptConnectLogo,
  type CategoryKey,
  type LogoTreatment,
} from "@/components/ui";

const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
const LOGO_TREATMENTS: LogoTreatment[] = ["app-icon", "on-light", "on-chrome", "mono", "reversed", "blue"];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2
        style={{
          fontFamily: "var(--font-ui)",
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>{children}</div>
    </section>
  );
}

function Showcase({ tone }: { tone: "light" | "dark" }) {
  return (
    <Surface tone={tone} style={{ padding: "48px 40px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 34,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {tone === "dark" ? "Provider" : "Requester"} surface
            <span style={{ color: "var(--terracotta)" }}>.</span>
          </h1>
          <KeptConnectLogo variant="lockup" treatment={tone === "dark" ? "on-chrome" : "on-light"} size={34} />
        </header>

        <Block title="Buttons">
          {(["primary", "secondary", "outline", "ghost"] as const).map((v) => (
            <Button key={v} variant={v}>
              {v[0].toUpperCase() + v.slice(1)}
            </Button>
          ))}
          <Button disabled>Disabled</Button>
        </Block>

        <Block title="Button sizes">
          {(["sm", "md", "lg"] as const).map((sz) => (
            <Button key={sz} size={sz}>
              Post a job
            </Button>
          ))}
        </Block>

        <Block title="Cards & panels">
          <Card style={{ width: 220 }}>
            <strong style={{ fontFamily: "var(--font-ui)", color: "var(--ink)" }}>Paper</strong>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-2)", margin: "6px 0 0" }}>
              Clean data surface for quotes and prices.
            </p>
          </Card>
          <Card tone="moment" style={{ width: 220 }}>
            <strong style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>Moment</strong>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-2)", margin: "6px 0 0" }}>
              Warm cream — human moments only.
            </p>
          </Card>
          <Card lift style={{ width: 220 }}>
            <strong style={{ fontFamily: "var(--font-ui)", color: "var(--ink)" }}>Lifted</strong>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-2)", margin: "6px 0 0" }}>
              Soft shadow on paper.
            </p>
          </Card>
          <Panel style={{ width: 220 }}>
            <strong style={{ fontFamily: "var(--font-ui)", color: "var(--ink)" }}>Panel</strong>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-2)", margin: "6px 0 0" }}>
              Larger --r-lg radius rung.
            </p>
          </Panel>
        </Block>

        <Block title="Tags">
          <Tag>Licensed</Tag>
          <Tag>Insured</Tag>
          <Tag variant="trade">Plumbing</Tag>
          <Tag variant="status" status="live">
            Live
          </Tag>
          <Tag variant="status" status="verified">
            Verified
          </Tag>
          <Tag variant="status" status="neutral">
            Neutral
          </Tag>
        </Block>

        <Block title="Avatars & status rings">
          <Avatar name="Marco Reyes" />
          <Avatar name="Dana Lee" />
          <StatusRing state="responding">
            <Avatar name="Sam Park" />
          </StatusRing>
          <StatusRing state="quoted">
            <Avatar name="Ona Diaz" />
          </StatusRing>
          <StatusRing state="awarded">
            <Avatar name=" Available" src="https://i.pravatar.cc/88?img=12" />
          </StatusRing>
        </Block>

        <Block title="Trust">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-ui)", color: "var(--ink)" }}>
            Marco Reyes <VerifiedCheck />
          </span>
          <VerifiedCheck label />
        </Block>

        <Block title="Categories (8 service families)">
          {CATEGORY_KEYS.map((key) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 72 }}>
              <CategoryIcon category={key} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-2)" }}>{CATEGORIES[key].label}</span>
            </div>
          ))}
        </Block>

        <Block title="Fields">
          <div style={{ width: 280 }}>
            <Field label="What needs doing?" placeholder="Describe the job" />
          </div>
          <div style={{ width: 160 }}>
            <Field label="Your budget" prefix="$" align="right" tabular placeholder="0" hint="Optional" />
          </div>
          <div style={{ width: 280 }}>
            <Field label="Details" multiline placeholder="Add a few details…" />
          </div>
        </Block>

        <Block title="Logo treatments">
          {LOGO_TREATMENTS.map((tr) => (
            <div key={tr} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <KeptConnectLogo treatment={tr} size={44} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-2)" }}>{tr}</span>
            </div>
          ))}
        </Block>
      </div>
    </Surface>
  );
}

export default function StyleguidePage() {
  return (
    <main>
      <Showcase tone="light" />
      <Showcase tone="dark" />
    </main>
  );
}
