import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import type { User } from "@/types";

type UserRole = "player" | "coach" | "scout" | "agent" | "club" | "admin";

interface AuthOptions {
  requireSubscription?: boolean
  roles?: UserRole[]
  requiredPlanSlugs?: string[]
}

interface AuthContext {
  user: User
  authUser: { id: string; email: string }
}

type AuthenticatedHandler = (
  req: NextRequest,
  ctx: AuthContext,
  ...args: unknown[]
) => Promise<Response>

export function withAuth(handler: AuthenticatedHandler, options: AuthOptions = {}) {
  return async (req: NextRequest, ...args: unknown[]) => {
    let supabase;
    let supabaseResponse = NextResponse.next({ request: req });

    try {
      supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return req.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
              supabaseResponse = NextResponse.next({ request: req });
              cookiesToSet.forEach(({ name, value, options: cookieOpts }) =>
                supabaseResponse.cookies.set(name, value, cookieOpts)
              );
            },
          },
        }
      );
    } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (dbError || !dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role check
    if (options.roles && !options.roles.includes(dbUser.role as UserRole)) {
      return NextResponse.json({ error: "Forbidden: insufficient role" }, { status: 403 });
    }

    // Subscription check
    if (options.requireSubscription && dbUser.subscription_status !== "active") {
      return NextResponse.json(
        { error: "Active subscription required", code: "SUBSCRIPTION_REQUIRED" },
        { status: 402 }
      );
    }

    // Plan check
    if (options.requiredPlanSlugs && !options.requiredPlanSlugs.includes(dbUser.current_plan_slug)) {
      return NextResponse.json(
        { error: "Your plan does not include this feature", code: "PLAN_UPGRADE_REQUIRED", required_plans: options.requiredPlanSlugs },
        { status: 402 }
      );
    }

    return handler(req, { user: dbUser as User, authUser }, ...args);
  };
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
