"use server"

// ponytail: no auth, anyone clicking can trigger a build; add a secret/password if abused.
export async function redeploy() {
  const hook = process.env.NETLIFY_BUILD_HOOK;
  if (!hook) return false;
  return (await fetch(hook, { method: "POST" })).ok;
}
