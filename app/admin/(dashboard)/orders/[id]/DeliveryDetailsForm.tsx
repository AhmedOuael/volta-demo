"use client";

import { useState, useTransition } from "react";
import type { CommuneOption } from "@/lib/communes";
import { saveOrderDetails } from "../actions";

type Props = {
  orderId: string;
  editable: boolean;
  wilayaLabel: string;
  deliveryType: "HOME" | "STOP_DESK";
  communeId: string | null;
  address: string | null;
  deliveryFee: number;
  communes: CommuneOption[];
};

const inputClass =
  "w-full bg-transparent border border-outline-variant px-3 py-2.5 text-sm focus:outline-none focus:border-primary disabled:opacity-60";

export default function DeliveryDetailsForm(props: Props) {
  const [deliveryType, setDeliveryType] = useState(props.deliveryType);
  const [communeId, setCommuneId] = useState(props.communeId ?? "");
  const [address, setAddress] = useState(props.address ?? "");
  const [fee, setFee] = useState(String(props.deliveryFee));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  const dirty =
    deliveryType !== props.deliveryType ||
    communeId !== (props.communeId ?? "") ||
    address !== (props.address ?? "") ||
    fee !== String(props.deliveryFee);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startSaving(async () => {
      const result = await saveOrderDetails(props.orderId, { deliveryType, communeId, address, deliveryFee: fee });
      setMessage(result.ok ? { ok: true, text: "Enregistré." } : { ok: false, text: result.error });
    });
  };

  const disabled = !props.editable || saving;

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <span className="text-xs text-secondary block mb-1">Wilaya</span>
        <p className="text-sm">{props.wilayaLabel}</p>
      </div>

      <label className="block">
        <span className="text-xs text-secondary block mb-1">Type de livraison</span>
        <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as Props["deliveryType"])} disabled={disabled} className={inputClass}>
          <option value="HOME">Livraison à domicile</option>
          <option value="STOP_DESK">Bureau de livraison</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-secondary block mb-1">Commune</span>
        {props.communes.length > 0 ? (
          <select value={communeId} onChange={(e) => setCommuneId(e.target.value)} disabled={disabled} className={inputClass}>
            <option value="">— À demander au client —</option>
            {props.communes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-secondary">Pas encore de liste de communes pour cette wilaya : confirmez avec la wilaya{deliveryType === "HOME" ? " et l'adresse" : ""} uniquement.</p>
        )}
      </label>

      <label className="block">
        <span className="text-xs text-secondary block mb-1">
          Adresse {deliveryType === "HOME" ? "(obligatoire pour la livraison à domicile)" : "(facultative)"}
        </span>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={disabled}
          rows={2}
          maxLength={300}
          placeholder="Rue, immeuble, point de repère…"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-xs text-secondary block mb-1">Frais de livraison (DA)</span>
        <input value={fee} onChange={(e) => setFee(e.target.value)} disabled={disabled} inputMode="decimal" className={inputClass} />
      </label>

      {props.editable ? (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-5 py-2.5 bg-primary text-on-primary text-xs font-medium tracking-label uppercase disabled:opacity-40"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {dirty && !saving && <span className="text-xs text-secondary">Modifications non enregistrées</span>}
          {message && <span className={`text-xs ${message.ok ? "text-accent" : "text-error"}`}>{message.text}</span>}
        </div>
      ) : (
        <p className="text-xs text-secondary">Verrouillé : la commande a dépassé l'étape de confirmation.</p>
      )}
    </form>
  );
}
