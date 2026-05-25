/**
 * Utilitaires partagés entre les composants.
 * Centralise les fonctions de formatage pour éviter la duplication.
 */

/** Formate une date ISO en date lisible en français (ex : "12 avril 2025"). */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
