import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";

vi.mock("@/lib/db", () => ({
  db: {
    adminUser: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getSession: vi.fn(async () => ({
      save: vi.fn(),
      userId: undefined,
      email: undefined,
    })),
  };
});

import { db } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: "x" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when user does not exist", async () => {
    vi.mocked(db.adminUser.findUnique).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nope@x.com", password: "x" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when password is wrong", async () => {
    const hash = await hashPassword("correct");
    vi.mocked(db.adminUser.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "a@b.com",
      passwordHash: hash,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 and saves session on valid login", async () => {
    const hash = await hashPassword("right");
    vi.mocked(db.adminUser.findUnique).mockResolvedValueOnce({
      id: "u1",
      email: "a@b.com",
      passwordHash: hash,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const sessionMock = { save: vi.fn(), userId: undefined, email: undefined };
    vi.mocked(getSession).mockResolvedValueOnce(sessionMock as never);

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "right" }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(sessionMock.save).toHaveBeenCalled();
  });
});
