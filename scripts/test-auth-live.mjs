import dotenv from "dotenv";
dotenv.config();

async function testAuth() {
  const BASE_URL = process.env.BASE_URL || "https://platform-26.vercel.app";
  console.log("Testing auth against:", BASE_URL);

  // 1. Get CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const setCookie = csrfRes.headers.get("set-cookie") || "";
  console.log("CSRF Token obtained:", csrfToken ? "YES" : "NO");

  // 2. Try login with admin
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": setCookie,
    },
    body: new URLSearchParams({
      email: "admin@byteverse.dev",
      password: "admin2026",
      csrfToken: csrfToken,
      json: "true",
    }),
    redirect: "manual",
  });

  console.log("Login HTTP Status:", loginRes.status);
  const sessionCookie = loginRes.headers.get("set-cookie");
  console.log("Session Cookie received:", sessionCookie ? sessionCookie.split(";")[0] : "NONE");
}

testAuth().catch(console.error);
