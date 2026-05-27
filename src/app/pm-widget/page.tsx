"use client";

export default function PMWidgetPage() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <iframe
        src="/pm-widget.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="PM Widget — Stevenson Diagnostic Results"
      />
    </div>
  );
}
