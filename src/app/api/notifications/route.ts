import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const [notifRes, unreadRes] = await Promise.all([
      supabase
        .from("Notification")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })
        .range(0, 49),
      supabase
        .from("Notification")
        .select("id", { count: "exact", head: true })
        .eq("userId", userId)
        .eq("read", false),
    ]);

    if (notifRes.error) {
      console.error("Get notifications error:", notifRes.error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    if (unreadRes.error) {
      console.error("Count unread error:", unreadRes.error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications: notifRes.data || [],
      unreadCount: unreadRes.count || 0,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, notificationIds } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    let error;

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const res = await supabase
        .from("Notification")
        .update({ read: true })
        .eq("userId", userId)
        .in("id", notificationIds);
      error = res.error;
    } else {
      // Mark all as read
      const res = await supabase
        .from("Notification")
        .update({ read: true })
        .eq("userId", userId)
        .eq("read", false);
      error = res.error;
    }

    if (error) {
      console.error("Mark notifications error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Mark notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}