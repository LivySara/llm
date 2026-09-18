// 入参格式校验：在进 service 之前挡掉非法输入，减少无效 DB / bcrypt 开销

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidUsername(username: unknown): username is string {
  return typeof username === "string" && USERNAME_RE.test(username);
}

// 密码策略：8~64 位，且必须同时包含字母和数字
export function isValidPassword(password: unknown): password is string {
  if (typeof password !== "string" || password.length < 8 || password.length > 64) {
    return false;
  }
  return /[a-zA-Z]/.test(password) && /\d/.test(password);
}

export function isValidEmail(email: unknown): boolean {
  return typeof email === "string" && EMAIL_RE.test(email);
}
