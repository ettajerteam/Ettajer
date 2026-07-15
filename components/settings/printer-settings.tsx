"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
import type { StoreWithSettings, TicketPrinter } from "@/lib/store-settings";

interface PrinterSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function PrinterSettings({ store, onChange, onSave, saving }: PrinterSettingsProps) {
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
    <DashboardCardSection
      title="Ticket printers"
      description="Configure kitchen, bar, or station printers. Assign products to a printer so order tickets route to the right station."
      footer={
        <Button type="button" onClick={onSave} loading={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
          Save printers
        </Button>
      }
    >
      <div className="space-y-4">
        {printers.map((printer) => (
          <div key={printer.id} className="rounded-xl border bg-muted/20 p-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Printer name</Label>
                  <Input
                    value={printer.name}
                    onChange={(e) => updatePrinter(printer.id, { name: e.target.value })}
                    placeholder="Kitchen"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location (optional)</Label>
                  <Input
                    value={printer.location ?? ""}
                    onChange={(e) => updatePrinter(printer.id, { location: e.target.value })}
                    placeholder="Back kitchen"
                  />
                </div>
              </div>
              {printers.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removePrinter(printer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addPrinter}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add printer
      </Button>
    </DashboardCardSection>
  );
}
