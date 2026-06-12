/** @description 날짜 포맷 함수 년월일시분
 *  @param value createdAt
 *  <br> RecentPostsSection과 PopularPostsSection은 문자열로 받음
 *  <br> 서버에서 문자열로 미리 바꿈
 * */
export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/** @description 날짜 포맷 함수 년월일
 *  @param value createdAt
 *  <br> RecentPostsSection과 PopularPostsSection은 문자열로 받음
 *  <br> 서버에서 문자열로 미리 바꿈
 * */
export function formatDateOnly(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
