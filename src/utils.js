const localeDateTimeOpts = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour12: "true",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const removeUndefined = (obj) => {
  const filtered = {};

  Object.entries(obj).forEach((e) => {
    if (e[1] === undefined || e[1] === null) return;

    Object.assign(filtered, { [e[0]]: e[1] });
  });

  return filtered;
};

export { localeDateTimeOpts, removeUndefined };
