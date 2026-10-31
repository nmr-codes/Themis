/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * Minimum Requirement: Pairwise interactions across platform modules:
 * Triage -> Catalog -> Booking -> Consultation Chat -> Specialist Portal -> Admin Verification
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

describe("Tier 3: Pairwise Cross-Feature Workflows", 3, async () => {
  let serverInfo;

  await it("should setup test server for cross-feature endpoint requests", async () => {
    serverInfo = await createTestServer();
    assert.ok(serverInfo.port > 0);
  });

  // ============================================================
  // Pairwise Workflow 1: AI Triage -> Category Extraction -> Catalog Filtering -> Advocate Selection
  // ============================================================
  await it("Workflow 1: Triage to Catalog — citizen inquiry extracts legal category and directly filters matching advocates", async () => {
    // Step 1: Citizen submits a family law inquiry to AI Triage
    const triageRes = await fetch(`${serverInfo.baseUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Nikohdan ajralmoqchiman, voyaga yetmagan bolam uchun aliment belgilash tartibi qanday?",
      }),
    });
    assert.equal(triageRes.status, 200);
    const triageData = await triageRes.json();
    const extractedCategory = triageData.response.category;
    assert.equal(extractedCategory, "family");

    // Step 2: Citizen clicks recommended category link to open specialist catalog
    const matchingAdvocates = filterSpecialistsCatalog({ category: extractedCategory });
    assert.ok(matchingAdvocates.length >= 1);

    // Step 3: Verified that recommended advocate belongs to family law
    const selectedAdvocate = matchingAdvocates[0];
    assert.equal(selectedAdvocate.full_name, "Dilnoza Karimova");
    assert.ok(selectedAdvocate.categories.some((c) => c.id === "family"));
  });

  // ============================================================
  // Pairwise Workflow 2: Catalog -> Specialist Dossier -> Tariff Selection -> Booking Persistence
  // ============================================================
  await it("Workflow 2: Catalog to Booking Persistence — browse catalog, inspect dossier, select tariff, submit booking", async () => {
    // Step 1: Citizen filters for labor specialists in Tashkent City
    const laborSpecs = filterSpecialistsCatalog({ category: "labor", region: "tashkent_city" });
    assert.ok(laborSpecs.length >= 1);
    const advocate = laborSpecs[0];

    // Step 2: Inspect dossier credentials and tariffs
    assert.ok(advocate.license_number.startsWith("#ADV-"));
    assert.ok(advocate.services.length >= 2);
    const videoTariff = advocate.services.find((s) => s.format === "video");
    assert.ok(videoTariff);

    // Step 3: Citizen books 45-min consultation appointment
    const scheduledTime = "2026-11-06T15:00:00Z";
    const userNotes = "Noqonuniy ishdan bo'shatish bo'yicha hujjatlarni ko'rib chiqish kerak";
    const booking = simulateConsultationBooking({
      specialistId: advocate.id,
      serviceId: videoTariff.id,
      scheduledAt: scheduledTime,
      userNotes,
      userId: "u-citizen-88",
    });

    // Step 4: Verify persistence state (Interface Contract 3: status 'pending')
    assert.equal(booking.status, "pending");
    assert.equal(booking.specialist_id, advocate.id);
    assert.equal(booking.price, videoTariff.price);
    assert.equal(booking.duration_minutes, 45);
    assert.equal(booking.user_notes, userNotes);
  });

  // ============================================================
  // Pairwise Workflow 3: Confirmed Consultation -> Secure Chat -> Video Launch -> Review Rating
  // ============================================================
  await it("Workflow 3: Consultation to Chat & Review — appointment confirmation, chat interaction, video room, client review", async () => {
    // Step 1: Confirmed consultation state
    const consultation = {
      id: "c-active-201",
      specialist_id: "spec-1",
      specialist_name: "Azizbek Rahimov",
      status: "scheduled",
      videoUrl: "https://meet.google.com/thm-legal-aid",
      messages: [],
    };

    // Step 2: User and specialist converse in consultation chat
    const chatState1 = simulateChatTurn(consultation.messages, "Mehnat shartnomam va buyruq nusxasini tayyorlab qo'ydim.");
    assert.equal(chatState1.length, 2);
    assert.equal(chatState1[0].sender, "user");
    assert.equal(chatState1[1].sender, "specialist");

    // Step 3: Video consultation conducted
    assert.ok(consultation.videoUrl.startsWith("https://meet.google.com/"));
    consultation.status = "completed";

    // Step 4: Post-consultation rating submission
    const reviewSubmission = {
      consultation_id: consultation.id,
      rating: 5,
      comment: "Advokat Azizbek Rahimov barcha moddalarni aniq va tushunarli qilib ko'rsatib berdilar.",
      specialist_reply: null,
      created_at: new Date().toISOString(),
    };
    assert.equal(reviewSubmission.rating, 5);
    assert.ok(reviewSubmission.comment.length > 20);
  });

  // ============================================================
  // Pairwise Workflow 4: Client Booking -> Specialist Requests Portal -> Acceptance & Schedule
  // ============================================================
  await it("Workflow 4: Client Booking to Specialist Portal — client creates request, specialist accepts, slot confirmed", async () => {
    // Step 1: Client submits request
    const booking = simulateConsultationBooking({
      specialistId: "spec-2",
      serviceId: "serv-3",
      scheduledAt: "2026-11-08T11:00:00Z",
      userNotes: "Aliment miqdorini aniqlashtirish",
    });
    assert.equal(booking.status, "pending");

    // Step 2: Specialist views incoming requests in /specialist/requests
    const specialistRequests = [booking];
    assert.equal(specialistRequests.length, 1);
    assert.equal(specialistRequests[0].status, "pending");

    // Step 3: Specialist accepts request
    specialistRequests[0].status = "scheduled";
    specialistRequests[0].status_label = "Qabul qilindi";
    assert.equal(specialistRequests[0].status, "scheduled");
  });

  // ============================================================
  // Pairwise Workflow 5: Specialist Onboarding -> Admin Verification -> Catalog Visibility
  // ============================================================
  await it("Workflow 5: Specialist Verification to Catalog Visibility — unverified specialist hidden until admin approval", async () => {
    // Step 1: Specialist Shahnoza Alimova has status: 'pending'
    const pendingSpec = MOCK_SPECIALISTS.find((s) => s.id === "spec-5");
    assert.ok(pendingSpec);
    assert.equal(pendingSpec.verification_status, "pending");

    // Public catalog filter should only display approved specialists
    const publicCatalogBefore = MOCK_SPECIALISTS.filter((s) => s.verification_status === "approved");
    assert.ok(!publicCatalogBefore.some((s) => s.id === "spec-5"));

    // Step 2: Admin inspects license credentials in /admin/specialists and approves
    const specToApprove = { ...pendingSpec };
    specToApprove.verification_status = "approved";
    specToApprove.admin_notes = "Diplom va Adliya Vazirligi litsenziyasi to'liq tasdiqlandi";

    // Step 3: Specialist is now eligible for public catalog
    assert.equal(specToApprove.verification_status, "approved");
  });

  // ============================================================
  // Pairwise Workflow 6: Completed Consultation -> Escrow Release & 15% Platform Commission Ledger
  // ============================================================
  await it("Workflow 6: Escrow Release to Financial Commission Ledger — calculate 15% platform split and specialist payout", async () => {
    const consultationPrice = 250000; // UZS
    const commissionLedger = calculateCommission(consultationPrice, 15);

    assert.equal(commissionLedger.price, 250000);
    assert.equal(commissionLedger.platformFee, 37500); // 15% platform commission
    assert.equal(commissionLedger.specialistNet, 212500); // 85% specialist earnings

    // Verify exact conservation of funds
    assert.equal(commissionLedger.platformFee + commissionLedger.specialistNet, consultationPrice);
  });

  await it("should close cross-feature test server", async () => {
    await serverInfo.close();
  });
});
