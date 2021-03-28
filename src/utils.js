const LOCALE = "en-US";
const LOCALE_DATETIME_OPTS = {
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

    // Dynamic key [ e[0] ], Value: e[1]
    Object.assign(filtered, { [e[0]]: e[1] });
  });

  return filtered;
};

const firebaseDateToString = (_firebaseTimestamp) => {
  try {
    return _firebaseTimestamp
      .toDate()
      .toLocaleString(LOCALE, LOCALE_DATETIME_OPTS);
  } catch (err) {
    return "";
  }
};

const dateToString = (_date) => {
  try {
    return _date.toLocaleString(LOCALE, LOCALE_DATETIME_OPTS);
  } catch (err) {
    return "";
  }
};

export {
  LOCALE_DATETIME_OPTS,
  removeUndefined,
  firebaseDateToString,
  dateToString,
};
