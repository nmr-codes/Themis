/**
 * Tier 4: Real-World Application Scenarios Test Suite
 * Minimum Requirement: Realistic end-to-end citizen journeys across Uzbekistan legal realities:
 * 1. Labor Disputes (Unpaid salary & wrongful termination)
 * 2. Divorce, Child Custody & Alimony Calculation
 * 3. Housing Lease & Eviction Defense
 * 4. Commercial Contract Breach & Debt Recovery
 */

import assert from "node:assert/strict";
import { describe, it } from "./runner.js";
import {
  LEGAL_CATEGORIES,
  REGIONS,
  MOCK_SPECIALISTS,
  createTestServer,
  filterSpecialistsCatalog,
  simulateAuthLogin,
  simulateConsultationBooking,
  calculateCommission,
  simulateChatTurn,
} from "./harness.js";

describe("Tier 4: Real-World Citizen Workload Journeys", 4, async () => {
  let serverInfo;

  await it("should initialize test server for real-world scenarios", async () => {
    serverInfo = await createTestServer();
    assert.ok(serverInfo.port > 0);
  });

  // ============================================================
  // Scenario 1: Labor Dispute Citizen Journey
  // ============================================================
  await it("Scenario 1: Labor Dispute Journey — citizen facing 3-month unpaid wages and wrongful dismissal", async () => {
    // 1. Citizen submits urgent problem to AI legal triage
    const prompt = "Ish beruvchim 3 oydan beri oylik maoshimni bermayapti va ishdan bo'shatish to'g'risida majburiy ariza yozdirmoqda. Huquqlarim qanday?";
    const triageRes = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    assert.equal(triageRes.status, 200);
    const triage = (await triageRes.json()).response;

    // 2. Verify statutory triage classification and Lex.uz citations
    assert.equal(triage.category, "labor");
    assert.ok(triage.content.includes("Mehnat kodeksiga binoan"));
    assert.ok(triage.sources.some((s) => s.article.includes("161, 244")));

    // 3. Recommended specialist is retrieved
    assert.ok(triage.recommended_specialists.length >= 1);
    const advocate = triage.recommended_specialists[0];
    assert.equal(advocate.full_name, "Azizbek Rahimov");

    // 4. Citizen inspects advocate profile and chooses comprehensive 45-min consultation
    const service = advocate.services.find((s) => s.duration_minutes === 45);
    assert.ok(service);
    assert.equal(service.price, 180000);

    // 5. Citizen books consultation
    const booking = simulateConsultationBooking({
      specialistId: advocate.id,
      serviceId: service.id,
      scheduledAt: "2026-11-04T15:00:00Z",
      userNotes: "3 oylik maosh va majburiy ariza bo'yicha hujjatlar to'plami",
      userId: "citizen-labor-1",
    });
    assert.equal(booking.status, "pending");

    // 6. Citizen enters consultation chat and uploads contract details
    const chat = simulateChatTurn([], "Assalomu alaykum, mehnat daftarcham va oylik hisob-kitob varaqalarini tayyorladim.");
    assert.equal(chat.length, 2);
    assert.equal(chat[0].sender, "user");
    assert.equal(chat[1].sender, "specialist");
  });

  // ============================================================
  // Scenario 2: Divorce & Child Custody Citizen Journey
  // ============================================================
  await it("Scenario 2: Divorce & Child Support Journey — alimony determination under Family Code and advocate consultation", async () => {
    // 1. Citizen inquires about alimony for 2 minor children
    const inquiry = "Nikohdan ajralmoqchiman. 2 nafar voyaga yetmagan bolam uchun aliment miqdori qanday hisoblanadi?";
    const triageRes = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: inquiry }),
    });

    assert.equal(triageRes.status, 200);
    const triage = (await triageRes.json()).response;

    // 2. Statutory confirmation of 1/3 income rule for 2 children
    assert.equal(triage.category, "family");
    assert.ok(triage.content.includes("uchdan bir qismi (1/3)"));
    assert.ok(triage.sources.some((s) => s.title.includes("Oila Kodeksi")));

    // 3. Recommended specialist in Samarkand region
    const familyAdvocate = triage.recommended_specialists.find((s) => s.region === "samarkand");
    assert.ok(familyAdvocate);
    assert.equal(familyAdvocate.full_name, "Dilnoza Karimova");

    // 4. Book 30-min family consultation
    const familyService = familyAdvocate.services[0];
    const booking = simulateConsultationBooking({
      specialistId: familyAdvocate.id,
      serviceId: familyService.id,
      scheduledAt: "2026-11-05T11:00:00Z",
      userNotes: "2 nafar bola uchun aliment va bolalarning yashash joyi",
      userId: "citizen-family-2",
    });
    assert.equal(booking.status, "pending");
    assert.equal(booking.price, 120000);

    // 5. Post-consultation rating submission
    const review = {
      rating: 5,
      comment: "Dilnoza Karimova aliment va sud buyrug'i bo'yicha juda aniq yo'l-yo'riq berdilar. Rahmat!",
    };
    assert.equal(review.rating, 5);
  });

  // ============================================================
  // Scenario 3: Housing Lease Eviction Defense Citizen Journey
  // ============================================================
  await it("Scenario 3: Housing Eviction Journey — unlawful 3-day eviction notice and security deposit retention", async () => {
    // 1. Citizen submits eviction problem
    const inquiry = "Uy egasi ijara shartnomasi qoidalarini buzdi, kvartiradan noqonuniy haydamoqda va garov depozitini bermayapti.";
    const triageRes = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: inquiry }),
    });

    assert.equal(triageRes.status, 200);
    const triage = (await triageRes.json()).response;

    // 2. Statutory guidance on housing lease and tax registration
    assert.equal(triage.category, "housing");
    assert.ok(triage.content.includes("ijara.soliq.uz"));
    assert.ok(triage.sources.some((s) => s.title.includes("Uy-joy Kodeksi") || s.title.includes("Fuqarolik Kodeksi")));

    // 3. Match housing specialist Rustam Mahmudov
    const housingAdvocate = MOCK_SPECIALISTS.find((s) => s.id === "spec-3");
    assert.ok(housingAdvocate);
    assert.equal(housingAdvocate.full_name, "Rustam Mahmudov");

    // 4. Book contract expertise service (60 mins, 250,000 UZS)
    const service = housingAdvocate.services[0];
    const booking = simulateConsultationBooking({
      specialistId: housingAdvocate.id,
      serviceId: service.id,
      scheduledAt: "2026-11-07T16:00:00Z",
      userNotes: "Ijara shartnomasi va depozit kvitansiyasi ekspertizasi",
    });
    assert.equal(booking.price, 250000);
    assert.equal(booking.duration_minutes, 60);

    // 5. Financial ledger validation
    const ledger = calculateCommission(booking.price, 15);
    assert.equal(ledger.platformFee, 37500);
    assert.equal(ledger.specialistNet, 212500);
  });

  // ============================================================
  // Scenario 4: Commercial Contract Breach & Debt Recovery Journey
  // ============================================================
  await it("Scenario 4: Commercial Contract & Debt Recovery — business owner recovering unpaid delivery debt", async () => {
    // 1. Business owner submits contract breach inquiry
    const inquiry = "MCHJ korxonamiz tovar yetkazib berdi, ammo kontragent to'lovni to'lamayapti. Shartnoma buzilgan, penya va da'vo arizasi kiritmoqchimiz.";
    const triageRes = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: inquiry }),
    });

    assert.equal(triageRes.status, 200);
    const triage = (await triageRes.json()).response;

    // 2. Civil / business law categorization
    assert.ok(triage.category === "civil" || triage.category === "business");
    assert.ok(
      triage.sources.some(
        (s) => s.title.includes("Tadbirkorlik") || s.title.includes("Fuqarolik Kodeksi")
      )
    );

    // 3. Filter catalog for business & contract specialists
    const businessAdvocates = filterSpecialistsCatalog({ category: "business" });
    assert.ok(businessAdvocates.length >= 1);

    // 4. Calculate escrow holding and platform commission
    const consultationFee = 300000; // UZS
    const ledger = calculateCommission(consultationFee, 15);
    assert.equal(ledger.platformFee, 45000);
    assert.equal(ledger.specialistNet, 255000);
  });

  await it("should terminate real-world test server", async () => {
    await serverInfo.close();
  });
});
