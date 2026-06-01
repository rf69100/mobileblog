import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BilletService } from '@/services/billetService';
import { formatDate } from '@/lib/utils';
import type { Billet } from '@/types';

function BilletCard({ billet, index }: { billet: Billet; index: number }) {
  const router  = useRouter();
  const title   = billet.Titre ?? `Billet ${index + 1}`;
  const id      = String(billet.id ?? index + 1);
  const date    = billet.Date ? formatDate(billet.Date) : null;
  const excerpt = billet.Contenu
    ? billet.Contenu.slice(0, 160).trimEnd() + (billet.Contenu.length > 160 ? '…' : '')
    : null;

  return (
    <Pressable
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm active:border-violet-300 active:opacity-90"
      onPress={() => router.push(`/billets/${id}`)}
      accessibilityLabel={`Lire : ${title}`}
    >
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          {date && (
            <Text className="text-xs font-semibold uppercase tracking-wide text-violet-500 mb-1.5">
              {date}
            </Text>
          )}
          <Text className="text-lg font-semibold text-slate-900 leading-snug">{title}</Text>
          {excerpt && (
            <Text className="mt-1.5 text-sm text-slate-500 leading-relaxed" numberOfLines={2}>
              {excerpt}
            </Text>
          )}
        </View>
        <View className="w-9 h-9 rounded-full bg-violet-50 items-center justify-center shrink-0">
          <Text className="text-base text-violet-400">→</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function AllPosts() {
  const [billets, setBillets]    = useState<Billet[]>([]);
  const [errorMessage, setError] = useState<string | null>(null);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    BilletService.fetchBillets()
      .then(setBillets)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator className="mt-10" color="#7c3aed" />;
  }

  return (
    <View>
      <View className="mb-8">
        <View className="self-start flex-row items-center gap-1.5 bg-violet-100 rounded-full px-3 py-1 mb-4">
          <View className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          <Text className="text-xs font-bold text-violet-700">MobileBlog</Text>
        </View>
        <Text className="text-4xl font-extrabold text-slate-900 leading-tight">Derniers billets</Text>
        <Text className="mt-2 text-base text-slate-500">Retrouvez ici des articles publiés</Text>
      </View>

      {errorMessage ? (
        <View className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <Text className="font-bold text-red-800">Impossible de charger les billets</Text>
          <Text className="mt-1 text-sm text-red-700 opacity-80">{errorMessage}</Text>
        </View>
      ) : billets.length === 0 ? (
        <View className="rounded-2xl border border-slate-300 bg-white p-12 items-center">
          <Text className="text-base font-semibold text-slate-500">Aucun billet pour l'instant</Text>
          <Text className="mt-1 text-sm text-slate-400">Revenez bientôt !</Text>
        </View>
      ) : (
        <View className="gap-3">
          {billets.map((billet, index) => (
            <BilletCard key={String(billet.id ?? index)} billet={billet} index={index} />
          ))}
        </View>
      )}
    </View>
  );
}
