import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';


export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {



    setTimeout(() => {
      navigation.replace('HomeTabs');

    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.jpg')}
        style={{ height: 100, width: 100, borderRadius: 10, marginBottom: 10 }}
      />
      <Text style={styles.title}>Maps </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
