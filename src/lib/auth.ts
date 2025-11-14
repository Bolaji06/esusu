import { headers } from "next/headers";

export async function getCurrentUserId() {
  const headersList = await headers();
  return headersList.get("x-user-id");
}

export async function isAdmin() {
  const headersList = await headers();
  return headersList.get("x-user-admin") === "true";
}
