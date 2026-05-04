import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Register from '@/components/Register';

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Register />
    </SafeAreaView>
  );
}
