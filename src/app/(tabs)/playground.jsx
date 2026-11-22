import { ScrollView, StyleSheet, View } from 'react-native';
import NetworkBuilder from '../../components/NetworkBuilder';
import { colors } from '../../theme';

export default function PlaygroundScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>
        <NetworkBuilder />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgLight },
  content: { padding: 16, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 1600 },
});