# Security Policy

The Ethereal Enterprise HRMS team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose findings to us.

## Supported Versions

Only the latest active major releases receive security patches:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a potential security vulnerability within Ethereal Enterprise HRMS, please do **NOT** open a public issue on GitHub. Instead, follow these steps:

1. **Private Vulnerability Report**:
   - Use GitHub's private vulnerability reporting feature: Navigate to **Security** > **Advisories** > **Report a vulnerability**.
   - Alternatively, email the maintainers directly at `security@ethereal-hrms.dev` with the subject `[SECURITY] Potential Vulnerability in Ethereal HRMS`.

2. **Please Include**:
   - A detailed description of the vulnerability.
   - Steps to reproduce the issue (including proof-of-concept scripts or HTTP payloads if applicable).
   - Any affected components (e.g., Go JWT middleware, Supabase RLS bypass, Astro routing).
   - Potential impact on enterprise HR data confidentiality, integrity, or availability.

## Response SLA

- **Initial Response**: Within 48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Disclosure**: Coordinated release schedule with credit given in the release notes.

We kindly request that you give us adequate time to address the issue before making any public disclosures.
