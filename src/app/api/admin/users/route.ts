import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";

async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_super_admin")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return {
      error: NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 }),
    };
  }

  return { user, admin };
}

export async function GET() {
  const auth = await verifySuperAdmin();
  if (auth.error) return auth.error;

  const { data: profiles, error } = await auth.admin
    .from("profiles")
    .select(`
      id,
      user_id,
      full_name,
      email,
      avatar_url,
      created_at,
      account_id,
      account_role,
      status,
      is_super_admin,
      accounts:account_id (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifySuperAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !["active", "deactivated", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (userId === auth.user.id && status !== "active") {
      return NextResponse.json(
        { error: "Cannot deactivate your own super admin account" },
        { status: 400 }
      );
    }

    const { error } = await auth.admin
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, status });
  } catch {
    return NextResponse.json({ error: "Failed to parse request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifySuperAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
  }

  if (userId === auth.user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own super admin account" },
      { status: 400 }
    );
  }

  const { error } = await auth.admin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deletedUserId: userId });
}
