import React, { useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, PermissionsAndroid, Platform, Alert,
  Text, Dimensions, TouchableOpacity, Linking
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootLayout from '../Layout/Rootlayout';


// Please replace the Google Maps API key in Android > app > src > main > AndroidManifest.xml. since it is a sensitive info  i can't add that. 

const WIDTH = Dimensions.get('screen').width;

const MapPage = () => {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(null); 
  const mapRef = useRef(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your position on the map.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionGranted(true);
        return true;
      } else {
        setPermissionGranted(false);
        showSettingsAlert();
        return false;
      }
    }

    setPermissionGranted(true);
    return true;
  };

  const showSettingsAlert = () => {
    Alert.alert(
      'Location Permission Required',
      'This app needs access to your location. Please enable location services in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings()
        }
      ]
    );
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          setLocation(position.coords);
          const { latitude, longitude } = position.coords;
          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
        },
        error => {
          console.error('Location error:', error);
          setLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 10,
          forceRequestLocation: true,
        }
      );
    };

    fetchLocation();
  }, []);

  const getPlaceName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.display_name || `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
    } catch (error) {
      console.error('Error fetching place name:', error);
      return `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
    }
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const placeName = await getPlaceName(latitude, longitude);
    setSelectedLocation({ latitude, longitude, name: placeName });
  };

  const saveLocation = async () => {
    try {
      const existingData = await AsyncStorage.getItem('savedLocation');
      let locationsArray = existingData ? JSON.parse(existingData) : [];
  
      if (!Array.isArray(locationsArray)) {
        locationsArray = [];
      }
  
      if (!selectedLocation) {
        Alert.alert('Error', 'No location selected to save!');
        return;
      }
  
      locationsArray.push(selectedLocation);
  
      await AsyncStorage.setItem('savedLocation', JSON.stringify(locationsArray));
  
      console.log('Location saved successfully');
      Alert.alert('Success', 'Location saved successfully!');
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location');
    }
  };

  return (
    <RootLayout scrollable={false}>
      <View style={styles.container}>
        {permissionGranted === false ? (
          <View style={styles.permissionDeniedContainer}>
            <Text style={styles.permissionDeniedText}>
              Location permission is required to use this feature.
            </Text>
            <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 37.78825,
              longitude: location?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            followsUserLocation
            zoomControlEnabled
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} title={selectedLocation.name} />
            )}
          </MapView>
        )}

        {selectedLocation && (
          <View style={styles.infoContainer}>
            <Text style={styles.locationText}>{selectedLocation.name}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.Button} onPress={saveLocation}>
                <Text style={styles.loginButtonText}>Save Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </RootLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    width: WIDTH,
    left: 0,
    backgroundColor: 'white',
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    paddingTop: 20,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  Button: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionDeniedText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapPage;
