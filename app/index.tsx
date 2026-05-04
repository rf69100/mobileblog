import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import AllPosts from '@/components/AllPosts';
import Footer from '@/components/Footer';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header />
      <ScrollView contentContainerClassName="p-6">
        <AllPosts />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}
