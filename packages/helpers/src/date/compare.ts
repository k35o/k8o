export const compareDate = (
  date1: Date,
  date2: Date,
): 'less' | 'equal' | 'greater' => {
  const compare = date1.getTime() - date2.getTime();
  if (compare < 0) {
    return 'less';
  }
  if (compare > 0) {
    return 'greater';
  }
  return 'equal';
};

if (import.meta.vitest) {
  it.each([
    ['2022-01-01T00:00:00Z', '2022-01-02T00:00:00Z', 'less'],
    ['2022-01-02T00:00:00Z', '2022-01-01T00:00:00Z', 'greater'],
    ['2022-01-01T00:00:00Z', '2022-01-01T00:00:00Z', 'equal'],
  ])('日付を比較する(%s)', (date1, date2, expected) => {
    expect(compareDate(new Date(date1), new Date(date2))).toBe(expected);
  });
}
