'use server'
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

const AUTH_COOKIE = "eb_auth";

export async function POST(req: NextRequest) {
  const { address, message, signature } = await req.json();

  if (!address || !message || !signature) {
    return NextResponse.json(
      { error: "Missing address, message or signature" },
      { status: 400 }
    );
  }

  const valid = await verifyMessage({
    address,
    message,
    signature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = { address, ts: Date.now() };
  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
