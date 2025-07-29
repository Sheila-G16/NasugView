import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../navigation/StackNavigator';
import { BASE_URL } from '../utils/api';

export default function SubmitReview() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { name, image, address, username } = route.params as {
    name: string;
    image: any;
    address: string;
    username: string;
  };

  const [excellentRating, setExcellentRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [comment, setComment] = useState('');
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log('✅ SubmitReview got the username:', username);
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission denied', 'You need to allow permission to access photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const submitReview = async () => {
    if (
      excellentRating === 0 ||
      serviceRating === 0 ||
      comment.trim() === ''
    ) {
      Alert.alert('Error', 'Please rate all traits and write a comment.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('business_name', name);
      formData.append('excellent_rating', excellentRating.toString());
      formData.append('service_rating', serviceRating.toString());
      formData.append('comment', comment);

      if (pickedImage) {
        const uriParts = pickedImage.split('.');
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        formData.append('image', {
          uri: pickedImage,
          name: `photo.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        } as any);
      }

      const response = await fetch(`${BASE_URL}/submit_review.php`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type here
        },
      });

      const result = await response.json();
      console.log('✅ Response:', result);

      if (result.success) {
        setExcellentRating(0);
        setServiceRating(0);
        setComment('');
        setPickedImage(null);
        setModalVisible(false);
        navigation.goBack(); // or navigation.navigate('Review', { name, ... }) if needed
      } else {
        Alert.alert('Failed', result.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('❌ submitReview error:', error);
      Alert.alert('Error', 'Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.businessHeader}>
          <Image source={image} style={styles.businessImage} />
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{name}</Text>
            <Text style={styles.businessLocation}>📍 {address}</Text>
          </View>
        </View>

        <Text style={styles.heading}>How would you rate your experience?</Text>

        <Text style={styles.label2}>Excellent Quality</Text>
        <View style={styles.starsRow}>
          {[...Array(5)].map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setExcellentRating(i + 1)}>
              <Ionicons
                name={i < excellentRating ? 'star' : 'star-outline'}
                size={28}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label2}>Good Service</Text>
        <View style={styles.starsRow}>
          {[...Array(5)].map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setServiceRating(i + 1)}>
              <Ionicons
                name={i < serviceRating ? 'star' : 'star-outline'}
                size={28}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tell us about your experience?</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder="Write your review..."
          style={styles.input}
        />

        <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.cameraButtonPlain} onPress={pickImage}>
              <Ionicons name="camera-outline" size={45} color="#008000" />
            </TouchableOpacity>
            {pickedImage && (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={{ uri: pickedImage }} style={[styles.imagePreview, { marginLeft: 10 }]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginLeft: 10 }}>
            {loading ? (
              <ActivityIndicator size="large" color="#008000" />
            ) : (
              <TouchableOpacity style={styles.roundSubmitButton} onPress={submitReview}>
                <Text style={styles.roundSubmitText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Image source={{ uri: pickedImage ?? undefined }} style={styles.fullscreenImage} resizeMode="contain" />
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setPickedImage(null);
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },

  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004225',
  },
  businessLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#004225',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#444',
    fontWeight: 'bold',
  },
  label2: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#444',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlignVertical: 'top',
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  roundSubmitButton: {
    backgroundColor: '#008000',
    paddingVertical: 7,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  roundSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraButtonPlain: {
    padding: 2,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    marginTop: 10,
    width: 150,
    height: 150,
    borderRadius: 8,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#008000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
