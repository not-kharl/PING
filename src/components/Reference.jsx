import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { reference } from '../data/reference';
import { colors } from '../theme';

export default function Reference() {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>REFERENCE</Text>
      <Text style={styles.text}>
        {reference.authorLine} ({reference.year}). {reference.title} [
        {reference.type}].
      </Text>
      <Pressable onPress={() => Linking.openURL(reference.url).catch(() => {})}>
        <Text style={styles.link}>{reference.url}</Text>
      </Pressable>
      <Text style={styles.text}>{reference.accessed}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    maxWidth: 320,
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 6,
    padding: 12,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
  },
  text: { fontSize: 11, lineHeight: 16, color: colors.muted, textAlign: 'right' },
  link: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.navy,
    textDecorationLine: 'underline',
    textAlign: 'right',
  },
});