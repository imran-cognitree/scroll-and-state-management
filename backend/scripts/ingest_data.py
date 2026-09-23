import json
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://admin:password@localhost:27017"
DB_NAME = "vulnerabilities_db"
PROJECT = 'juice-shop'

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
REPORTS_DIR = os.path.join(ROOT_DIR, "data", "reports")

def read_json(name):
    path = os.path.join(REPORTS_DIR, name)
    if not os.path.exists(path):
        return {}
    with open(path, 'r') as f:
        return json.load(f)

def norm_severity(raw):
    s = str(raw or '').upper()
    if s in ['CRITICAL', 'BLOCKER']: return 'Critical'
    if s in ['HIGH', 'ERROR']: return 'High'
    if s in ['MEDIUM', 'MAJOR', 'WARNING', 'MODERATE']: return 'Medium'
    return 'Low'

import re
def strip_html(html):
    if not html: return ''
    html = re.sub(r'<br\s*/?>', ' ', html, flags=re.IGNORECASE)
    html = re.sub(r'</p>', ' ', html, flags=re.IGNORECASE)
    html = re.sub(r'<[^>]+>', '', html)
    html = re.sub(r'\s+', ' ', html)
    return html.strip()

async def ingest():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Drop existing to start fresh
    await db.findings.drop()
    
    findings = []
    
    # TRIVY
    trivy = read_json('trivy.json')
    trivy_date = trivy.get("CreatedAt", "2026-09-08T06:34:25.000Z")
    trivy_idx = 0
    for result in trivy.get("Results", []):
        for v in result.get("Vulnerabilities", []):
            trivy_idx += 1
            f = {
                "_id": f"SCA-TRIVY-{str(trivy_idx).zfill(3)}",
                "type": "SCA",
                "project": PROJECT,
                "vulnerability_id": v.get("VulnerabilityID"),
                "package_name": v.get("PkgName"),
                "installed_version": v.get("InstalledVersion"),
                "vulnerability_type": v.get("Title") or (v.get("CweIDs") or [None])[0] or "Vulnerable Dependency",
                "severity": norm_severity(v.get("Severity")),
                "description": v.get("Description") or v.get("Title") or "No description available.",
                "fixed_version": v.get("FixedVersion") or "Not fixed yet",
                "status": "Open",
                "scanner": "Trivy",
                "location": result.get("Target"),
                "detected_at": trivy_date,
                "raw_data": v
            }
            findings.append(f)

    # GRYPE
    grype = read_json('grype.json')
    grype_idx = 0
    for m in grype.get("matches", []):
        grype_idx += 1
        vuln = m.get("vulnerability", {})
        artifact = m.get("artifact", {})
        fix = vuln.get("fix", {})
        fix_versions = fix.get("versions", [])
        
        desc = vuln.get("description", "")
        vuln_type = desc.split('.')[0] if desc else "Vulnerable Dependency"
        
        f = {
            "_id": f"SCA-GRYPE-{str(grype_idx).zfill(3)}",
            "type": "SCA",
            "project": PROJECT,
            "vulnerability_id": vuln.get("id"),
            "package_name": artifact.get("name"),
            "installed_version": artifact.get("version"),
            "vulnerability_type": vuln_type,
            "severity": norm_severity(vuln.get("severity")),
            "description": desc or f"{artifact.get('name')}@{artifact.get('version')} is affected by {vuln.get('id')}.",
            "fixed_version": fix_versions[0] if fix_versions else "Not fixed yet",
            "status": "Open",
            "scanner": "Grype",
            "location": (artifact.get("locations") or [{}])[0].get("path") or artifact.get("purl") or artifact.get("name"),
            "detected_at": trivy_date,
            "raw_data": m
        }
        findings.append(f)
        
    # SEMGREP
    semgrep = read_json('semgrep.json')
    semgrep_idx = 0
    for r in semgrep.get("results", []):
        semgrep_idx += 1
        rule_name = r.get("check_id", "").split('.')[-1]
        extra = r.get("extra", {})
        metadata = extra.get("metadata", {})
        
        f = {
            "_id": f"SAST-SEMGREP-{str(semgrep_idx).zfill(3)}",
            "type": "SAST",
            "project": PROJECT,
            "vulnerability_id": rule_name,
            "package_name": r.get("path"),
            "installed_version": f"Line {r.get('start', {}).get('line')}",
            "vulnerability_type": (metadata.get("owasp") or [None])[0] or rule_name.replace('-', ' '),
            "severity": norm_severity(extra.get("severity")),
            "description": extra.get("message"),
            "fixed_version": "N/A",
            "status": "Open",
            "scanner": "Semgrep",
            "location": f"{r.get('path')}:{r.get('start', {}).get('line')}",
            "detected_at": trivy_date,
            "raw_data": r
        }
        findings.append(f)
        
    # SONARQUBE
    sonarqube = read_json('sonarqube.json')
    sonar_idx = 0
    for issue in sonarqube.get("issues", []):
        if issue.get("type") != "VULNERABILITY": continue
        sonar_idx += 1
        comp = issue.get("component", "").replace(f"{issue.get('project')}:", "")
        rule = issue.get("rule", "")
        
        f = {
            "_id": f"SAST-SONARQUBE-{str(sonar_idx).zfill(3)}",
            "type": "SAST",
            "project": PROJECT,
            "vulnerability_id": rule,
            "package_name": comp,
            "installed_version": f"Line {issue.get('line')}" if issue.get("line") else "N/A",
            "vulnerability_type": rule.split(':')[-1].replace('S', 'Rule ', 1) if rule.startswith('S') else rule.split(':')[-1],
            "severity": norm_severity(issue.get("severity")),
            "description": issue.get("message"),
            "fixed_version": "N/A",
            "status": "Open",
            "scanner": "SonarQube",
            "location": f"{comp}:{issue.get('line')}" if issue.get("line") else comp,
            "detected_at": issue.get("creationDate", trivy_date),
            "raw_data": issue
        }
        findings.append(f)
        
    # WAPITI
    wapiti = read_json('wapiti.json')
    infos = wapiti.get("infos", {})
    wapiti_date = infos.get("date", trivy_date)
    WAPITI_SEVERITY_BY_CATEGORY = {
        'Content Security Policy Configuration': 'Low',
        'Unencrypted Channels': 'Medium',
    }
    wapiti_idx = 0
    for category, entries in wapiti.get("vulnerabilities", {}).items():
        for entry in entries:
            wapiti_idx += 1
            f = {
                "_id": f"DAST-WAPITI-{str(wapiti_idx).zfill(3)}",
                "type": "DAST",
                "project": PROJECT,
                "vulnerability_id": f"WAPITI-{infos.get('version', 'SCAN').replace(' ', '')}-{wapiti_idx}",
                "package_name": category,
                "installed_version": entry.get("method") or "N/A",
                "vulnerability_type": category,
                "severity": WAPITI_SEVERITY_BY_CATEGORY.get(category, "Low"),
                "description": entry.get("info") or f"{category} issue detected on {entry.get('path')}.",
                "fixed_version": "N/A",
                "status": "Open",
                "scanner": "Wapiti",
                "location": entry.get("path"),
                "detected_at": wapiti_date,
                "raw_data": entry
            }
            findings.append(f)
            
    # ZAP
    zap = read_json('zap.json')
    zap_date = zap.get("created", trivy_date)
    ZAP_RISK_SEVERITY = { 3: 'High', 2: 'Medium', 1: 'Low', 0: 'Low' }
    zap_idx = 0
    for site in zap.get("site", []):
        for alert in site.get("alerts", []):
            zap_idx += 1
            instances = alert.get("instances", [])
            f = {
                "_id": f"DAST-ZAP-{str(zap_idx).zfill(3)}",
                "type": "DAST",
                "project": PROJECT,
                "vulnerability_id": f"ZAP-{alert.get('pluginid')}",
                "package_name": alert.get("name"),
                "installed_version": f"{len(instances)} instance{'s' if len(instances) != 1 else ''}",
                "vulnerability_type": alert.get("riskdesc"),
                "severity": ZAP_RISK_SEVERITY.get(int(alert.get("riskcode", 0)), "Low"),
                "description": strip_html(alert.get("desc")) or alert.get("name"),
                "fixed_version": "N/A",
                "status": "Open",
                "scanner": "OWASP ZAP",
                "location": instances[0].get("uri") if instances else site.get("@name"),
                "detected_at": zap_date,
                "raw_data": alert
            }
            findings.append(f)

    if findings:
        await db.findings.insert_many(findings)
        print(f"Inserted {len(findings)} findings into MongoDB.")
    else:
        print("No findings found.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(ingest())
