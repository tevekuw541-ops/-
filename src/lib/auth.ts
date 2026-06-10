import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const username = () => process.env.ADMIN_USERNAME ?? "admin";
const password = () => process.env.ADMIN_PASSWORD ?? "admin123";
const secret = () => process.env.ADMIN_SESSION_SECRET ?? "blackboard-cat-local-secret";

export const adminCredentialsHint = {
  username: username(),
  password: process.env.ADMIN_PASSWORD ? "环境变量中配置的密码" : "admin123"
};

export const sessionToken = () =>
  createHash("sha256").update(`${username()}:${password()}:${secret()}`).digest("hex");

export const verifyAdmin = (inputUsername: string, inputPassword: string) =>
  inputUsername === username() && inputPassword === password();

export const isAdminSession = async () => {
  const token = (await cookies()).get("admin_session")?.value ?? "";
  const expected = sessionToken();
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
};

export const requireAdmin = async () => {
  if (!(await isAdminSession())) {
    return false;
  }
  return true;
};
