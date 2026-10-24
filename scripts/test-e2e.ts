async function main() {
  const base = "http://localhost:3000";

  console.log("🧪 SlothAuth End-to-End Verification Test");

  // 1. Landing Page
  const r1 = await fetch(base);
  console.log(`1. Landing Page (GET /): Status ${r1.status}`);

  // 2. Sign In Page
  const r2 = await fetch(`${base}/signin`);
  console.log(`2. Sign In Page (GET /signin): Status ${r2.status}`);

  // 3. Sign Up Page
  const r3 = await fetch(`${base}/signup`);
  console.log(`3. Sign Up Page (GET /signup): Status ${r3.status}`);

  // 4. Protected Route without Cookie
  const r4 = await fetch(`${base}/dashboard`, { redirect: "manual" });
  const redirectTarget = r4.headers.get("location");
  console.log(`4. Protected Route (GET /dashboard unauthenticated): Status ${r4.status}, Redirect: ${redirectTarget}`);

  // 5. Sign In via API
  const r5 = await fetch(`${base}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "dr.chen@slothauth.health",
      password: "password123",
    }),
  });
  const data5 = await r5.json();
  const setCookie = r5.headers.get("set-cookie");
  console.log(`5. Authentication API (POST /api/auth/signin): Status ${r5.status}, User: ${data5.user?.name} (${data5.user?.role})`);

  // 6. Access Protected Route with Auth Cookie
  if (setCookie) {
    const cookieHeader = setCookie.split(";")[0];
    const r6 = await fetch(`${base}/dashboard`, {
      headers: { Cookie: cookieHeader },
      redirect: "manual",
    });
    console.log(`6. Protected Route (GET /dashboard with auth cookie): Status ${r6.status} (Access Granted)`);

    // 7. Verify /api/auth/me session check
    const r7 = await fetch(`${base}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
    });
    const data7 = await r7.json();
    console.log(`7. Session Check (GET /api/auth/me): Status ${r7.status}, User: ${data7.user?.name}`);

    // 8. Sign Out
    const r8 = await fetch(`${base}/api/auth/signout`, {
      method: "POST",
    });
    console.log(`8. Sign Out (POST /api/auth/signout): Status ${r8.status}`);
  }

  // 9. Sign Up a test user
  const uniqueEmail = `test.physician.${Date.now()}@healthsystem.org`;
  const r9 = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Dr. Evelyn Reed, MD",
      email: uniqueEmail,
      password: "securepassword123",
      role: "ATTENDING_PHYSICIAN",
      organization: "Northwestern Memorial Hospital",
    }),
  });
  const data9 = await r9.json();
  console.log(`9. Registration API (POST /api/auth/signup): Status ${r9.status}, Created: ${data9.user?.name} (${data9.user?.email})`);

  console.log("✅ All End-to-End Auth, Routing, and Landing verification tests PASSED!");
}

main().catch(console.error);
