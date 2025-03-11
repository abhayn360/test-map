import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RootLayout from '../Layout/Rootlayout';
import { useIsFocused } from '@react-navigation/native';

const SavedLocation = () => {
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchSavedLocations = async () => {
      try {
        const storedLocations = await AsyncStorage.getItem('savedLocation');
        console.log('Stored Locations:', storedLocations);

        if (storedLocations) {
          const parsedLocations = JSON.parse(storedLocations);
          if (Array.isArray(parsedLocations)) {
            setSavedLocations(parsedLocations);
          } else {
            setSavedLocations([]); 
          }
        }
      } catch (error) {
        console.error('Error fetching saved locations:', error);
      }
    };

    fetchSavedLocations();
  }, [isFocused]);

  const handleMarkerPress = (location) => {
    setSelectedLocation(location);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Move map to selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleCloseInfo = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setSelectedLocation(null));
  };
console.log('parsedLocations',savedLocations)
  return (
    <RootLayout scrollable={false}>
      <View style={styles.container}>
        {savedLocations.length > 0 ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: savedLocations[0].latitude,
              longitude: savedLocations[0].longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            followsUserLocation
            zoomControlEnabled
          >
            {savedLocations.map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                onPress={() => handleMarkerPress(location)}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="location-off" size={50} color="#ccc" />
            <Text style={styles.noDataText}>No saved locations available</Text>
          </View>
        )}

        {selectedLocation && (
          <Animated.View style={[styles.infoBox, { opacity: fadeAnim }]}>
            <Text style={styles.infoText}>{selectedLocation.name || 'Saved Location'}</Text>
            <TouchableOpacity onPress={handleCloseInfo} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </RootLayout>
  );
};

export default SavedLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  noDataText: {
    marginTop: 10,
    fontSize: 18,
    color: '#777',
  },
  infoBox: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 5,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
