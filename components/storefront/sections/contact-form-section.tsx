import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ContactFormSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { ContactForm } from "@/components/storefront/contact-form";
import { cn } from "@/lib/utils";

interface ContactFormSectionProps {
  store: PublicStore;
  settings: ContactFormSectionSettings;
  previewDevice?: DeviceMode;
}

function isAllowedMapsEmbed(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const full = `${parsed.hostname}${parsed.pathname}`;
    return (
      full.includes("google.com/maps") ||
      parsed.hostname.includes("maps.google.") ||
      parsed.hostname === "www.google.com"
    );
  } catch {
    return false;
  }
}

export function ContactFormSection({ store, settings, previewDevice }: ContactFormSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const isDark =
    visual.backgroundColor?.toLowerCase() === "#0a0a0a" ||
    visual.backgroundColor?.toLowerCase() === "#0f172a" ||
    visual.backgroundColor?.toLowerCase() === "#171717" ||
    visual.textColor?.toLowerCase() === "#e5e5e5" ||
    visual.textColor?.toLowerCase() === "#ffffff" ||
    isBold;

  const title = settings.title?.trim() || "Get in touch";
  const description =
    settings.description?.trim() || "Send a message and we’ll reply as soon as we can.";
  const layout = settings.layout ?? "centered";
  const detailEmail = settings.detailEmail?.trim();
  const detailPhone = settings.detailPhone?.trim();
  const detailHours = settings.detailHours?.trim();
  const detailAddress = settings.detailAddress?.trim();
  const mapEmbedUrl = settings.mapEmbedUrl?.trim();
  const hasDetails = Boolean(detailEmail || detailPhone || detailHours || detailAddress);
  const hasMap = Boolean(mapEmbedUrl && isAllowedMapsEmbed(mapEmbedUrl));
  const useSplit = layout === "split" || hasDetails || hasMap;

  const form = (
    <ContactForm
      storeSlug={store.slug}
      buttonText={settings.buttonText?.trim() || "Send message"}
      showPhone={settings.showPhone !== false}
      variant={isDark ? (isBold ? "bold" : "dark") : "light"}
      className={useSplit ? "mx-0 max-w-none" : undefined}
    />
  );

  const detailItemClass = cn(
    "flex gap-3 text-left text-sm leading-relaxed",
    isDark ? "text-white/70" : "text-neutral-600"
  );
  const detailIconClass = cn("mt-0.5 h-4 w-4 shrink-0", isDark ? "text-white/35" : "text-neutral-400");
  const detailLabelClass = cn(
    "mb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]",
    isDark ? "text-white/40" : "text-neutral-400"
  );

  const detailsPanel =
    hasDetails || hasMap ? (
      <aside className="space-y-8">
        {hasDetails ? (
          <div className="space-y-5">
            <p className={detailLabelClass}>Details</p>
            <ul className="space-y-4">
              {detailEmail ? (
                <li className={detailItemClass}>
                  <Mail className={detailIconClass} aria-hidden />
                  <div>
                    <p className={detailLabelClass}>Email</p>
                    <a
                      href={`mailto:${detailEmail}`}
                      className={cn(
                        "font-medium underline-offset-2 hover:underline",
                        isDark ? "text-white" : "text-neutral-900"
                      )}
                    >
                      {detailEmail}
                    </a>
                  </div>
                </li>
              ) : null}
              {detailPhone ? (
                <li className={detailItemClass}>
                  <Phone className={detailIconClass} aria-hidden />
                  <div>
                    <p className={detailLabelClass}>Phone</p>
                    <a
                      href={`tel:${detailPhone.replace(/\s+/g, "")}`}
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-neutral-900"
                      )}
                    >
                      {detailPhone}
                    </a>
                  </div>
                </li>
              ) : null}
              {detailHours ? (
                <li className={detailItemClass}>
                  <Clock className={detailIconClass} aria-hidden />
                  <div>
                    <p className={detailLabelClass}>Hours</p>
                    <p className={isDark ? "text-white/80" : "text-neutral-800"}>{detailHours}</p>
                  </div>
                </li>
              ) : null}
              {detailAddress ? (
                <li className={detailItemClass}>
                  <MapPin className={detailIconClass} aria-hidden />
                  <div>
                    <p className={detailLabelClass}>Visit</p>
                    <p className={cn("whitespace-pre-line", isDark ? "text-white/80" : "text-neutral-800")}>
                      {detailAddress}
                    </p>
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {hasMap && mapEmbedUrl ? (
          <div>
            <p className={cn(detailLabelClass, "mb-3")}>Find us</p>
            <div
              className={cn(
                "overflow-hidden border bg-neutral-100",
                isModern ? "rounded-sm" : "rounded-2xl",
                isDark ? "border-white/10" : "border-neutral-200"
              )}
            >
              <iframe
                src={mapEmbedUrl}
                title="Store location map"
                className="aspect-[4/3] w-full border-0 sm:aspect-[5/4]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}
      </aside>
    ) : null;

  return (
    <section
      className="px-6 py-16 sm:py-20"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        color: visual.textColor,
      }}
    >
      {useSplit ? (
        <div className={cn("mx-auto", isModern ? "max-w-6xl" : "max-w-5xl")}>
          <div className="mb-10 max-w-xl sm:mb-12">
            <h2
              className={cn(
                "text-2xl font-semibold tracking-tight sm:text-3xl",
                isModern && "tracking-[-0.03em]",
                isDark ? "text-white" : "text-neutral-900"
              )}
              style={{
                color: visual.textColor,
                fontSize: deviceStyles.fontSize ?? visual.fontSize,
                fontWeight: visual.fontWeight,
              }}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed sm:text-[15px]",
                  isDark ? "text-white/50" : "text-neutral-500"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "grid gap-12 lg:gap-16",
              detailsPanel ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-start" : ""
            )}
          >
            <div>{form}</div>
            {detailsPanel}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xl text-center sm:max-w-2xl">
          <h2
            className={cn(
              "mb-3 text-2xl font-semibold tracking-tight sm:text-3xl",
              isModern && "tracking-[-0.03em]",
              isDark ? "text-white" : "text-neutral-900"
            )}
            style={{
              color: visual.textColor,
              fontSize: deviceStyles.fontSize ?? visual.fontSize,
              fontWeight: visual.fontWeight,
            }}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mx-auto mb-10 max-w-md text-sm leading-relaxed sm:text-[15px]",
                isDark ? "text-white/50" : "text-neutral-500"
              )}
            >
              {description}
            </p>
          ) : null}
          {form}
        </div>
      )}
    </section>
  );
}
