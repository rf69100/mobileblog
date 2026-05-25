import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BilletService } from '@/services/billetService';
import { formatDate } from '@/lib/utils';
import { isLoggedIn } from '@/lib/auth';
import type { BilletDetail, Commentaire, CurrentUser } from '@/types';

function CommentaireItem({ commentaire }: { commentaire: Commentaire }) {
  const auteur   = commentaire.Auteur ?? 'Anonyme';
  const date     = commentaire.Date ? formatDate(commentaire.Date) : null;
  const initials = auteur.slice(0, 2).toUpperCase();

  return (
    <View className="flex-row gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
      <View className="w-9 h-9 rounded-full bg-violet-100 items-center justify-center shrink-0">
        <Text className="text-xs font-extrabold text-violet-700">{initials}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2.5 mb-1">
          <Text className="text-sm font-bold text-slate-800">{auteur}</Text>
          {date && <Text className="text-xs text-slate-400">{date}</Text>}
        </View>
        <Text className="text-sm text-slate-600 leading-relaxed">{commentaire.Contenu}</Text>
      </View>
    </View>
  );
}

export default function Post() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [billet, setBillet]           = useState<BilletDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [errorMessage, setError]      = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [newComment, setNewComment]   = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    isLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        router.replace('/login');
        return;
      }
      Promise.all([
        BilletService.fetchBilletDetail(id),
        BilletService.fetchCurrentUser(),
      ])
        .then(([billetData, userData]) => {
          setBillet(billetData);
          setCurrentUser(userData);
        })
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    });
  }, [id]);

  async function handleSubmitComment() {
    if (!newComment.trim() || !currentUser) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await BilletService.postCommentaire({
        COM_CONTENU: newComment.trim(),
        billet_id: Number(id),
        user_id: currentUser.id,
      });
      setNewComment('');
      const updated = await BilletService.fetchBilletDetail(id);
      setBillet(updated);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <ActivityIndicator color="#7c3aed" />
        <Text className="text-sm text-slate-400">Chargement…</Text>
      </View>
    );
  }

  const date         = billet?.Date ? formatDate(billet.Date) : null;
  const commentaires = billet?.Commentaires ?? [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerClassName="p-6 pb-12" keyboardShouldPersistTaps="handled">
        <Pressable className="mb-6" onPress={() => router.back()}>
          <Text className="text-sm text-slate-500">← Retour aux billets</Text>
        </Pressable>

        {errorMessage ? (
          <View className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <Text className="font-bold text-red-800">Impossible de charger le billet</Text>
            <Text className="mt-1 text-sm text-red-700 opacity-80">{errorMessage}</Text>
          </View>
        ) : billet ? (
          <View className="gap-8">
            <View className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {date && (
                <Text className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-2.5">
                  {date}
                </Text>
              )}
              <Text className="text-3xl font-extrabold text-slate-900 leading-tight">
                {billet.Titre ?? 'Billet sans titre'}
              </Text>
              {billet.Contenu && (
                <Text className="mt-5 pt-5 border-t border-slate-100 text-base text-slate-600 leading-relaxed">
                  {billet.Contenu}
                </Text>
              )}
            </View>

            <View className="gap-4">
              <View className="flex-row items-center gap-2.5">
                <Text className="text-lg font-bold text-slate-900">Commentaires</Text>
                {commentaires.length > 0 && (
                  <View className="rounded-full bg-violet-100 px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-violet-700">{commentaires.length}</Text>
                  </View>
                )}
              </View>

              {commentaires.length === 0 ? (
                <View className="rounded-xl border border-slate-300 bg-white p-8 items-center">
                  <Text className="text-sm text-slate-400">Aucun commentaire pour ce billet.</Text>
                </View>
              ) : (
                <View className="gap-2.5">
                  {commentaires.map((c, i) => (
                    <CommentaireItem key={String(c.id ?? i)} commentaire={c} />
                  ))}
                </View>
              )}

              {currentUser && (
                <View className="gap-2.5">
                  <TextInput
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 min-h-[80px]"
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Écrire un commentaire…"
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={200}
                  />
                  <Text className="text-xs text-slate-400 self-end">{newComment.length}/200</Text>
                  {submitError && (
                    <Text className="text-xs text-red-600">{submitError}</Text>
                  )}
                  <Pressable
                    className="rounded-xl bg-violet-600 px-5 py-2.5 self-start active:bg-violet-700 disabled:opacity-50"
                    onPress={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting
                      ? <ActivityIndicator color="#ffffff" size="small" />
                      : <Text className="text-sm font-bold text-white">Publier</Text>
                    }
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
