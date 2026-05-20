export function renderDubaiFundTitle(title: string) {
  const accent = "The Canal";

  if (!title.includes(accent)) {
    return title;
  }

  const [before, after] = title.split(accent);

  return (
    <>
      {before}
      <span className="text-primary">{accent}</span>
      {after}
    </>
  );
}
