export function mergeFilter({ filter, include = [], exclude = [] }) {
  if (!filter && include.length === 0 && exclude.length === 0) {
    return (data) => data;
  }

  const io = [];

  if (include.length > 0) {
    io.push((data = []) => data.filter(({ path }) => include.includes(path)));
  }

  if (exclude.length > 0) {
    io.push((data = []) => data.filter(({ path }) => !exclude.includes(path)));
  }

  if (filter) {
    io.push((data = []) => data.filter((item) => filter(item)));
  }

  return (data = []) => io.reduce((tmp, func) => func(tmp), data);
}
