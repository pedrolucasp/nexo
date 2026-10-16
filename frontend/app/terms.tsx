import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useThemeColor } from '@/hooks/use-theme-color';

const WEBSITE_URL = 'https://usenexo.xyz';

export default function TermsScreen() {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ScrollView
      style={{ backgroundColor }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: textColor }]}>
        Termos e Condições
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Um app acadêmico
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        O nexo é um projeto acadêmico, desenvolvido como trabalho de conclusão de
        curso. Ele não é um produto comercial nem um dispositivo médico, e não
        substitui acompanhamento profissional. Em caso de crise, procure ajuda
        médica ou um serviço de emergência.
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Seus dados
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Os registros que você faz aqui são seus. Usamos seus dados apenas para o
        app funcionar: montar o seu histórico, gerar a sua jornada de indicadores
        e enviar os lembretes que você pedir. Não vendemos nem compartilhamos seus
        dados com terceiros.
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Você pode exportar tudo o que registrou a qualquer momento, e pode pedir a
        remoção da sua conta e dos seus dados. O código-fonte é auditável e aberto.
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Saiba mais
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Para saber mais sobre o projeto, visite:
      </Text>

      <TouchableOpacity style={styles.linkWrapper}
                        onPress={() => Linking.openURL(WEBSITE_URL)}>
        <Text style={[styles.link, { color: tintColor }]}>{WEBSITE_URL}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  linkWrapper: {
    marginBottom: 50
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
