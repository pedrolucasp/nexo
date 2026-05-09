import { TouchableOpacity, StyleSheet, Text, SectionList, View, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import ParallaxScrollView from '@/components/misc/parallax-scroll-view';
import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/AuthContext';

const SECTIONS = [
  {
    title: 'Geral',
    data: [{
      title: 'Perfil & Senha',
      path: '/profile'
    }]
  },
  {
    title: 'Sobre',
    data: [
      {
        title: 'Sobre o aplicativo',
        path: '/about'
      },
      {
        title: 'O que acontece com seus dados?',
        path: '/data'
      },
      {
        title: 'Sair',
        path: '/logout',
        logout: true
      }
    ]
  }
]

export default function Settings() {
  const { user, logout } = useAuth();
  const [options] = useState([
    { id: 'profile', name: 'Perfil', path: '/profile'}
  ])

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que quer sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const renderItem = ({item}) => {
    const itemStyle = [
      styles.item,
    ]

    const itemColor = { color: item.logout ? '#FF2C2C' : textColor }

    if (item.logout) {
      return (
        <TouchableOpacity onPress={handleLogout} style={itemStyle}>
          <Text style={itemColor}>
            Sair
          </Text>
        </TouchableOpacity>
      )
    }

    return (
      <View>
        <Link key={item.id} href={item.path} asChild style={itemStyle}>
          <TouchableOpacity>
            <Text style={itemColor}>
              {item.title}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <SectionList
          sections={SECTIONS}
          keyExtractor={(item, index) => item.title + index}
          renderItem={renderItem}
          renderSectionHeader={({section: {title}}) => (
            <ThemedText style={styles.header}>{title}</ThemedText>
          )} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    paddingTop: 10
  },
  item: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  logout: {
    textColor: '#FF2C2C'
  }
});
