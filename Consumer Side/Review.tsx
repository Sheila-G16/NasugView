import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import type { RootStackParamList } from '../navigation/StackNavigator';
import { BASE_URL } from '../utils/api';

type ReviewType = {
  username: string;
  excellent_rating: number;
  service_rating: number;
  comment: string;
  created_at: string;
  image_path?: string;      // for single image string
  images?: string[];        // if multiple images supported
};

export default function Review() {
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { name, image, address, username } = route.params as {
    name: string;
    image: string;
    address: string;
    username: string;
  };

  const [ratingStats, setRatingStats] = useState<number[]>([0, 0, 0, 0, 0]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [selectedTag, setSelectedTag] = useState('All');

  const tags = ['All', 'Good Service', 'Excellent Quality'];

  const fetchReviews = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const response = await fetch(`${BASE_URL}/get_reviews.php?business_name=${encodeURIComponent(name)}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
        setRatingStats(data.star_counts);
      } else {
        console.warn('No reviews found:', data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setTimeout(() => setRefreshing(false), 1000); 
    }
  };

  useEffect(() => {
    fetchReviews();

    const interval = setInterval(() => {
      fetchReviews(true); // silent background refresh
    }, 1000); // every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchReviews()} />
        }
      >     
        <Text style={styles.recommendText}>Do you recommend this business?</Text>
       <View style={styles.recommendButtons}>
  <TouchableOpacity
    style={styles.yesButton}
    onPress={() =>
      navigation.navigate('SubmitReview', {
        name,
        image,
        address,
        username,
      })
    }
  >
    <Text style={styles.buttonText}>Yes</Text>
  </TouchableOpacity>
</View>


        <Text style={styles.sectionTitle}>Reviews</Text>

        <View style={styles.tagFilters}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selectedTag === tag && styles.selectedTag,
              ]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTag === tag && styles.selectedTagText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.filterIcon}>
            <Ionicons name="filter" size={18} color="#008000" />
          </TouchableOpacity>
        </View>

        <View style={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingStats[5 - star] || 0;
            const total = ratingStats.reduce((a, b) => a + b, 0);
            const percent = total > 0 ? (count / total) * 100 : 0;

            return (
              <View key={star} style={styles.barRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: 50 }}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.starLabel}> {star}</Text>
                </View>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.countText}> {count}</Text>
              </View>
            );
          })}
        </View>

        {reviews
          .filter((review) => {
            if (selectedTag === 'All') return true;
            if (selectedTag === 'Good Service') return review.service_rating >= 4;
            if (selectedTag === 'Excellent Quality') return review.excellent_rating >= 4;
            return true;
          })
          .map((review, index) => (
            <View key={`${review.username}-${index}`} style={styles.reviewCard}>
              <Text style={styles.reviewerName}>{review.username}</Text>

              <View style={styles.starsRow}>
                <Text style={{ marginRight: 5 }}>Excellent:</Text>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={`excellent-${review.username}-${i}`}
                    name={i < review.excellent_rating ? 'star' : 'star-outline'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>

              <View style={styles.starsRow}>
                <Text style={{ marginRight: 5 }}>Service:</Text>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={`service-${review.username}-${i}`}
                    name={i < review.service_rating ? 'star' : 'star-outline'}
                    size={20}
                    color="#FFD700"
                  />
                ))}
              </View>

              <Text style={styles.comment}>{review.comment}</Text>

              {/* Optional Image with tap to fullscreen */}
              {review.image_path && (
            <TouchableOpacity
              onPress={() => {
                setSelectedImageUri(review.image_path ?? null);
                setModalVisible(true);
              }}
            >
              <Image
                source={{ uri: review.image_path }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}


            </View>
          ))}
      </ScrollView>

      {/* Fullscreen Modal for Image */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: selectedImageUri || undefined }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  activeTab: {
    fontSize: 14,
    fontWeight: 'bold',
    gap: 25,
    color: '#007a33',
    borderBottomWidth: 2,
    borderColor: '#007a33',
    paddingBottom: 4,
  },
  recommendText: { fontSize: 14, color: '#333', marginBottom: 5 },
  recommendButtons: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  yesButton: {
    backgroundColor: '#008000',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  noButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  overallRating: { alignItems: 'center', marginBottom: 10 },
  ratingNumber: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  starsRow: { flexDirection: 'row', marginVertical: 4 },
  reviewCount: { color: '#999' },
  ratingBreakdown: { marginBottom: 15 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  starLabel: { width: 14, marginRight: 6, fontSize: 12 },
  barBackground: {
    flex: 1,
    backgroundColor: '#eee',
    height: 8,
    borderRadius: 4,
  },
  barFill: {
    backgroundColor: '#008000',
    height: 8,
    borderRadius: 4,
  },
  tagFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#008000',
  },
  selectedTag: {
    backgroundColor: '#008000',
  },
  tagText: { fontSize: 12, color: '#008000' },
  selectedTagText: { color: '#fff' },
  filterIcon: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#008000',
    borderRadius: 15,
  },
  reviewCard: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  reviewerName: { fontWeight: 'bold', marginBottom: 4 },
  comment: { fontSize: 14, color: '#333' },
  imageRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 6, marginTop: 8 },
  seeMore: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#008000',
  },
  countText: {
    width: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '90%',
  },
});
