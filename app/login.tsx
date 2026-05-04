import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Login from '@/components/Login';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Login />
    </SafeAreaView>
  );
}
