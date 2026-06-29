import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { ThemedView } from '@/components/misc/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  linkText: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
