// TODO: Move other calculations here
export const avg = (values: number[]) =>
  values.reduce((a, b) => a + b, 0) / values.length;
