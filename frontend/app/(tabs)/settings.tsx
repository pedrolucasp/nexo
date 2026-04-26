import { TouchableOpacity, StyleSheet, FlatList, View } from 'react-native';
import { useState } from 'react';
import ParallaxScrollView from '@/components/misc/parallax-scroll-view';
import { Link } from 'expo-router'

import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Settings() {
  const [options] = useState([
    { id: 'profile', name: 'Perfil', path: '/profile'}
  ])

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const renderItem = ({item}) => (
    <Link key={item.id} href={item.path} asChild style={[styles.item, { color: tintColor }]}>
      <ThemedText>
        {item.name}
      </ThemedText>
    </Link>
  )

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="pink"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Configurações
        </ThemedText>
      </ThemedView>

      {(options.map((opt) => (
        renderItem({ item: opt })
      )))}
    </ParallaxScrollView>
  )
}


const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  item: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc'
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
