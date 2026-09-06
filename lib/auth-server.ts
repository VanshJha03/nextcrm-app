import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";

// TODO: Add requireRole() helper for viewer restriction enforcement
// when viewer role is first assigned to users

export async function getSession() {
  // First try the standard Better Auth session
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (session) {
    return session;
  }

  // Fallback: Check for our custom admin token
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;
  
  if (token) {
    try {
      // Decode the base64 token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      
      // Check if token is expired
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        return null;
      }
      
      // Return as session format
      return {
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
        session: {
          expiresAt: new Date(decoded.exp * 1000),
        },
      };
    } catch (e) {
      console.error("Failed to decode admin token:", e);
      return null;
    }
  }
  
  return null;
}
