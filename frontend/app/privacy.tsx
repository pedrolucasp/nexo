import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useThemeColor } from '@/hooks/use-theme-color';

const WEBSITE_URL = 'https://usenexo.xyz';

export default function PrivacyScreen() {
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
        Política de Privacidade
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        O que coletamos
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Para criar a sua conta, guardamos o seu nome, o seu e-mail e a sua foto de
        perfil, se você enviar uma. Junto disso, guardamos o que você registra no
        app: humores, gatilhos, sono e ações de cuidado, incluindo os horários em
        que foram registrados.
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Se você ativar lembretes, guardamos o token do seu aparelho para enviar as
        notificações.{' '}
        <Text style={styles.emphasis}>
          Nenhum dado é coletado em segundo plano: só registramos o que você
          informa.
        </Text>
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Como usamos
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Seus dados servem para o app funcionar: montar o seu histórico, calcular
        a sua jornada de indicadores, relacionar gatilhos e ações de cuidado e
        enviar os lembretes que você pedir.{' '}
        <Text style={styles.emphasis}>
          Não usamos seus registros para publicidade nem para treinar modelos.
        </Text>
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Com quem compartilhamos
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        <Text style={styles.emphasis}>Não vendemos seus dados.</Text> Compartilhamos
        apenas com os serviços que mantêm o app no ar: envio de e-mails de conta e
        recuperação de senha, notificações push e a hospedagem do banco de dados.
        Esses serviços recebem só o necessário para entregar a mensagem ou
        armazenar a informação.
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Seus direitos
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        <Text style={styles.emphasis}>
          Você pode exportar tudo o que registrou a qualquer momento
        </Text>
        , na própria tela de configurações. Também pode pedir a remoção da sua
        conta e de todos os dados ligados a ela, e a exclusão remove seus registros
        do nosso banco de dados.
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Segurança
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        O acesso aos seus dados exige autenticação, e as senhas são guardadas
        apenas como hash. Ainda assim, o nexo é um projeto acadêmico: trate o app
        como um caderno pessoal e evite registrar informações que não gostaria de
        ver expostas.
      </Text>

      <Text style={[styles.heading, { color: textColor }]}>
        Saiba mais
      </Text>

      <Text style={[styles.body, { color: textColor }]}>
        Para saber mais sobre o projeto e o seu código-fonte aberto, visite:
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
  emphasis: {
    fontWeight: '700',
  },
  linkWrapper: {
    marginBottom: 50
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
