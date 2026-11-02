const TEST_SHARE = 0.2;

type LabeledPhoto = { id: string; label: string };

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks about 20% of each label to hold back as test photos. At least one photo
 * of each label always stays in training, so very small sets get no test photos.
 */
export function chooseTestIds(photos: LabeledPhoto[]): string[] {
  const labels = [...new Set(photos.map((photo) => photo.label))];
  return labels.flatMap((label) => {
    const group = photos.filter((photo) => photo.label === label);
    const count = Math.min(Math.round(group.length * TEST_SHARE), group.length - 1);
    return shuffled(group)
      .slice(0, count)
      .map((photo) => photo.id);
  });
}
