// Profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '../utils/api';

export default function Profile() {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, profileImage: initialProfile, coverImage: initialCover } = route.params as {
    username: string;
    profileImage: string;
    coverImage: string;
  };

  const [profileImage, setProfileImage] = useState(initialProfile);
  const [coverImage, setCoverImage] = useState(initialCover);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'profile' | 'cover' | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewPhotoModalVisible, setViewPhotoModalVisible] = useState(false);
  const [caption, setCaption] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<{ image: string; caption: string; created_at: string }[]>([]);
  const [previewPostImage, setPreviewPostImage] = useState<string | null>(null);

  const imageSource = profileImage ? { uri: `${BASE_URL}/${profileImage}` } : require('../../assets/images/default.png');
  const coverSource = coverImage ? { uri: `${BASE_URL}/${coverImage}` } : require('../../assets/images/default-cover.jpg');

  const showStatusModal = (message: string) => {
    setStatusMessage(message);
    setStatusModalVisible(true);
    setTimeout(() => setStatusModalVisible(false), 1500);
  };

  const pickAndUploadImage = async (type: 'profile' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setUploading(true);
      const imageUri = result.assets[0].uri;
      const uriParts = imageUri.split('/');
      const originalFilename = uriParts[uriParts.length - 1];
      const ext = originalFilename.split('.').pop();
      const filename = `${username}_${type}_${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append('username', username);
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: `image/${ext}`,
      } as any);

      const endpoint = type === 'profile'
        ? `${BASE_URL}/upload_profile.php`
        : `${BASE_URL}/upload_cover.php`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        setUploading(false);

        if (data.success) {
          if (type === 'profile') setProfileImage(data.image);
          else setCoverImage(data.image);
          showStatusModal(`${type === 'profile' ? 'Profile' : 'Cover'} photo updated!`);
        } else {
          showStatusModal(data.message || 'Upload failed.');
        }
      } catch (error: any) {
        setUploading(false);
        showStatusModal(`Upload failed: ${error.message}`);
      }
    }
  };

  const pickPostImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setPostImage(result.assets[0].uri);
    }
  };

  const submitPost = async () => {
    if (!caption.trim() && !postImage) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('caption', caption);
    if (postImage) {
      const uriParts = postImage.split('/');
      const name = uriParts[uriParts.length - 1];
      const ext = name.split('.').pop();
      formData.append('image', {
        uri: postImage,
        name,
        type: `image/${ext}`,
      } as any);
    }

    try {
      const response = await fetch(`${BASE_URL}/upload_post.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUploading(false);

      if (data.success) {
        showStatusModal('Post uploaded!');
        setCaption('');
        setPostImage(null);
        loadPosts();
      } else {
        showStatusModal(data.message || 'Post failed.');
      }
    } catch (err: any) {
      setUploading(false);
      showStatusModal(`Post failed: ${err.message}`);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/load_user_post.php?username=${username}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error('Server error:', data.message);
      }
    } catch (e) {
      console.error('Error loading posts:', e);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => { setSelectedType('cover'); setModalVisible(true); }}>
          <Image source={coverSource} style={styles.coverPhoto} />
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={() => { setSelectedType('profile'); setModalVisible(true); }}>
            <Image source={imageSource} style={styles.profilePhoto} />
          </TouchableOpacity>
          <Text style={styles.postName}>{username}</Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Image source={imageSource} style={styles.inputAvatar} />
            <TextInput
              value={caption}
              onChangeText={setCaption}
              style={styles.inputBox}
              placeholder="What's on your mind?"
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={pickPostImage}>
              <Ionicons name="image" size={24} color="#555" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
          {postImage && (
            <Image source={{ uri: postImage }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 8 }} />
          )}
          <TouchableOpacity onPress={submitPost} style={styles.postButton}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {posts.map((post, index) => (
          <View key={index} style={styles.postCard}>
            {/* Only show image if it exists */}
            {post.image ? (
              <TouchableOpacity onPress={() => setPreviewPostImage(`${BASE_URL}/${post.image}`)}>
                <Image
                  source={{ uri: `${BASE_URL}/${post.image}` }}
                  style={{ width: '100%', height: 200, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
              <Image
                source={imageSource}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
              />
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{username}</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>{new Date(post.created_at).toLocaleDateString()}</Text>
              </View>
            </View>

            <Text style={{ paddingHorizontal: 10, paddingBottom: 5, fontSize: 15 }}>{post.caption}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderTopWidth: 1, borderColor: '#eee' }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="heart-outline" size={20} color="#333" />
                <Text style={{ marginLeft: 5 }}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chatbubble-outline" size={20} color="#333" />
                <Text style={{ marginLeft: 5 }}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="share-social-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Modal visible={!!previewPostImage} transparent animationType="fade">
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setPreviewPostImage(null)}
          >
            {previewPostImage && (
              <Image
                source={{ uri: previewPostImage }}
                style={{ width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 10 }}
              />
            )}
          </TouchableOpacity>
        </Modal>
      </ScrollView>

      {/* Modals */}
      {selectedType && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setViewPhotoModalVisible(true);
              }}>
                <Text style={styles.modalOption}>View Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                pickAndUploadImage(selectedType);
              }}>
                <Text style={styles.modalOption}>Change {selectedType === 'profile' ? 'Profile' : 'Cover'} Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalOption, { color: 'red' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View style={styles.statusOverlay}>
          <View style={styles.statusBox}>
            {uploading && <ActivityIndicator size="large" color="#008000" />}
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={viewPhotoModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.fullscreenOverlay}
          activeOpacity={1}
          onPressOut={() => setViewPhotoModalVisible(false)}
        >
          <View style={styles.fullscreenImageWrapper}>
            <Image
              source={selectedType === 'profile' ? imageSource : coverSource}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 50 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 10, paddingHorizontal: 15,
    backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderColor: '#ddd',
  },
  backButton: { marginRight: 10 },
  topBarTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  coverPhoto: { width: '100%', height: 180 },
  profileInfo: {
    marginTop: -40, flexDirection: 'column',
    alignItems: 'flex-start', paddingHorizontal: 15,
  },
  profilePhoto: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: '#fff',
  },
  postName: {
    fontSize: 18, fontWeight: 'bold',
    marginLeft: 10, color: '#333',
  },
  inputCard: {
    marginTop: 20, marginHorizontal: 20,
    backgroundColor: '#f0f2f5', borderRadius: 10, padding: 10,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputAvatar: {
    width: 36, height: 36, borderRadius: 18, marginRight: 10,
  },
  inputBox: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8,
    fontSize: 14, borderWidth: 1, borderColor: '#ddd',
  },
  postCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20,
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
  },
  modalOption: {
    fontSize: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#eee',
    color: '#008000', textAlign: 'center',
  },
  statusOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  statusBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  postButton: {
    marginTop: 10,
    backgroundColor: '#008000',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
