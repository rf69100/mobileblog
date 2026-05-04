import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Post from '@/components/Post';

export default function BilletScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header />
      <Post />
    </SafeAreaView>
  );
}
