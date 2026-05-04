import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BilletService } from '@/app/services/billetService';
import { isLoggedIn } from '@/app/lib/auth';

export default function Header() {
  const router   = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    isLoggedIn().then(setLoggedIn);
  }, [pathname]);

  async function handleLogout() {
    await BilletService.logout();
    setLoggedIn(false);
    router.replace('/');
  }

  return (
    <View className="flex-row items-center justify-between px-6 py-3.5 bg-white border-b border-violet-100">
      <Pressable className="flex-row items-center gap-2" onPress={() => router.push('/')}>
        <View className="w-8 h-8 rounded-lg bg-violet-600 items-center justify-center">
          <Text className="text-white text-[8px] font-extrabold">B2LP</Text>
        </View>
        <Text className="text-base font-bold text-slate-900">MonBlog</Text>
      </Pressable>

      <View className="flex-row items-center gap-2">
        {loggedIn ? (
          <>
            <View className="flex-row items-center gap-1.5 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-200">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-xs font-semibold text-emerald-700">Connecté</Text>
            </View>
            <Pressable
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 active:bg-red-50 active:border-red-200"
              onPress={handleLogout}
            >
              <Text className="text-sm font-semibold text-slate-600">Déconnexion</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable className="px-2 py-1.5" onPress={() => router.push('/login')}>
              <Text className="text-sm font-semibold text-slate-600">Se connecter</Text>
            </Pressable>
            <Pressable
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 active:bg-violet-700"
              onPress={() => router.push('/register')}
            >
              <Text className="text-sm font-semibold text-white">Créer un compte</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
