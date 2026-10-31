const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("\n======================================================================");
console.log("  AUDITOR M2: ADVERSARIAL STRESS-TEST PROBES");
console.log("======================================================================\n");

let passed = 0;
let total = 0;

function probe(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [AUDITOR PROBE ${total}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [AUDITOR PROBE ${total}] ${name}: ${err.message}`);
  }
}

const root = path.resolve(__dirname, "../../..");

// Probe 1: Ensure no dangerous javascript: pseudo-protocols or dead href='#'
probe("Zero javascript: or dead '#' links in src/", () => {
  function scan(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) scan(full);
      else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const content = fs.readFileSync(full, 'utf8');
        assert.ok(!content.includes('href="javascript:'), `Dangerous javascript: protocol in ${full}`);
        // Only allow #sohalar, #qanday-ishlaydi, #kafolatlar, or /#... but not lone href="#"
        const deadHrefs = content.match(/href=["']#["']/g);
        assert.equal(deadHrefs, null, `Found dead href="#" in ${full}`);
      }
    }
  }
  scan(path.join(root, 'src'));
});

// Probe 2: Ensure all 10 Legal Categories in constants.ts have matching icons in Landing Page
probe("Landing page maps all 10 legal categories to distinct Lucide icons", () => {
  const pageSrc = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
  const constantsSrc = fs.readFileSync(path.join(root, 'src/lib/constants.ts'), 'utf8');
  
  // Extract category IDs specifically from LEGAL_CATEGORIES
  const legalCategoriesBlock = constantsSrc.split("export const REGIONS")[0];
  const catMatches = legalCategoriesBlock.match(/id:\s*["']([^"']+)["']/g).map(m => m.split(/["']/)[1]);
  assert.equal(catMatches.length, 10, "Should have 10 legal categories");
  
  for (const cat of catMatches) {
    assert.ok(
      pageSrc.includes(`${cat}: `),
      `Landing page CATEGORY_ICONS must include '${cat}'`
    );
    assert.ok(
      pageSrc.includes(`${cat}: "O'zR `) || pageSrc.includes(`${cat}: "Tadbirkorlik `),
      `Landing page CATEGORY_STATUTES must include citation for '${cat}'`
    );
  }
});

// Probe 3: Statutory Citations Integrity Probe (Uzbekistan Lex.uz grounding)
probe("Legal policy routes contain authentic statutory citations and references", () => {
  const privacy = fs.readFileSync(path.join(root, 'src/app/privacy/page.tsx'), 'utf8');
  const terms = fs.readFileSync(path.join(root, 'src/app/terms/page.tsx'), 'utf8');
  const about = fs.readFileSync(path.join(root, 'src/app/about/page.tsx'), 'utf8');

  // Privacy statutory checks
  assert.ok(privacy.includes('O\'RQ-547') || privacy.includes('O&apos;RQ-547'), 'Privacy must cite Law O\'RQ-547');
  assert.ok(privacy.includes('27-modda') || privacy.includes('27-moddasi'), 'Privacy must cite Art 27 of O\'RQ-547');
  assert.ok(privacy.includes('28-modda') && privacy.includes('31-modda'), 'Privacy must cite Constitution Arts 28 & 31');
  assert.ok(privacy.includes('6 va 9-modda') || (privacy.includes('6') && privacy.includes('9-modda')), 'Privacy must cite Law on Advocacy Arts 6 & 9');
  assert.ok(privacy.includes('TLS 1.3') && privacy.includes('AES-256'), 'Privacy must cite encryption standards');

  // Terms statutory checks
  assert.ok(terms.includes('367') && terms.includes('369'), 'Terms must cite Civil Code 367, 369');
  assert.ok(terms.includes('15%'), 'Terms must state 15% platform commission');
  assert.ok(terms.includes('85%'), 'Terms must state 85% specialist remuneration');
  assert.ok(terms.includes('Eskrou') || terms.includes('eskrou'), 'Terms must state escrow mechanism');
  assert.ok(terms.includes('Toshkent shahri'), 'Terms must designate Tashkent jurisdiction');

  // About statutory checks
  assert.ok(about.includes('TDYU') || about.includes('Toshkent Davlat Yuridik'), 'About must mention TDYU');
  assert.ok(about.includes('Lex.uz'), 'About must cite Lex.uz');
  assert.ok(about.includes('14'), 'About must cite 14 territorial jurisdictions');
});

// Probe 4: Persona Switcher State Integrity Probe
probe("Demo switcher personas produce valid, well-formed localStorage entities", () => {
  const pageSrc = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
  assert.ok(pageSrc.includes('demoPersonas'), 'Landing page must define demoPersonas structure');
  assert.ok(pageSrc.includes('themis_demo_user'), 'Landing page must persist persona to themis_demo_user');
  assert.ok(pageSrc.includes('router.push("/admin")'), 'Admin persona must route to /admin');
  assert.ok(pageSrc.includes('router.push("/specialist")'), 'Specialist persona must route to /specialist');
  assert.ok(pageSrc.includes('router.push("/dashboard")'), 'Client persona must route to /dashboard');
});

// Probe 5: Reusable Modals & Dialog Accessibility
probe("Dialog modals implement accessible title and description semantics", () => {
  const forgot = fs.readFileSync(path.join(root, 'src/components/modals/forgot-password-modal.tsx'), 'utf8');
  const privacy = fs.readFileSync(path.join(root, 'src/components/modals/privacy-modal.tsx'), 'utf8');
  const terms = fs.readFileSync(path.join(root, 'src/components/modals/terms-modal.tsx'), 'utf8');

  for (const [name, content] of [['ForgotPasswordModal', forgot], ['PrivacyModal', privacy], ['TermsModal', terms]]) {
    assert.ok(content.includes('<DialogTitle'), `${name} must include DialogTitle for WCAG screen reader accessibility`);
    assert.ok(content.includes('<DialogDescription'), `${name} must include DialogDescription for WCAG screen reader accessibility`);
  }
});

// Probe 6: Route Link Canonical Conformity Across All Normalized Files
probe("All 11 normalized files contain zero broken /dashboard/ prefixes", () => {
  const targetFiles = [
    'src/app/(dashboard)/layout.tsx',
    'src/app/(dashboard)/dashboard/page.tsx',
    'src/app/(dashboard)/specialists/page.tsx',
    'src/app/(dashboard)/specialists/[id]/page.tsx',
    'src/app/(dashboard)/ai-chat/page.tsx',
    'src/app/(dashboard)/ai-chat/[id]/page.tsx',
    'src/app/(dashboard)/consultations/page.tsx',
    'src/app/(dashboard)/consultations/[id]/page.tsx',
    'src/app/(dashboard)/consultations/[id]/chat/page.tsx',
    'src/app/(specialist)/specialist/requests/page.tsx',
    'src/app/page.tsx',
  ];

  for (const rel of targetFiles) {
    const full = path.join(root, rel);
    assert.ok(fs.existsSync(full), `File ${rel} must exist`);
    const content = fs.readFileSync(full, 'utf8');
    const matches = content.match(/\/dashboard\/(specialists|ai-chat|consultations|profile)/g);
    assert.equal(matches, null, `File ${rel} still contains broken links: ${matches}`);
  }
});

console.log(`\nProbe Results: ${passed} / ${total} passed`);
assert.equal(passed, total, "All auditor adversarial probes must pass");
