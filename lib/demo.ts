// Demo-only helpers shared by the checkout (client) and the order rules (server).

/** "Remplir avec des données de test" fills these; never a real person. */
export const TEST_CUSTOMER = { fullName: "Client Démo", phone: "0555 00 00 00" } as const;

/** The shared read-only admin login (role DEMO); its password is DEMO_PASSWORD. */
export const DEMO_EMAIL = "demo@ahmedouael.com";

/** Where the checkout keeps the WhatsApp link for the success page (this tab only). */
export const LAST_ORDER_WHATSAPP_KEY = "volta:lastOrderWhatsApp";
