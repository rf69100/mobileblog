import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BilletService } from '@/services/billetService';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await BilletService.login(email, password);
      router.replace('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="grow items-center justify-center py-12 px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-7">
          <View className="w-12 h-12 rounded-2xl bg-violet-600 items-center justify-center mb-3.5 shadow-lg">
            <Text className="text-white text-lg font-extrabold tracking-tight">MB</Text>
          </View>
          <Text className="text-2xl font-extrabold text-slate-900">Bon retour !</Text>
          <Text className="mt-1 text-sm text-slate-500 text-center">
            Connectez-vous pour accéder aux billets
          </Text>
        </View>

        <View className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 gap-3.5 shadow-sm">
          {error && (
            <View className="flex-row items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <Text className="text-sm text-red-700 mt-0.5">⚠</Text>
              <Text className="flex-1 text-sm text-red-700">{error}</Text>
            </View>
          )}

          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-slate-700">Adresse e-mail</Text>
            <TextInput
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900"
              placeholder="vous@exemple.fr"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-slate-700">Mot de passe</Text>
            <TextInput
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoComplete="current-password"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            className="mt-1 rounded-lg bg-violet-600 py-2.5 items-center active:bg-violet-700 disabled:opacity-60"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#ffffff" size="small" />
              : <Text className="text-sm font-bold text-white">Se connecter</Text>
            }
          </Pressable>
        </View>

        <View className="flex-row items-center mt-5">
          <Text className="text-sm text-slate-500">Pas encore de compte ?{'  '}</Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text className="text-sm font-bold text-violet-600">Créer un compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
