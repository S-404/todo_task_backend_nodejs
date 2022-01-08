const pad = (num, places) => String(num).padStart(places, '0');
const getDateFormat = (d) => {
  const offset = new Date(d).getTimezoneOffset();
  d.addMinutes(offset);
  let yyyy = pad(d.getFullYear(), 4);
  let m = pad(d.getMonth() + 1, 2);
  let date = pad(d.getDate(), 2);
  let hh = pad(d.getHours(), 2);
  let mm = pad(d.getMinutes(), 2);
  let ss = pad(d.getSeconds(), 2);
  let ms = d.getMilliseconds();
  let result = `${yyyy}-${m}-${date} ${hh}:${mm}:${ss}.${ms}`;
  return result;
};
module.exports = getDateFormat;
