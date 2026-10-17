import { Banknote, MessageCircle, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

/** "Acheter en toute sérénité": four bordered cards, icon top-right. */
export default function ServiceCards({ deliveryPromise }: { deliveryPromise: string }) {
  const cards: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: Banknote, title: "Paiement à la livraison", text: "Vous payez en espèces quand le colis arrive." },
    { icon: Truck, title: "Livraison partout", text: deliveryPromise },
    { icon: ShieldCheck, title: "Produits garantis", text: "Matériel neuf, testé avant l'envoi." },
    { icon: MessageCircle, title: "Commande sur WhatsApp", text: "Votre récapitulatif part en un clic." },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Acheter en toute sérénité</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, title, text }) => (
          <div key={title} className="relative rounded-md border border-outline-variant p-6 pr-14 min-h-36">
            <Icon size={26} className="absolute top-6 right-6 text-accent" aria-hidden="true" />
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="mt-3 text-sm text-secondary">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
