import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type DriverContract = {
  id: string;
  status: 'ACTIVE' | 'LATE' | 'SUSPENDED' | 'TERMINATED';
  monthlyAmount: string;
};

export default function App() {
  const [email, setEmail] = useState('driver@autopartage.ga');
  const [password, setPassword] = useState('password123');
  const [loggedIn, setLoggedIn] = useState(false);

  const contract = useMemo<DriverContract>(
    () => ({ id: 'CTR-001', status: 'ACTIVE', monthlyAmount: '350000 FCFA' }),
    []
  );

  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>AutoPartage Driver</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mot de passe"
          />
          <TouchableOpacity style={styles.button} onPress={() => setLoggedIn(true)}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Espace Chauffeur</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contrat actif</Text>
          <Text>Référence: {contract.id}</Text>
          <Text>Statut: {contract.status}</Text>
          <Text>Mensualité: {contract.monthlyAmount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <Text>• Voir calendrier de paiements</Text>
          <Text>• Signaler un incident</Text>
          <Text>• Voir informations véhicule</Text>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9'
  },
  content: {
    padding: 20,
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  button: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  }
});
