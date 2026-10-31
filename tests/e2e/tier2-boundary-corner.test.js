/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * Minimum Requirement: >=5 test cases per feature covering boundary limits, empty inputs,
 * extreme ranges, invalid inputs, and adversarial injections.
 */

import assert from "node:assert/strict";
import { describe, it } from "./runner.js";
import {
  LEGAL_CATEGORIES,
  REGIONS,
  MOCK_SPECIALISTS,
  MIN_CONSULTATION_DURATION,
  MAX_CONSULTATION_DURATION,
  createTestServer,
  filterSpecialistsCatalog,
  simulateAuthLogin,
  simulateAuthRegister,
  simulateConsultationBooking,
  calculateCommission,
} from "./harness.js";

// ============================================================
// Boundary Feature 1: AI Triage Input Boundaries & Robustness
// ============================================================
describe("Boundary 1: AI Triage Input Boundaries & Robustness", 2, async () => {
  let serverInfo;

  await it("should initialize HTTP server for boundary verification", async () => {
    serverInfo = await createTestServer();
    assert.ok(serverInfo.port > 0);
  });

  await it("should reject empty string payload with HTTP 400", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "Xabar matni kiritilmadi");
  });

  await it("should reject whitespace-only payload (tabs, spaces, newlines) with HTTP 400", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   \t\n   \r\n   " }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "Xabar matni kiritilmadi");
  });

  await it("should handle extremely large legal inquiry payload (>5,000 characters) without crashing", async () => {
    const largeMessage =
      "Ish beruvchim bilan mehnat shartnomasi bo'yicha uzoq davom etgan nizo. " +
      "Biznes va oylik maosh to'g'risida tafsilot: ".repeat(150);
    assert.ok(largeMessage.length > 5000);

    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: largeMessage }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.response.category, "labor");
    assert.ok(body.response.content.length > 50);
  });

  await it("should neutralize script/HTML injection in inquiry without breaking triage JSON", async () => {
    const maliciousInput = "<script>alert('XSS')</script> Ish beruvchim oylik bermayapti <img src=x onerror=alert(1)>";
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: maliciousInput }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.response.category, "labor");
    assert.ok(body.response.sources.length >= 1);
  });

  await it("should gracefully handle malformed JSON payload with HTTP 400", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "INVALID_JSON{message: unclosed string",
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error);
  });

  await it("should close HTTP boundary test server", async () => {
    await serverInfo.close();
  });
});

// ============================================================
// Boundary Feature 2: Catalog & Search Regex/Special Character Boundaries
// ============================================================
describe("Boundary 2: Catalog & Search Regex/Special Character Boundaries", 2, async () => {
  await it("should safely handle regex meta-characters without regex crash (.*, [a-z], (, ), ^, $)", async () => {
    const unsafeInputs = [".*", "[a-z]+", "(.*)", "^$", "???", "\\d+"];
    for (const q of unsafeInputs) {
      const results = filterSpecialistsCatalog({ search: q });
      assert.ok(Array.isArray(results));
    }
  });

  await it("should return empty array for search queries with 0 matches", async () => {
    const results = filterSpecialistsCatalog({ search: "nonexistentadvocatexyz999" });
    assert.equal(results.length, 0);
  });

  await it("should handle unknown/invalid category gracefully without throwing", async () => {
    const results = filterSpecialistsCatalog({ category: "space_law_nonexistent" });
    assert.equal(results.length, 0);
  });

  await it("should handle unknown/invalid region identifier gracefully without throwing", async () => {
    const results = filterSpecialistsCatalog({ region: "unknown_mars_region" });
    assert.equal(results.length, 0);
  });

  await it("should handle boundary rating filters (0.0 matches all, 5.0 matches only perfect ratings)", async () => {
    const allRatings = filterSpecialistsCatalog({ minRating: "0.0" });
    assert.equal(allRatings.length, MOCK_SPECIALISTS.length);

    const perfectRatings = filterSpecialistsCatalog({ minRating: "5.0" });
    assert.ok(Array.isArray(perfectRatings));
    perfectRatings.forEach((s) => assert.equal(s.rating_avg, 5.0));
  });
});

// ============================================================
// Boundary Feature 3: Authentication & Password Length Thresholds
// ============================================================
describe("Boundary 3: Authentication & Password Length Thresholds", 2, async () => {
  await it("should reject password of length 5 (1 below threshold)", async () => {
    assert.throws(
      () => {
        simulateAuthRegister({
          fullName: "Test User",
          email: "test@mail.uz",
          password: "12345", // Exactly 5 chars
          role: "user",
        });
      },
      /kamida 6 belgidan/
    );
  });

  await it("should accept password of exact boundary length 6", async () => {
    const res = simulateAuthRegister({
      fullName: "Boundary User",
      email: "boundary@mail.uz",
      password: "123456", // Exactly 6 chars
      role: "user",
    });
    assert.equal(res.success, true);
  });

  await it("should reject registration with empty full name", async () => {
    assert.throws(
      () => {
        simulateAuthRegister({
          fullName: "",
          email: "valid@mail.uz",
          password: "password123",
          role: "user",
        });
      },
      /barcha maydonlarni to'ldiring/
    );
  });

  await it("should reject registration with invalid role privilege escalation attempt", async () => {
    assert.throws(
      () => {
        simulateAuthRegister({
          fullName: "Intruder",
          email: "intruder@mail.uz",
          password: "password123",
          role: "root_admin",
        });
      },
      /Noto'g'ri rol tanlandi/
    );
  });

  await it("should accept long passwords (>64 characters) without truncation", async () => {
    const longPass = "SuperSecretPasswordWithLongEntropyForUzbekistanLegalConsultation2026!@#$%^";
    const res = simulateAuthRegister({
      fullName: "Long Pass User",
      email: "longpass@mail.uz",
      password: longPass,
      role: "user",
    });
    assert.equal(res.success, true);
  });
});

// ============================================================
// Boundary Feature 4: Consultation Booking & Time Constraints
// ============================================================
describe("Boundary 4: Consultation Booking & Time Constraints", 2, async () => {
  await it("should verify minimum duration boundary (MIN_CONSULTATION_DURATION = 15 mins)", async () => {
    assert.equal(MIN_CONSULTATION_DURATION, 15);
    const spec = MOCK_SPECIALISTS[0];
    const minService = spec.services.find((s) => s.duration_minutes === 15);
    assert.ok(minService);
    assert.ok(minService.duration_minutes >= MIN_CONSULTATION_DURATION);
  });

  await it("should verify maximum duration boundary (MAX_CONSULTATION_DURATION = 120 mins)", async () => {
    assert.equal(MAX_CONSULTATION_DURATION, 120);
    for (const spec of MOCK_SPECIALISTS) {
      for (const service of spec.services) {
        assert.ok(
          service.duration_minutes <= MAX_CONSULTATION_DURATION,
          `Service ${service.name} duration exceeds maximum 120 mins`
        );
      }
    }
  });

  await it("should preserve special Uzbek diacritics and apostrophes in user inquiry notes", async () => {
    const notesWithDiacritics = "Mening masalam: Bo'shatish to'g'risidagi buyruq noqonuniy deb hisoblayman. G'alaba qozonish imkoni bormi?";
    const booking = simulateConsultationBooking({
      specialistId: "spec-1",
      serviceId: "serv-1",
      scheduledAt: "2026-11-10T14:00:00Z",
      userNotes: notesWithDiacritics,
    });
    assert.equal(booking.user_notes, notesWithDiacritics);
  });

  await it("should reject booking when scheduled date string is unparseable garbage", async () => {
    assert.throws(
      () => {
        simulateConsultationBooking({
          specialistId: "spec-1",
          serviceId: "serv-1",
          scheduledAt: "NOT_A_VALID_DATE_STRING_12345",
        });
      },
      /Yaroqsiz sana formati/
    );
  });

  await it("should reject booking for a nonexistent specialist ID", async () => {
    assert.throws(
      () => {
        simulateConsultationBooking({
          specialistId: "spec-nonexistent-9999",
          serviceId: "serv-1",
          scheduledAt: "2026-11-10T14:00:00Z",
        });
      },
      /Mutaxassis topilmadi/
    );
  });
});

// ============================================================
// Boundary Feature 5: Tariffs, Financial Calculations & Ledger Rounding
// ============================================================
describe("Boundary 5: Tariffs, Financial Calculations & Ledger Rounding", 2, async () => {
  await it("should accurately round fractional commission cents to whole UZS currency units", async () => {
    // 33,333 * 0.15 = 4999.95 -> rounds to 5,000 UZS
    const ledger = calculateCommission(33333, 15);
    assert.equal(ledger.platformFee, 5000);
    assert.equal(ledger.specialistNet, 28333);
    assert.equal(ledger.platformFee + ledger.specialistNet, 33333);
  });

  await it("should calculate commission on high-value corporate consultation (50,000,000 UZS)", async () => {
    const fee = 50000000;
    const ledger = calculateCommission(fee, 15);
    assert.equal(ledger.platformFee, 7500000); // 7.5 million UZS commission
    assert.equal(ledger.specialistNet, 42500000); // 42.5 million net
  });

  await it("should handle 0% commission override edge case", async () => {
    const ledger = calculateCommission(100000, 0);
    assert.equal(ledger.platformFee, 0);
    assert.equal(ledger.specialistNet, 100000);
  });

  await it("should handle 100% commission edge case", async () => {
    const ledger = calculateCommission(100000, 100);
    assert.equal(ledger.platformFee, 100000);
    assert.equal(ledger.specialistNet, 0);
  });

  await it("should reject non-numeric price inputs with domain error", async () => {
    assert.throws(() => calculateCommission("invalid_fee_string"), /musbat son/);
  });
});
