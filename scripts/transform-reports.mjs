// One-off transform: converts raw scanner reports in data/reports/*.json into the
// DashboardData shape consumed by the frontend (frontend/src/store/types.ts).
//
// Run with: node scripts/transform-reports.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORTS_DIR = join(ROOT, 'data', 'reports');
const OUT_FILE = join(ROOT, 'frontend', 'src', 'data', 'vulnerability-findings.json');

const PROJECT = 'juice-shop';

function readJSON(name) {
  return JSON.parse(readFileSync(join(REPORTS_DIR, name), 'utf-8'));
}

function normSeverity(raw) {
  const s = String(raw || '').toUpperCase();
  if (['CRITICAL', 'BLOCKER'].includes(s)) return 'Critical';
  if (['HIGH', 'ERROR'].includes(s)) return 'High';
  if (['MEDIUM', 'MAJOR', 'WARNING', 'MODERATE'].includes(s)) return 'Medium';
  return 'Low';
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const findings = [];

// ---------------------------------------------------------------------------
// SCA: Trivy (OS + language packages)
// ---------------------------------------------------------------------------
const trivy = readJSON('trivy.json');
const trivyDate = trivy.CreatedAt || new Date().toISOString();
let trivyIdx = 0;
for (const result of trivy.Results || []) {
  for (const v of result.Vulnerabilities || []) {
    trivyIdx += 1;
    findings.push({
      id: `SCA-TRIVY-${String(trivyIdx).padStart(3, '0')}`,
      type: 'SCA',
      project: PROJECT,
      vulnerability_id: v.VulnerabilityID,
      package_name: v.PkgName,
      installed_version: v.InstalledVersion,
      vulnerability_type: v.Title || (v.CweIDs || [])[0] || 'Vulnerable Dependency',
      severity: normSeverity(v.Severity),
      description: v.Description || v.Title || 'No description available.',
      fixed_version: v.FixedVersion || 'Not fixed yet',
      status: 'Open',
      scanner: 'Trivy',
      location: result.Target,
      detected_at: trivyDate,
    });
  }
}

// ---------------------------------------------------------------------------
// SCA: Grype (dependency vulnerabilities)
// ---------------------------------------------------------------------------
const grype = readJSON('grype.json');
let grypeIdx = 0;
for (const m of grype.matches || []) {
  grypeIdx += 1;
  const fixVersions = m.vulnerability?.fix?.versions || [];
  findings.push({
    id: `SCA-GRYPE-${String(grypeIdx).padStart(3, '0')}`,
    type: 'SCA',
    project: PROJECT,
    vulnerability_id: m.vulnerability.id,
    package_name: m.artifact.name,
    installed_version: m.artifact.version,
    vulnerability_type: m.vulnerability.description
      ? m.vulnerability.description.split('.')[0]
      : 'Vulnerable Dependency',
    severity: normSeverity(m.vulnerability.severity),
    description:
      m.vulnerability.description || `${m.artifact.name}@${m.artifact.version} is affected by ${m.vulnerability.id}.`,
    fixed_version: fixVersions[0] || 'Not fixed yet',
    status: 'Open',
    scanner: 'Grype',
    location: m.artifact.locations?.[0]?.path || m.artifact.purl || m.artifact.name,
    detected_at: trivyDate,
  });
}

// ---------------------------------------------------------------------------
// SAST: Semgrep
// ---------------------------------------------------------------------------
const semgrep = readJSON('semgrep.json');
let semgrepIdx = 0;
for (const r of semgrep.results || []) {
  semgrepIdx += 1;
  const ruleName = r.check_id.split('.').pop();
  findings.push({
    id: `SAST-SEMGREP-${String(semgrepIdx).padStart(3, '0')}`,
    type: 'SAST',
    project: PROJECT,
    vulnerability_id: ruleName,
    package_name: r.path,
    installed_version: `Line ${r.start.line}`,
    vulnerability_type: (r.extra.metadata?.owasp || [])[0] || ruleName.replace(/-/g, ' '),
    severity: normSeverity(r.extra.severity),
    description: r.extra.message,
    fixed_version: 'N/A',
    status: 'Open',
    scanner: 'Semgrep',
    location: `${r.path}:${r.start.line}`,
    detected_at: trivyDate,
  });
}

// ---------------------------------------------------------------------------
// SAST: SonarQube (vulnerability-type issues only)
// ---------------------------------------------------------------------------
const sonarqube = readJSON('sonarqube.json');
let sonarIdx = 0;
for (const issue of sonarqube.issues || []) {
  if (issue.type !== 'VULNERABILITY') continue;
  sonarIdx += 1;
  const component = issue.component.replace(`${issue.project}:`, '');
  findings.push({
    id: `SAST-SONARQUBE-${String(sonarIdx).padStart(3, '0')}`,
    type: 'SAST',
    project: PROJECT,
    vulnerability_id: issue.rule,
    package_name: component,
    installed_version: issue.line ? `Line ${issue.line}` : 'N/A',
    vulnerability_type: issue.rule.split(':').pop().replace(/^S/, 'Rule '),
    severity: normSeverity(issue.severity),
    description: issue.message,
    fixed_version: 'N/A',
    status: 'Open',
    scanner: 'SonarQube',
    location: issue.line ? `${component}:${issue.line}` : component,
    detected_at: issue.creationDate || trivyDate,
  });
}

// ---------------------------------------------------------------------------
// DAST: Wapiti
// ---------------------------------------------------------------------------
const wapiti = readJSON('wapiti.json');
const wapitiDate = new Date(wapiti.infos?.date || Date.now()).toISOString();
const WAPITI_SEVERITY_BY_CATEGORY = {
  'Content Security Policy Configuration': 'Low',
  'Unencrypted Channels': 'Medium',
};
let wapitiIdx = 0;
for (const [category, entries] of Object.entries(wapiti.vulnerabilities || {})) {
  for (const entry of entries) {
    wapitiIdx += 1;
    findings.push({
      id: `DAST-WAPITI-${String(wapitiIdx).padStart(3, '0')}`,
      type: 'DAST',
      project: PROJECT,
      vulnerability_id: `WAPITI-${wapiti.infos?.version?.replace(/\s+/g, '') || 'SCAN'}-${wapitiIdx}`,
      package_name: category,
      installed_version: entry.method || 'N/A',
      vulnerability_type: category,
      severity: WAPITI_SEVERITY_BY_CATEGORY[category] || 'Low',
      description: entry.info || `${category} issue detected on ${entry.path}.`,
      fixed_version: 'N/A',
      status: 'Open',
      scanner: 'Wapiti',
      location: entry.path,
      detected_at: wapitiDate,
    });
  }
}

// ---------------------------------------------------------------------------
// DAST: OWASP ZAP
// ---------------------------------------------------------------------------
const zap = readJSON('zap.json');
const zapDate = zap.created || new Date().toISOString();
const ZAP_RISK_SEVERITY = { 3: 'High', 2: 'Medium', 1: 'Low', 0: 'Low' };
let zapIdx = 0;
for (const site of zap.site || []) {
  for (const alert of site.alerts || []) {
    zapIdx += 1;
    const instances = alert.instances || [];
    findings.push({
      id: `DAST-ZAP-${String(zapIdx).padStart(3, '0')}`,
      type: 'DAST',
      project: PROJECT,
      vulnerability_id: `ZAP-${alert.pluginid}`,
      package_name: alert.name,
      installed_version: `${instances.length} instance${instances.length === 1 ? '' : 's'}`,
      vulnerability_type: alert.riskdesc,
      severity: ZAP_RISK_SEVERITY[Number(alert.riskcode)] || 'Low',
      description: stripHtml(alert.desc) || alert.name,
      fixed_version: 'N/A',
      status: 'Open',
      scanner: 'OWASP ZAP',
      location: instances[0]?.uri || site['@name'],
      detected_at: zapDate,
    });
  }
}

// ---------------------------------------------------------------------------
// Assemble output
// ---------------------------------------------------------------------------
const generatedAt = [trivyDate, wapitiDate, zapDate].sort().pop();

const findingsByType = { SCA: 0, SAST: 0, DAST: 0 };
for (const f of findings) findingsByType[f.type] += 1;

const output = {
  metadata: {
    generated_for: 'OWASP Juice Shop Security Report',
    generated_at: generatedAt,
    projects: [PROJECT],
    total_findings: findings.length,
    findings_by_type: findingsByType,
  },
  findings,
};

writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
console.log(`Wrote ${findings.length} findings to ${OUT_FILE}`);
console.log(findingsByType);
