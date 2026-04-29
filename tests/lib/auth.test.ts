import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("password helpers", () => {
  it("hashes a password to a bcrypt-style string", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toBe("hunter2");
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
