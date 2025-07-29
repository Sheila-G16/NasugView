import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  Modal, Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { RootStackParamList } from '../navigation/StackNavigator';

type BusinessDetailsRouteProp = RouteProp<RootStackParamList, 'BusinessDetails'>;


const businesses = [
  {
    name: 'Cora RTW Store',
    image: require('../../assets/images/store.jpg'),
    address: 'Brgy. 10 Public Market, Nasugbu, Batangas',
    category: 'Clothes',
    rating: 5,
    latitude: 14.0687,
    longitude: 120.6309,
    phone: '0912-111-1234',
    hours: '9:00 AM – 8:00 PM, Mon to Sat',
  },
  {
    name: 'BernaBeach Resort',
    image: require('../../assets/images/berna.png'),
    address: 'Brgy. Bucana, Nasugbu, Batangas',
    category: 'Resorts',
    rating: 4.9,
    latitude: 14.0686,
    longitude: 120.6256,
    phone: '0912-222-2345',
    hours: 'Open 24 hours',
  },
  {
    name: 'Bulalohan sa Kanto',
    image: require('../../assets/images/bulalo.jpg'),
    address: 'Brgy. 10, Nasugbu, Batangas',
    category: 'Restaurants',
    rating: 4.8,
    latitude: 14.0687,
    longitude: 120.6309,
    phone: '0912-333-3456',
    hours: '10:00 AM – 9:00 PM',
  },
  {
    name: 'RRJ Boutique',
    image: require('../../assets/images/rrj.jpg'),
    address: 'J P Laurel St, Nasugbu, Batangas',
    category: 'Clothes',
    rating: 4.7,
    latitude: 14.0687,
    longitude: 120.6309,
    phone: '0912-444-4567',
    hours: '10:00 AM – 7:00 PM',
  },
  {
    name: 'Golden View Resort',
    image: require('../../assets/images/gold.jpg'),
    address: 'Brgy. Bucana, Nasugbu, Batangas',
    category: 'Resorts',
    rating: 4.6,
    latitude: 14.0732,
    longitude: 120.6252,
    phone: '0912-555-5678',
    hours: 'Open 24 hours',
  },
  {
    name: 'Len Wings',
    image: require('../../assets/images/unli.jpg'),
    address: 'Brgy. Wawa, Nasugbu, Batangas',
    category: 'Restaurants',
    rating: 4.5,
    latitude: 14.067,
    longitude: 120.632,
    phone: '0912-666-6789',
    hours: '11:00 AM – 11:00 PM',
  },
  {
    name: 'Pendong By Rance',
    image: require('../../assets/images/pendong.jpg'),
    address: 'Concepcion St, Nasugbu, Batangas',
    rating: 4.6,
    latitude: 14.071693,
    longitude: 120.633633,
    phone: '0912-777-7890',
    hours: '10:00 AM – 10:00 PM',
  },
];

const dummyReviews = [
  {
    reviewer: 'Lindsay',
    rating: 5,
    comment: 'Amazing service and ambiance!',
  },
  {
    reviewer: 'Sheila',
    rating: 4,
    comment: 'Good place but a bit crowded.',
  },
];

export default function BusinessDetails() {
 const route = useRoute<BusinessDetailsRouteProp>();
const { name, image, address, username } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);


  const business = businesses.find((biz) => biz.name === name);

  if (!business) {
    return <Text style={styles.notFound}>Business not found.</Text>;
  }

// useEffect(() => {
//   console.log('✅ BusinessDetails received username:', route.params?.username);
// }, []);

  
  

  return (
    <ScrollView style={styles.container}>
      {/* 🖼️ Hero Image with Overlay */}
      <View style={styles.heroWrapper}>
        <Image source={business.image} style={styles.heroImage} />
        <View style={styles.overlay} />
        <View style={styles.overlayContent}>
          <Text style={styles.heroName}>{business.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{business.rating} Rating</Text>
            <Text style={styles.reviewCount}> • 2.5k Reviews</Text>
          </View>
          <Text style={styles.heroAddress}>{business.address}</Text>
        </View>
      </View>

      {/* Tabs (static for now) */}
      <View style={styles.tabRow}>
        <Text style={styles.activeTab}>Info</Text>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Review', {
            name: business.name,
            image: business.image,
            address: business.address,
            username: username,
          })
        }
      >
          <Text style={styles.tab}>Reviews</Text>
        </TouchableOpacity>
        <Text style={styles.tab}>More like this</Text>
      </View>
      <View style={styles.separator} />

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoHeaderRow}>
          <Text style={styles.infoHeader}>Info</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.badgeLink}>View All Badges</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoLabel}>Hours</Text>
        <Text style={styles.infoText}>{business.hours}</Text>

        <Text style={[styles.infoLabel, { marginTop: 12 }]}>Call</Text>
        <View style={styles.callRow}>
          <Text style={styles.infoText}>{business.phone}</Text>
          <Ionicons name="call-outline" size={20} color="#2ecc71" style={{ marginLeft: 10 }} />
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: business.latitude,
            longitude: business.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: business.latitude,
              longitude: business.longitude,
            }}
            title={business.name}
            description={business.address}
          />
        </MapView>
      </View>

      <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Badges Earned</Text>
          <Text>🌟 Top Seller</Text>
          <Text>✅ Verified Business</Text>
          <Text>💬 Excellent Reviews</Text>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={{ marginTop: 20, alignSelf: 'flex-end' }}
          >
            <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  notFound: {
    padding: 20,
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  heroWrapper: {
    position: 'relative',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  heroName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  heroAddress: {
    color: '#eee',
    fontSize: 14,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  reviewCount: {
    color: '#ccc',
    marginLeft: 6,
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  tab: {
    fontSize: 14,
    color: '#555',
  },
  activeTab: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007a33',
    borderBottomWidth: 3,
    borderColor: '#007a33',
    paddingBottom: 4,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
  },
  infoSection: {
    padding: 15,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badgeLink: {
    fontSize: 13,
    color: '#008000',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapWrapper: {
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    height: 180,
  },
  map: {
    flex: 1,
  },
  reviewsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 25,
    marginTop: 25,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  reviewHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reviewCard: {
    marginBottom: 15,
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
  },
  reviewerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  comment: {
    fontSize: 14,
    color: '#333',
  },
  reviewButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
