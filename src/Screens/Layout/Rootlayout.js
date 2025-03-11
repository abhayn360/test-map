import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  ScrollView,
  View,
} from 'react-native';

const RootLayout = ({ children, scrollable = true, style }) => {
  const scheme = useColorScheme();
  return (
    <SafeAreaView style={{ ...styles.root, ...style }}>
      <StatusBar
        animated
        backgroundColor="#ffffff"
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.root}>{children}</View>
      )}
    </SafeAreaView>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#ffffff',
  },
});
