import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import Colors from '../src/theme/colors';

function RootLayoutNav() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const firstSegment = segments[0] as string;
    const inAuthGroup =
      firstSegment === 'login' ||
      firstSegment === 'register' ||
      firstSegment === 'otp-register' ||
      firstSegment === 'otp-login';

    if (!token && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [token, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.bgLight,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp-register" />
      <Stack.Screen name="otp-login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="add-category" />
      <Stack.Screen name="edit-category" />
      <Stack.Screen name="add-transaction" />
      <Stack.Screen name="edit-transaction" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="add-budget" />
      <Stack.Screen name="edit-budget" />
      <Stack.Screen name="wallets" />
      <Stack.Screen name="add-wallet" />
      <Stack.Screen name="edit-wallet" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}