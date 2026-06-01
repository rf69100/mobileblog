import React from 'react';
import { View, Text } from 'react-native';

export default function Footer() {
  return (
    <View className="mt-14 border-t border-violet-100 bg-white">
      <View className="px-6 py-8 items-center gap-3">
        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 rounded-md bg-violet-600 items-center justify-center">
            <Text className="text-white text-[9px] font-extrabold tracking-tight">MB</Text>
          </View>
          <Text className="text-sm font-semibold text-slate-700">MobileBlog</Text>
        </View>
        <Text className="text-sm text-slate-500 text-center">
          Développé avec ❤️ par moi même — © {new Date().getFullYear()}
        </Text>
      </View>
    </View>
  );
}
