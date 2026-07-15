type JsonLdProps = {
  graph: Record<string, unknown>[];
};

/** Renders schema.org JSON-LD for crawlers and answer engines. */
export function JsonLd({ graph }: JsonLdProps) {
  if (graph.length === 0) return null;

  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
