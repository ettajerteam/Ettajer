"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsPanel } from "@/components/settings/settings-panel";
import type { StoreWithSettings, TicketPrinter } from "@/lib/store-settings";

interface PrinterSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

export function PrinterSettings({ store, onChange, onSave, saving, dirty }: PrinterSettingsProps) {
  const printers = store.settings.ticketPrinters;

  const updatePrinters = (next: TicketPrinter[]) => {
    onChange({
      settings: { ...store.settings, ticketPrinters: next },
    });
  };

  const updatePrinter = (id: string, patch: Partial<TicketPrinter>) => {
    updatePrinters(printers.map((printer) => (printer.id === id ? { ...printer, ...patch } : printer)));
  };

  const addPrinter = () => {
    updatePrinters([
      ...printers,
      {
        id: crypto.randomUUID(),
        name: "New printer",
        location: "",
      },
    ]);
  };

  const removePrinter = (id: string) => {
    if (printers.length <= 1) return;
    updatePrinters(printers.filter((printer) => printer.id !== id));
  };

  return (
    <SettingsPanel
      kicker="Printers"
      title="Ticket stations"
      description="Route order tickets to kitchen, bar, or packing stations. Assign printers on each product."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save printers"
      action={
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addPrinter}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add printer
        </Button>
      }
    >
      <div className="space-y-3">
        {printers.map((printer, index) => (
          <div
            key={printer.id}
            className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                Station {index + 1}
              </p>
              {printers.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-400 hover:text-destructive"
                  onClick={() => removePrinter(printer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Printer name</Label>
                <Input
                  value={printer.name}
                  onChange={(e) => updatePrinter(printer.id, { name: e.target.value })}
                  placeholder="Kitchen"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input
                  value={printer.location ?? ""}
                  onChange={(e) => updatePrinter(printer.id, { location: e.target.value })}
                  placeholder="Back kitchen"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsPanel>
  );
}
