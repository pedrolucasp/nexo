import { TouchableOpacity, StyleSheet, Text, SectionList, View, StatusBar, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from 'react';
import ParallaxScrollView from '@/components/misc/parallax-scroll-view';
import { Link } from 'expo-router'

import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

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
  const [options] = useState([
    { id: 'profile', name: 'Perfil', path: '/profile'}
  ])

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  console.log(tintColor, textColor)

  const renderItem = ({item}) => {
    const itemStyle = [
      styles.item,
    ]

    const itemColor = { color: item.logout ? '#FF2C2C' : textColor }

    return (
      <View>
        <Link key={item.id} href={item.path} asChild style={itemStyle}>
          <Pressable>
            <Text style={itemColor}>
              {item.title}
            </Text>
          </Pressable>
        </Link>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style='dark' />
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
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16
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
