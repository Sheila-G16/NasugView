import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BASE_URL } from '../utils/api';

type Review = {
  id: number;
  username: string;
  business_name: string;
  excellent_rating: number;
  service_rating: number;
  comment: string;
  created_at: string;
  image_path: string | null;
};

export default function Ureviews() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) return;

      setUsername(storedUsername);

      const response = await fetch(`${BASE_URL}/load_user_reviews.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(storedUsername)}`,
      });

      const json = await response.json();

      if (json.success) {
        setReviews(json.reviews);
      } else {
        console.warn('No reviews found.');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reviews</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>Looks like you haven’t left a review yet.</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.card}>
              {review.image_path && (
                <Image
                  source={{ uri: `${BASE_URL}/reviews/${review.image_path}` }}
                  style={styles.image}
                />
              )}
              <View style={styles.content}>
                <Text style={styles.username}>{review.username}</Text>
                <Text style={styles.businessName}>{review.business_name}</Text>
                <Text style={styles.caption}>{review.comment}</Text>
                <Text style={styles.date}>
                  <Ionicons name="calendar-outline" size={14} color="#888" /> {review.created_at}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  noReviews: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40,
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 12,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  businessName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27ae60',
    marginTop: 4,
  },
  caption: {
    marginVertical: 8,
    fontSize: 14,
    color: '#444',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
});
