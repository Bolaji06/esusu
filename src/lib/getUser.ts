import { headers } from "next/headers";

export async function getCurrentUser() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const fullName = headersList.get("x-user-name");
  const isAdmin = headersList.get("x-user-admin") === "true";

  if (!userId) {
    return null;
  }

  return {
    userId,
    fullName,
    isAdmin,
  };
}