export function renderDubaiFundTitle(title: string, accentPhrase = "The Canal") {
  if (!title.includes(accentPhrase)) {
    return title;
  }

  const [before, after] = title.split(accentPhrase);

  return (
    <>
      {before}
      <span className="text-primary">{accentPhrase}</span>
      {after}
    </>
  );
}
