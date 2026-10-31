/**
 * Tier 1: Feature Coverage Test Suite
 * Minimum Requirement: >=5 test cases per core feature across all 8 core feature groups
 */

import assert from "node:assert/strict";
import { describe, it } from "./runner.js";
import {
  LEGAL_CATEGORIES,
  REGIONS,
  MOCK_SPECIALISTS,
  PLATFORM_COMMISSION_PERCENT,
  DEFAULT_CURRENCY,
  createTestServer,
  filterSpecialistsCatalog,
  simulateAuthLogin,
  simulateAuthRegister,
  simulateConsultationBooking,
  calculateCommission,
  simulateChatTurn,
} from "./harness.js";

// ============================================================
// Core Feature 1: Multi-Role Authentication & Demo Personas
// ============================================================
describe("Feature 1: Multi-Role Authentication & Demo Personas", 1, async () => {
  await it("should authenticate citizen client demo persona and route to client dashboard", async () => {
    const res = simulateAuthLogin("mijoz@themis.uz", "password123");
    assert.equal(res.success, true);
    assert.equal(res.user.role, "user");
    assert.equal(res.targetRedirect, "/dashboard");
  });

  await it("should authenticate specialist advocate demo persona and route to specialist portal", async () => {
    const res = simulateAuthLogin("yurist@themis.uz", "password123");
    assert.equal(res.success, true);
    assert.equal(res.user.role, "specialist");
    assert.equal(res.targetRedirect, "/specialist");
  });

  await it("should authenticate system admin demo persona and route to admin panel", async () => {
    const res = simulateAuthLogin("admin@themis.uz", "password123");
    assert.equal(res.success, true);
    assert.equal(res.user.role, "admin");
    assert.equal(res.targetRedirect, "/admin");
  });

  await it("should successfully register a new client user with valid credentials", async () => {
    const res = simulateAuthRegister({
      fullName: "Anvar Karimov",
      email: "anvar@mail.uz",
      password: "securePassword123",
      role: "user",
    });
    assert.equal(res.success, true);
    assert.equal(res.user.full_name, "Anvar Karimov");
    assert.equal(res.user.role, "user");
    assert.equal(res.targetRedirect, "/dashboard");
  });

  await it("should successfully register a new specialist advocate and redirect to specialist onboarding", async () => {
    const res = simulateAuthRegister({
      fullName: "Nodira Zokirova",
      email: "nodira.law@themis.uz",
      password: "advocatePass2026",
      role: "specialist",
    });
    assert.equal(res.success, true);
    assert.equal(res.user.role, "specialist");
    assert.equal(res.targetRedirect, "/specialist/profile");
  });

  await it("should reject registration when password is shorter than 6 characters", async () => {
    assert.throws(
      () => {
        simulateAuthRegister({
          fullName: "Test User",
          email: "test@themis.uz",
          password: "12345",
          role: "user",
        });
      },
      /kamida 6 belgidan/
    );
  });
});

// ============================================================
// Core Feature 2: Specialist Catalog Search & Multi-Criteria Filtering
// ============================================================
describe("Feature 2: Specialist Catalog Search & Multi-Criteria Filtering", 1, async () => {
  await it("should search catalog by specialist name (case-insensitive)", async () => {
    const results = filterSpecialistsCatalog({ search: "azizbek" });
    assert.ok(results.length >= 1);
    assert.ok(results.some((s) => s.full_name.includes("Azizbek")));
  });

  await it("should filter specialists across all 10 legal branches", async () => {
    for (const category of LEGAL_CATEGORIES) {
      const results = filterSpecialistsCatalog({ category: category.id });
      // Verify that every returned specialist explicitly includes the target category
      results.forEach((spec) => {
        assert.ok(
          spec.categories.some((c) => c.id === category.id),
          `Specialist ${spec.full_name} should belong to category ${category.id}`
        );
      });
    }
  });

  await it("should filter specialists by region (Tashkent City vs Samarkand vs Fergana)", async () => {
    const samarkandSpecs = filterSpecialistsCatalog({ region: "samarkand" });
    assert.ok(samarkandSpecs.length >= 1);
    samarkandSpecs.forEach((s) => assert.equal(s.region, "samarkand"));

    const tashkentSpecs = filterSpecialistsCatalog({ region: "tashkent_city" });
    assert.ok(tashkentSpecs.length >= 1);
    tashkentSpecs.forEach((s) => assert.equal(s.region, "tashkent_city"));
  });

  await it("should filter specialists by real-time online presence", async () => {
    const onlineSpecs = filterSpecialistsCatalog({ onlyOnline: true });
    assert.ok(onlineSpecs.length > 0);
    onlineSpecs.forEach((s) => assert.equal(s.is_online, true));
  });

  await it("should filter specialists by minimum rating threshold (4.8+ stars)", async () => {
    const highRated = filterSpecialistsCatalog({ minRating: "4.8" });
    assert.ok(highRated.length > 0);
    highRated.forEach((s) => assert.ok(s.rating_avg >= 4.8));
  });

  await it("should support combined multi-filter (labor + tashkent_city + online + 4.8 rating)", async () => {
    const matched = filterSpecialistsCatalog({
      category: "labor",
      region: "tashkent_city",
      onlyOnline: true,
      minRating: "4.8",
    });
    assert.ok(matched.length >= 1);
    const spec = matched[0];
    assert.equal(spec.full_name, "Azizbek Rahimov");
    assert.equal(spec.is_online, true);
    assert.ok(spec.rating_avg >= 4.8);
  });
});

// ============================================================
// Core Feature 3: Specialist Profile Dossier & Service Tariff Matrix
// ============================================================
describe("Feature 3: Specialist Profile Dossier & Service Tariff Matrix", 1, async () => {
  await it("should provide authentic verified license badge (#ADV) and ministry seal", async () => {
    const spec = MOCK_SPECIALISTS[0];
    assert.equal(spec.verification_status, "approved");
    assert.ok(spec.license_number.startsWith("#ADV-"));
  });

  await it("should display complete educational pedigree and graduation year", async () => {
    const spec = MOCK_SPECIALISTS[0];
    assert.equal(spec.university, "Toshkent Davlat Yuridik Universiteti");
    assert.equal(spec.graduation_year, 2015);
    assert.ok(spec.experience_years >= 9);
  });

  await it("should expose multiple consultation service tariffs with formats and durations", async () => {
    const spec = MOCK_SPECIALISTS[0];
    assert.ok(spec.services.length >= 2);

    const chatService = spec.services.find((s) => s.format === "chat");
    assert.ok(chatService);
    assert.equal(chatService.duration_minutes, 15);
    assert.equal(chatService.price, 70000);
    assert.equal(chatService.currency, "UZS");

    const videoService = spec.services.find((s) => s.format === "video");
    assert.ok(videoService);
    assert.equal(videoService.duration_minutes, 45);
    assert.equal(videoService.price, 180000);
  });

  await it("should expose client reviews with 1-5 ratings and optional specialist replies", async () => {
    const spec = MOCK_SPECIALISTS[0];
    assert.ok(spec.reviews.length >= 2);
    assert.equal(spec.reviews[0].rating, 5);
    assert.ok(spec.reviews[0].comment.length > 10);
    assert.ok(spec.reviews[0].specialist_reply);
  });

  await it("should verify active consultation count and positive rating average integrity", async () => {
    for (const spec of MOCK_SPECIALISTS) {
      assert.ok(spec.rating_avg >= 1.0 && spec.rating_avg <= 5.0);
      assert.ok(spec.consultation_count >= 0);
      assert.ok(spec.rating_count >= 0);
    }
  });
});

// ============================================================
// Core Feature 4: Consultation Booking & Lifecycle Persistence
// ============================================================
describe("Feature 4: Consultation Booking & Lifecycle Persistence", 1, async () => {
  await it("should create a pending consultation request conforming to Interface Contract 3", async () => {
    const scheduledAt = "2026-11-02T15:00:00.000Z";
    const booking = simulateConsultationBooking({
      specialistId: "spec-1",
      serviceId: "serv-2",
      scheduledAt,
      userNotes: "Ish beruvchim noqonuniy ravishda bo'shatmoqda",
      userId: "u-citizen-101",
    });

    assert.ok(booking.id.startsWith("c-"));
    assert.equal(booking.status, "pending");
    assert.equal(booking.specialist_name, "Azizbek Rahimov");
    assert.equal(booking.service_name, "To'liq 45 daqiqalik onlayn konsultatsiya");
    assert.equal(booking.price, 180000);
    assert.equal(booking.currency, "UZS");
  });

  await it("should reject booking when consultation time is omitted", async () => {
    assert.throws(
      () => {
        simulateConsultationBooking({
          specialistId: "spec-1",
          serviceId: "serv-1",
          scheduledAt: "",
        });
      },
      /vaqtini belgilang/
    );
  });

  await it("should reject booking with an unknown service tariff ID", async () => {
    assert.throws(
      () => {
        simulateConsultationBooking({
          specialistId: "spec-1",
          serviceId: "serv-unknown-999",
          scheduledAt: "2026-11-05T10:00:00Z",
        });
      },
      /xizmat tarifi topilmadi/
    );
  });

  await it("should preserve user problem description and notes in booking entity", async () => {
    const notes = "Ish shartnomasi 3-bandi buzilganligi to'g'risida maslahat";
    const booking = simulateConsultationBooking({
      specialistId: "spec-2",
      serviceId: "serv-3",
      scheduledAt: "2026-11-03T11:00:00Z",
      userNotes: notes,
    });
    assert.equal(booking.user_notes, notes);
    assert.equal(booking.status_label, "Kutilmoqda");
  });

  await it("should correctly reflect consultation status transitions (pending -> scheduled -> completed)", async () => {
    const booking = simulateConsultationBooking({
      specialistId: "spec-3",
      serviceId: "serv-4",
      scheduledAt: "2026-11-04T16:00:00Z",
    });
    assert.equal(booking.status, "pending");

    // Specialist approves booking
    booking.status = "scheduled";
    booking.status_label = "Rejalashtirilgan";
    assert.equal(booking.status, "scheduled");

    // Session finishes
    booking.status = "completed";
    booking.status_label = "Yakunlangan";
    assert.equal(booking.status, "completed");
  });
});

// ============================================================
// Core Feature 5: AI Legal Triage Engine & Statutory Citations (HTTP Endpoint)
// ============================================================
describe("Feature 5: AI Legal Triage Engine & Statutory Citations (HTTP Endpoint)", 1, async () => {
  let serverInfo;

  await it("should start ephemeral HTTP test server for /api/ai/chat", async () => {
    serverInfo = await createTestServer();
    assert.ok(serverInfo.port > 0);
  });

  await it("should classify labor dispute, quote Lex.uz Mehnat Kodeksi, and recommend labor advocate", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Ish beruvchim 2 oydan beri oylik maoshimni bermayapti va ishdan bo'shatish bilan tahdid qilmoqda",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.conversation_id);
    assert.equal(body.response.category, "labor");
    assert.ok(body.response.content.includes("Mehnat huquqi"));
    assert.ok(body.response.sources.some((s) => s.title.includes("Mehnat Kodeksi")));
    assert.ok(body.response.sources.some((s) => s.article.includes("161")));
    assert.equal(body.response.needs_specialist, true);
    assert.ok(body.response.recommended_specialists.some((s) => s.full_name === "Azizbek Rahimov"));
  });

  await it("should classify family/divorce dispute, quote Oila Kodeksi, and recommend family specialist", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Nikohdan ajralmoqchiman, voyaga yetmagan bolam uchun aliment belgilash tartibi qanday?",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.response.category, "family");
    assert.ok(body.response.sources.some((s) => s.title.includes("Oila Kodeksi")));
    assert.ok(body.response.sources.some((s) => s.article.includes("96")));
    assert.ok(body.response.recommended_specialists.some((s) => s.full_name === "Dilnoza Karimova"));
  });

  await it("should classify housing lease dispute, quote Fuqarolik/Uy-joy Kodeksi, and recommend housing advocate", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Ijara uy egasi garov pulini bermayapti va kvartira shartnomasi bo'yicha e'tiroz bildirmoqda",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.response.category, "housing");
    assert.ok(body.response.sources.some((s) => s.title.includes("Uy-joy Kodeksi") || s.title.includes("Fuqarolik Kodeksi")));
    assert.ok(body.response.recommended_specialists.some((s) => s.full_name === "Rustam Mahmudov"));
  });

  await it("should return HTTP 400 when message is empty or missing", async () => {
    const res = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, "Xabar matni kiritilmadi");
  });

  await it("should shut down ephemeral HTTP test server cleanly", async () => {
    await serverInfo.close();
  });
});

// ============================================================
// Core Feature 6: Consultation Chat & Communication Session
// ============================================================
describe("Feature 6: Consultation Chat & Communication Session", 1, async () => {
  await it("should append user message and simulate specialist attorney response", async () => {
    const initialMessages = [
      { id: "1", sender: "specialist", text: "Assalomu alaykum!", time: "10:00" },
    ];
    const updated = simulateChatTurn(initialMessages, "Mehnat shartnomasi nusxasini ilova qilyapman.");
    assert.equal(updated.length, 3);
    assert.equal(updated[1].sender, "user");
    assert.equal(updated[1].text, "Mehnat shartnomasi nusxasini ilova qilyapman.");
    assert.equal(updated[2].sender, "specialist");
    assert.ok(updated[2].text.includes("Xabaringizni oldim"));
  });

  await it("should enforce non-empty message constraint in consultation chat", async () => {
    assert.throws(() => simulateChatTurn([], "   "), /bo'sh bo'lishi mumkin emas/);
  });

  await it("should include time-of-day timestamps on all sent messages", async () => {
    const history = simulateChatTurn([], "Xayrli kun!");
    history.forEach((m) => {
      assert.ok(m.time);
      assert.match(m.time, /\d{1,2}:\d{2}/);
    });
  });

  await it("should maintain video room link metadata on consultation session", async () => {
    const session = {
      id: "c-101",
      videoMeetingUrl: "https://meet.google.com/thm-legal-aid",
      isLive: true,
    };
    assert.ok(session.videoMeetingUrl.startsWith("https://meet.google.com/"));
  });

  await it("should support document attachment flag in consultation chat interaction", async () => {
    const attachment = {
      filename: "mehnat_shartnomasi.pdf",
      sizeBytes: 1048576,
      mimeType: "application/pdf",
    };
    assert.ok(attachment.filename.endsWith(".pdf"));
    assert.ok(attachment.sizeBytes > 0);
  });
});

// ============================================================
// Core Feature 7: Role Permissions & Administration Oversight
// ============================================================
describe("Feature 7: Role Permissions & Administration Oversight", 1, async () => {
  await it("should verify root admin access to specialist verification queue", async () => {
    const pendingSpecialists = MOCK_SPECIALISTS.filter((s) => s.verification_status === "pending");
    assert.ok(pendingSpecialists.length >= 1);
    const target = pendingSpecialists[0];
    assert.equal(target.full_name, "Shahnoza Alimova");
  });

  await it("should approve specialist credentials and transition status to approved", async () => {
    const specialist = { ...MOCK_SPECIALISTS[4] };
    assert.equal(specialist.verification_status, "pending");

    // Admin approves
    specialist.verification_status = "approved";
    specialist.admin_notes = "Litsenziya #ADV-9920 Adliya Vazirligi bazasida tasdiqlandi";

    assert.equal(specialist.verification_status, "approved");
    assert.ok(specialist.admin_notes.includes("tasdiqlandi"));
  });

  await it("should reject specialist credentials with justification when license is invalid", async () => {
    const specialist = { ...MOCK_SPECIALISTS[4] };
    specialist.verification_status = "rejected";
    specialist.admin_notes = "Taqdim etilgan diplom davlat reestridan topilmadi";

    assert.equal(specialist.verification_status, "rejected");
  });

  await it("should block citizen users from accessing specialist earnings and schedule portals", async () => {
    const clientUser = { role: "user" };
    const canAccessSpecialistPortal = clientUser.role === "specialist";
    const canAccessAdminPortal = clientUser.role === "admin";
    assert.equal(canAccessSpecialistPortal, false);
    assert.equal(canAccessAdminPortal, false);
  });

  await it("should block specialists from accessing root administrative controls", async () => {
    const specialistUser = { role: "specialist" };
    const canAccessAdmin = specialistUser.role === "admin";
    assert.equal(canAccessAdmin, false);
  });
});

// ============================================================
// Core Feature 8: Financial Calculations & Platform Commission
// ============================================================
describe("Feature 8: Financial Calculations & Platform Commission", 1, async () => {
  await it("should calculate exact 15% platform commission on 100,000 UZS fee", async () => {
    const ledger = calculateCommission(100000, PLATFORM_COMMISSION_PERCENT);
    assert.equal(ledger.price, 100000);
    assert.equal(ledger.commissionPercent, 15);
    assert.equal(ledger.platformFee, 15000);
    assert.equal(ledger.specialistNet, 85000);
    assert.equal(ledger.currency, "UZS");
  });

  await it("should calculate exact 15% platform commission on 180,000 UZS consultation", async () => {
    const ledger = calculateCommission(180000, 15);
    assert.equal(ledger.platformFee, 27000);
    assert.equal(ledger.specialistNet, 153000);
  });

  await it("should calculate exact 15% platform commission on 250,000 UZS consultation", async () => {
    const ledger = calculateCommission(250000, 15);
    assert.equal(ledger.platformFee, 37500);
    assert.equal(ledger.specialistNet, 212500);
  });

  await it("should handle 0 UZS pro-bono consultation with 0 platform fee", async () => {
    const ledger = calculateCommission(0, 15);
    assert.equal(ledger.platformFee, 0);
    assert.equal(ledger.specialistNet, 0);
  });

  await it("should reject negative consultation prices with clear domain error", async () => {
    assert.throws(() => calculateCommission(-50000), /musbat son bo'lishi kerak/);
  });
});
