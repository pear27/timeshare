export const date2String = (date) => {
  const dateInfo = new Date(date);
  const string = `${dateInfo.getFullYear()}${(
    "0" +
    (dateInfo.getMonth() + 1)
  ).slice(-2)}${("0" + dateInfo.getDate()).slice(-2)}`;
  return string;
};
