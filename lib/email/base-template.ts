import {
  getLandingDir,
  getLandingLang,
  isLandingRtl,
  type LandingLocale,
} from "@/lib/landing/landing-i18n";
import { getEmailCopy, type EmailShellCopy } from "@/lib/email/email-i18n";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getAppUrl(): string {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://ettajer.com";
}

export interface EmailKeyValue {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface EmailTableRow {
  left: string;
  right: string;
}

export interface ModernEmailTemplateParams {
  previewText: string;
  title: string;
  brandName?: string;
  badge?: string;
  badgeColor?: string;
  greeting?: string;
  body: string;
  accentFrom?: string;
  accentTo?: string;
  cta?: { label: string; url: string };
  expiryNote?: string;
  steps?: string[];
  keyValues?: EmailKeyValue[];
  table?: { headers: [string, string]; rows: EmailTableRow[] };
  highlight?: { title: string; body: string };
  footerNote: string;
  showHelpLink?: boolean;
  customBlock?: string;
  locale?: LandingLocale;
  shell?: EmailShellCopy;
}

function renderKeyValues(items: EmailKeyValue[], isRtl: boolean): string {
  const labelAlign = isRtl ? "right" : "left";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:24px;direction:${isRtl ? "rtl" : "ltr"};">
      ${items
        .map(
          (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:#737373;font-size:13px;width:110px;vertical-align:top;text-align:${labelAlign};">${escapeHtml(item.label)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;color:${item.highlight ? "#171717" : "#525252"};font-size:14px;font-weight:${item.highlight ? "600" : "400"};line-height:1.5;text-align:${labelAlign};">${escapeHtml(item.value)}</td>
        </tr>`,
        )
        .join("")}
    </table>`;
}

function renderTable(
  headers: [string, string],
  rows: EmailTableRow[],
  isRtl: boolean,
): string {
  const leftAlign = isRtl ? "right" : "left";
  const rightAlign = isRtl ? "left" : "right";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:24px;direction:${isRtl ? "rtl" : "ltr"};">
      <thead>
        <tr>
          <th style="text-align:${leftAlign};padding:0 0 10px;color:#a3a3a3;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(headers[0])}</th>
          <th style="text-align:${rightAlign};padding:0 0 10px;color:#a3a3a3;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(headers[1])}</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;color:#404040;font-size:14px;line-height:1.5;text-align:${leftAlign};">${escapeHtml(row.left)}</td>
            <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;color:#171717;font-size:14px;text-align:${rightAlign};font-weight:500;">${escapeHtml(row.right)}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
}

function renderSteps(steps: string[], shell: EmailShellCopy, isRtl: boolean): string {
  const textAlign = isRtl ? "right" : "left";

  return `
    <div style="margin-top:28px;text-align:${textAlign};direction:${isRtl ? "rtl" : "ltr"};">
      <p style="margin:0 0 14px;color:#737373;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(shell.whatHappensNext)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${steps
          .map(
            (step, index) => `
          <tr>
            <td style="width:30px;vertical-align:top;padding:0 0 12px;">
              <div style="width:22px;height:22px;border-radius:999px;background:#f5f5f5;color:#171717;font-size:11px;font-weight:700;line-height:22px;text-align:center;">${index + 1}</div>
            </td>
            <td style="padding:0 0 12px;color:#525252;font-size:14px;line-height:1.55;text-align:${textAlign};">${escapeHtml(step)}</td>
          </tr>`,
          )
          .join("")}
      </table>
    </div>`;
}

export function buildModernEmailHtml(params: ModernEmailTemplateParams): string {
  const locale = params.locale ?? "en";
  const shell = params.shell ?? getEmailCopy(locale).shell;
  const isRtl = isLandingRtl(locale);
  const dir = getLandingDir(locale);
  const lang = getLandingLang(locale);
  const textAlign = isRtl ? "right" : "center";
  const contentAlign = isRtl ? "right" : "left";

  const brand = params.brandName ?? "Ettajer";
  const accentFrom = params.accentFrom ?? "#3b82f6";
  const accentTo = params.accentTo ?? "#6366f1";
  const year = new Date().getFullYear();

  const badgeHtml = params.badge
    ? `<div style="display:inline-block;margin-bottom:14px;padding:6px 12px;border-radius:999px;background:${params.badgeColor ?? "#eff6ff"};color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(params.badge)}</div>`
    : "";

  const ctaHtml = params.cta
    ? `
      <tr>
        <td style="padding:28px 32px 0;text-align:center;">
          <a href="${params.cta.url}" style="display:inline-block;min-width:220px;padding:14px 28px;border-radius:12px;background:#171717;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
            ${escapeHtml(params.cta.label)}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 0;text-align:center;direction:${dir};">
          <p style="margin:0;color:#a3a3a3;font-size:12px;line-height:1.6;">${escapeHtml(shell.buttonNotWorking)}</p>
          <p style="margin:8px 0 0;word-break:break-all;"><a href="${params.cta.url}" style="color:#3b82f6;font-size:12px;text-decoration:none;">${escapeHtml(params.cta.url)}</a></p>
        </td>
      </tr>`
    : "";

  const highlightHtml = params.highlight
    ? `
      <div style="margin-top:24px;padding:16px 18px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;text-align:${contentAlign};direction:${dir};">
        <p style="margin:0 0 6px;color:#64748b;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(params.highlight.title)}</p>
        <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${params.highlight.body}</p>
      </div>`
    : "";

  const helpLinkHtml =
    params.showHelpLink !== false
      ? `<p style="margin:14px 0 0;color:#a3a3a3;font-size:11px;direction:${dir};">${escapeHtml(shell.needHelp)} <a href="${getAppUrl()}/help" style="color:#3b82f6;text-decoration:none;">${escapeHtml(shell.visitHelpCenter)}</a> · <a href="mailto:support@ettajer.com" style="color:#3b82f6;text-decoration:none;">support@ettajer.com</a></p>`
      : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;direction:${dir};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(params.previewText)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:radial-gradient(circle at top,rgba(59,130,246,0.07),transparent 42%),#f7f7f8;padding:40px 16px;direction:${dir};">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(0,0,0,0.05);border-radius:20px;overflow:hidden;box-shadow:0 12px 40px -12px rgba(0,0,0,0.12);direction:${dir};">
          <tr><td style="height:4px;background:linear-gradient(90deg,${accentFrom},${accentTo});"></td></tr>
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <div style="display:inline-block;padding:10px 14px;border-radius:14px;background:#fafafa;border:1px solid #f0f0f0;color:#171717;font-size:14px;font-weight:700;letter-spacing:-0.02em;">${escapeHtml(brand)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;text-align:${textAlign};">
              ${badgeHtml}
              <h1 style="margin:0;color:#171717;font-size:28px;font-weight:650;letter-spacing:-0.03em;line-height:1.2;">${escapeHtml(params.title)}</h1>
              ${params.greeting ? `<p style="margin:12px 0 0;color:#737373;font-size:15px;line-height:1.6;">${escapeHtml(params.greeting)}</p>` : ""}
              <p style="margin:16px 0 0;color:#525252;font-size:15px;line-height:1.65;">${params.body}</p>
              ${params.customBlock ?? ""}
              ${params.keyValues ? renderKeyValues(params.keyValues, isRtl) : ""}
              ${params.table ? renderTable(params.table.headers, params.table.rows, isRtl) : ""}
              ${highlightHtml}
              ${params.steps ? renderSteps(params.steps, shell, isRtl) : ""}
            </td>
          </tr>
          ${ctaHtml}
          ${params.expiryNote ? `<tr><td style="padding:16px 32px 0;text-align:center;color:#a3a3a3;font-size:12px;line-height:1.5;">${escapeHtml(params.expiryNote)}</td></tr>` : ""}
          <tr>
            <td style="padding:28px 32px 32px;text-align:center;border-top:1px solid #f5f5f5;">
              <p style="margin:0;color:#a3a3a3;font-size:12px;line-height:1.6;">${escapeHtml(params.footerNote)}</p>
              ${helpLinkHtml}
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;color:#a3a3a3;font-size:11px;">© ${year} ${escapeHtml(brand)} · ${escapeHtml(shell.tagline)}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
