import bcrypt from "bcryptjs";
const SALT_ROUNDS = 12;


/** 비밀번호 해쉬
 * @param password 비밀번호
 * @return string - 해쉬된 비밀번호
 * */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 로그인 시 사용 <br>
 * 입력한 비밀번호와 DB의 password_hash 비교 <br>
 * 해쉬값을 복호화 하지는 않음
 * @param password - 비밀번호
 * @param passwordHash - 해쉬된 비밀번호
 * @return Promise, if callback has been omitted <br> boolean
 */
export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
